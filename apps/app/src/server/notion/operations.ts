/**
 * Notion Sync Operations — Phase 3.
 *
 * Syncs paid orders to a Notion database ("VerticalPlaybook Orders").
 * Uses NOTION_ORDERS_DSID env var for the data source ID.
 * Fire-and-forget — failure does not block the IPN response.
 *
 * Notion API docs: https://developers.notion.com/reference/post-page
 */
import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotionContext = {
  entities: {
    Order: any;
    License: any;
    User: any;
    Bundle: any;
    BundleVersion: any;
    Vertical: any;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEnv(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

interface NotionOrderRow {
  orderId: string;
  customerEmail: string;
  tier: string;
  amountUsd: number;
  currency: string;
  bundleOrVertical: string;
  licenseCount: number;
  licenseKeys: string;
  referralCode: string;
  paidAt: string;
}

/** Sync a paid order to Notion. Fire-and-forget; errors are logged, not thrown. */
export async function syncOrderToNotion(
  context: NotionContext,
  orderId: string,
): Promise<{ synced: boolean; error?: string }> {
  const dsid = getEnv("NOTION_ORDERS_DSID");
  const apiKey = getEnv("NOTION_API_KEY");

  if (!dsid) {
    console.warn("[notion] NOTION_ORDERS_DSID not configured — skipping Notion sync");
    return { synced: false, error: "NOTION_ORDERS_DSID not configured" };
  }

  if (!apiKey) {
    console.warn("[notion] NOTION_API_KEY not configured — skipping Notion sync");
    return { synced: false, error: "NOTION_API_KEY not configured" };
  }

  try {
    // Load order with all relations
    const order = await context.entities.Order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        licenses: {
          include: {
            bundleVersion: {
              include: {
                bundle: {
                  include: {
                    vertical: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order || order.status !== "paid") {
      return { synced: false, error: "Order not found or not paid" };
    }

    const row: NotionOrderRow = {
      orderId: order.id,
      customerEmail: order.customer?.email ?? "unknown",
      tier: order.tier,
      amountUsd: order.amountUsd ?? 0,
      currency: order.payCurrency ?? "USD",
      bundleOrVertical: order.licenses?.[0]?.bundleVersion?.bundle?.vertical?.name ?? order.refSource ?? "unknown",
      licenseCount: order.licenses?.length ?? 0,
      licenseKeys: order.licenses?.map((l: any) => l.licenseKey).join(", ") ?? "",
      referralCode: order.referralCode ?? "",
      paidAt: order.paidAt?.toISOString() ?? new Date().toISOString(),
    };

    // Build Notion page properties
    // This matches a Notion database with the following columns (text type):
    //   Order ID, Customer Email, Tier, Amount, Currency, Vertical/Bundle,
    //   License Count, License Keys, Referral Code, Paid At
    const page = await createNotionPage(apiKey, dsid, row);

    console.log(`[notion] Synced order ${orderId} to Notion page ${page.id}`);
    return { synced: true };
  } catch (err: any) {
    console.error(`[notion] Sync failed for order ${orderId}:`, err?.message ?? err);
    return { synced: false, error: err?.message ?? "unknown error" };
  }
}

interface NotionTextProperty {
  rich_text: Array<{ text: { content: string } }>;
}

interface NotionNumberProperty {
  number: number;
}

/** Create a page in a Notion database. */
async function createNotionPage(
  apiKey: string,
  databaseId: string,
  row: NotionOrderRow,
): Promise<{ id: string }> {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        "Order ID": textProperty(row.orderId),
        "Customer Email": textProperty(row.customerEmail),
        "Tier": textProperty(row.tier),
        "Amount": numberProperty(row.amountUsd),
        "Currency": textProperty(row.currency),
        "Vertical/Bundle": textProperty(row.bundleOrVertical),
        "License Count": numberProperty(row.licenseCount),
        "License Keys": textProperty(row.licenseKeys),
        "Referral Code": textProperty(row.referralCode),
        "Paid At": textProperty(row.paidAt),
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Notion API returned ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

function textProperty(content: string): NotionTextProperty {
  return {
    rich_text: [
      {
        text: { content: content.slice(0, 2000) }, // Notion text limit
      },
    ],
  };
}

function numberProperty(value: number): NotionNumberProperty {
  return { number: value };
}
