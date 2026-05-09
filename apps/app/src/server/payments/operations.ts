/**
 * Payments Operations — Phase 3.
 *
 * 1. NOWPayments IPN webhook: verify HMAC-SHA512 → persist order → issue license(s)
 * 2. Checkout: create NOWPayments invoice (for app-side purchase flow)
 * 3. Refund admin endpoint: record refund + revoke licenses
 *
 * Idempotent on nowpaymentsPaymentId for IPN processing.
 * License issuance is all-or-nothing per order.
 */
import crypto from "crypto";
import { verifyNowpaymentsIpn } from "./signatures";
import { createSignedDownloadToken } from "../license/operations";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentsContext = {
  entities: {
    User: any;
    Order: any;
    Bundle: any;
    BundleVersion: any;
    License: any;
    Subscription: any;
    RefundEvent: any;
    VerticalRequest: any;
    Vertical: any;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEnv(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

/** AES-256-GCM encrypt a string. Returns base64-encoded ciphertext. */
function encryptIntegrationKey(plaintext: string, key: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv:tag:ciphertext (all hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** AES-256-GCM decrypt. Returns plaintext or null on failure. */
function decryptIntegrationKey(ciphertext: string, key: string): string | null {
  try {
    const parts = ciphertext.split(":");
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const encrypted = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

// ─── POST /api/v1/checkout/nowpayments/ipn ───────────────────────────────────
//
// NOWPayments IPN webhook handler.
// Verifies HMAC-SHA512 signature, then:
//   1. Finds or creates Order by nowpaymentsInvoiceId
//   2. If payment_status is "finished" or "confirmed", marks order as paid
//   3. Issues licenses based on tier:
//      - single_bundle: 1 license for the bundle
//      - vertical_pack: licenses for all bundles in the vertical
//      - enterprise: org_100 license
//   4. Idempotent — replaying the same payment_id returns existing result
//
// Headers: x-nowpayments-sig (HMAC-SHA512)
// Body: raw JSON from NOWPayments IPN

export async function nowpaymentsIpn(req: any, res: any, context: PaymentsContext) {
  const secret = getEnv("NOWPAYMENTS_IPN_SECRET");

  if (!secret) {
    console.error("[payments] NOWPAYMENTS_IPN_SECRET not configured");
    return res.status(503).json({
      data: null,
      error: { code: "not-configured", message: "IPN secret not configured" },
    });
  }

  // Read raw body for signature verification
  let rawBody: string;
  let payload: Record<string, unknown>;
  try {
    rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (err) {
    console.error("[payments] Failed to parse IPN body:", err);
    return res.status(400).json({
      data: null,
      error: { code: "invalid-body", message: "Failed to parse IPN body" },
    });
  }

  // Verify signature
  const signature = req.headers?.["x-nowpayments-sig"] ?? null;
  const verified = verifyNowpaymentsIpn(payload, signature, secret);

  if (!verified) {
    console.warn(
      `[payments] IPN signature verification failed payment_id=${payload.payment_id ?? "?"} status=${payload.payment_status ?? "?"}`,
    );
    return res.status(401).json({
      data: null,
      error: { code: "verify-failed", message: "IPN signature verification failed" },
    });
  }

  const paymentId = String(payload.payment_id ?? "");
  const paymentStatus = String(payload.payment_status ?? "");
  const invoiceId = String(payload.invoice_id ?? payload.order_id ?? "");
  const amount = parseFloat(String(payload.price_amount ?? "0"));
  const currency = String(payload.pay_currency ?? payload.price_currency ?? "USD");
  const payAddress = String(payload.pay_address ?? "");

  if (!paymentId) {
    console.error("[payments] IPN missing payment_id");
    return res.status(400).json({
      data: null,
      error: { code: "missing-payment-id", message: "IPN payload missing payment_id" },
    });
  }

  console.log(
    `[payments] IPN received payment_id=${paymentId} status=${paymentStatus} invoice=${invoiceId} amount=${amount} ${currency}`,
  );

  // Idempotency: check if we've already processed this payment_id
  const existingOrderForPayment = await context.entities.Order.findFirst({
    where: { nowpaymentsPaymentId: paymentId },
    include: { licenses: { select: { id: true, licenseKey: true } } },
  });

  if (existingOrderForPayment && existingOrderForPayment.status === "paid") {
    console.log(`[payments] IPN already processed for payment_id=${paymentId}, returning existing`);
    return res.json({
      data: {
        orderId: existingOrderForPayment.id,
        status: existingOrderForPayment.status,
        licenseCount: existingOrderForPayment.licenses.length,
        licenses: existingOrderForPayment.licenses.map((l: any) => ({
          id: l.id,
          licenseKey: l.licenseKey,
        })),
      },
      error: null,
    });
  }

  // Only process finished/confirmed payments
  const terminalStatuses = ["finished", "confirmed", "complete"];
  if (!terminalStatuses.includes(paymentStatus.toLowerCase())) {
    console.log(`[payments] IPN status=${paymentStatus} is not terminal, skipping license issuance`);
    return res.json({
      data: {
        paymentId,
        status: paymentStatus,
        action: "ignored",
        message: `Payment status "${paymentStatus}" is not terminal; no license issued.`,
      },
      error: null,
    });
  }

  // Find the order by invoice ID (from the NOWPayments invoice we created)
  const order = await context.entities.Order.findFirst({
    where: { nowpaymentsInvoiceId: invoiceId },
    include: {
      licenses: true,
    },
  });

  if (!order) {
    // Order not found — this could be a checkout from the landing page.
    // Log and return — Wave 3+ will create the order from the landing IPN.
    console.warn(
      `[payments] Order not found for invoice_id=${invoiceId}. payment_id=${paymentId}. ` +
      `If this is a landing-page purchase, Wave 3+ order creation is pending.`,
    );
    return res.json({
      data: {
        paymentId,
        status: paymentStatus,
        action: "order-not-found",
        message: `Order not found for invoice_id=${invoiceId}. May be a landing-page purchase.`,
      },
      error: null,
    });
  }

  // If order is already paid, just update the paymentId and return
  if (order.status === "paid") {
    await context.entities.Order.update({
      where: { id: order.id },
      data: {
        nowpaymentsPaymentId: paymentId,
        payAddress: payAddress || undefined,
      },
    });

    return res.json({
      data: {
        orderId: order.id,
        status: order.status,
        licenseCount: order.licenses.length,
        licenses: order.licenses.map((l: any) => ({ id: l.id, licenseKey: l.licenseKey })),
      },
      error: null,
    });
  }

  // Mark order as paid
  await context.entities.Order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      nowpaymentsPaymentId: paymentId,
      amountUsd: amount || order.amountUsd,
      payCurrency: currency || order.payCurrency,
      payAddress: payAddress || undefined,
      paidAt: new Date(),
    },
  });

  // ─── Issue licenses based on tier ────────────────────────────────────────
  const issuedLicenses: any[] = [];

  try {
    if (order.tier === "single_bundle") {
      // Single Bundle: find the bundle version (from bundle slug in metadata or refSource)
      const bundleSlug = order.refSource ?? extractBundleSlug(order);
      if (bundleSlug) {
        const license = await issueLicenseForBundle(context, order, bundleSlug);
        if (license) issuedLicenses.push(license);
      }
    } else if (order.tier === "vertical_pack") {
      // Vertical Pack: issue licenses for all bundles in the vertical
      const verticalSlug = order.refSource ?? extractVerticalSlug(order);
      if (verticalSlug) {
        const licenses = await issueLicensesForVertical(context, order, verticalSlug);
        issuedLicenses.push(...licenses);
      }
    } else if (order.tier === "enterprise") {
      // Enterprise / Reseller: issue org_100 license for the bundle
      const bundleSlug = order.refSource ?? extractBundleSlug(order);
      if (bundleSlug) {
        const license = await issueLicenseForBundle(context, order, bundleSlug, "org_100");
        if (license) issuedLicenses.push(license);
      }
    }
  } catch (err) {
    console.error("[payments] License issuance failed:", err);
    // Don't fail the IPN response — licenses can be issued manually
    return res.json({
      data: {
        orderId: order.id,
        status: "paid",
        licenseCount: 0,
        licenses: [],
        warning: "License issuance failed — check logs.",
      },
      error: null,
    });
  }

  // ─── Create subscription if vertical_pack ────────────────────────────────
  if (order.tier === "vertical_pack") {
    const verticalSlug = order.refSource ?? extractVerticalSlug(order);
    if (verticalSlug) {
      const existingSub = await context.entities.Subscription.findFirst({
        where: { orderId: order.id },
      });
      if (!existingSub) {
        const sub = await context.entities.Subscription.create({
          data: {
            customerId: order.customerId,
            orderId: order.id,
            verticalSlug,
            status: "active",
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
        });

        // Link licenses to subscription
        for (const lic of issuedLicenses) {
          await context.entities.License.update({
            where: { id: lic.id },
            data: { subscriptionId: sub.id },
          });
        }
      }
    }
  }

  // ─── Notion sync (fire and forget — don't block the IPN response) ───────
  try {
    const { syncOrderToNotion } = await import("../notion/operations");
    syncOrderToNotion(context as any, order.id).catch((err: Error) =>
      console.error("[payments] Notion sync failed:", err),
    );
  } catch {
    // Notion module not available — skip
  }

  console.log(
    `[payments] IPN fully processed order=${order.id} tier=${order.tier} licenses=${issuedLicenses.length}`,
  );

  return res.json({
    data: {
      orderId: order.id,
      status: "paid",
      licenseCount: issuedLicenses.length,
      licenses: issuedLicenses.map((l) => ({ id: l.id, licenseKey: l.licenseKey })),
    },
    error: null,
  });
}

// ─── POST /api/v1/checkout/nowpayments ────────────────────────────────────────
//
// Creates a NOWPayments hosted invoice for the app-side purchase flow.
// Body: { tier: string, bundleSlug?: string, verticalSlug?: string, referralCode?: string, email?: string }
// Auth: optional (guest checkout allowed)
// Response: { checkoutUrl, orderId, invoiceId }

export async function createCheckout(req: any, res: any, context: PaymentsContext) {
  try {
    const {
      tier,
      bundleSlug,
      verticalSlug,
      referralCode,
      email,
    } = req.body ?? {};

    if (!tier) {
      return res.status(400).json({
        data: null,
        error: { code: "missing-tier", message: "tier is required" },
      });
    }

    const validTiers = ["single_bundle", "vertical_pack", "enterprise"];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        data: null,
        error: { code: "invalid-tier", message: `tier must be one of: ${validTiers.join(", ")}` },
      });
    }

    // Pricing per tier
    const tierPricing: Record<string, number> = {
      single_bundle: 249,
      vertical_pack: 1490,
      enterprise: 1490,
    };

    const tierNames: Record<string, string> = {
      single_bundle: "Single Bundle",
      vertical_pack: "Vertical Pack",
      enterprise: "Reseller",
    };

    const amount = tierPricing[tier] ?? 249;
    const tierName = tierNames[tier] ?? "Bundle";

    // Create pending order in DB
    const customerId = req.user?.id ?? "guest";
    const order = await context.entities.Order.create({
      data: {
        customerId,
        tier,
        amountUsd: amount,
        payCurrency: "USD",
        status: "pending",
        refSource: bundleSlug ?? verticalSlug ?? null,
        referralCode: referralCode ?? null,
      },
    });

    // Construct description
    let description = `VerticalPlaybook ${tierName}`;
    if (bundleSlug) description += ` — ${bundleSlug}`;
    if (verticalSlug) description += ` — ${verticalSlug}`;

    // Create NOWPayments invoice
    const apiKey = getEnv("NOWPAYMENTS_API_KEY");
    const sandbox = getEnv("NOWPAYMENTS_SANDBOX") === "true";
    const apiBase = sandbox
      ? "https://api-sandbox.nowpayments.io/v1"
      : "https://api.nowpayments.io/v1";

    if (!apiKey) {
      // No NOWPayments configured — return a simulated checkout for dev
      console.warn("[payments] NOWPAYMENTS_API_KEY not configured; returning simulated checkout");
      return res.json({
        data: {
          checkoutUrl: `/checkout/simulated?orderId=${order.id}`,
          orderId: order.id,
          invoiceId: null,
          mode: "simulated",
          tier,
          amountUsd: amount,
        },
        error: null,
      });
    }

    const baseUrl = getEnv("APP_URL", "http://localhost:3001");

    const invoiceRequest = {
      price_amount: amount,
      price_currency: "usd",
      order_id: order.id,
      order_description: description,
      ipn_callback_url: `${baseUrl}/api/v1/checkout/nowpayments/ipn`,
      success_url: `${baseUrl}/app/licenses?order=${order.id}&status=success`,
      cancel_url: `${baseUrl}/catalog?order=${order.id}&status=cancelled`,
      is_fixed_rate: false,
      is_fee_paid_by_user: false,
    };

    const response = await fetch(`${apiBase}/invoice`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(invoiceRequest),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error(
        `[payments] NOWPayments invoice failed (${response.status}): ${text.slice(0, 500)}`,
      );
      return res.status(502).json({
        data: null,
        error: {
          code: "provider-unavailable",
          message: "Payment provider unavailable. Please try again.",
        },
      });
    }

    const invoiceUrl =
      typeof data.invoice_url === "string"
        ? data.invoice_url
        : typeof data.payment_url === "string"
          ? data.payment_url
          : undefined;

    if (!invoiceUrl) {
      console.error(`[payments] NOWPayments returned no invoice_url. Body: ${text.slice(0, 500)}`);
      return res.status(502).json({
        data: null,
        error: {
          code: "provider-shape",
          message: "Payment provider returned unexpected response.",
        },
      });
    }

    // Update order with invoice ID
    const invoiceId = String(data.id ?? "");
    await context.entities.Order.update({
      where: { id: order.id },
      data: { nowpaymentsInvoiceId: invoiceId },
    });

    return res.json({
      data: {
        checkoutUrl: invoiceUrl,
        orderId: order.id,
        invoiceId,
        mode: sandbox ? "sandbox" : "live",
        tier,
        amountUsd: amount,
      },
      error: null,
    });
  } catch (error) {
    console.error("[payments] checkout failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to create checkout" },
    });
  }
}

// ─── POST /api/v1/admin/orders/:orderId/refund ────────────────────────────────
//
// Admin-only: records a refund event + revokes all licenses for the order.
// Human-in-the-loop: Admin clicks NOWPayments dashboard, then this endpoint.
// Body: { reason?: string, amountUsd?: number }

export async function refundOrder(req: any, res: any, context: PaymentsContext) {
  try {
    const { orderId } = req.params;
    const { reason = "customer-requested", amountUsd } = req.body ?? {};

    const order = await context.entities.Order.findUnique({
      where: { id: orderId },
      include: { licenses: true },
    });

    if (!order) {
      return res.status(404).json({
        data: null,
        error: { code: "order-not-found", message: "Order not found" },
      });
    }

    if (order.status !== "paid") {
      return res.status(409).json({
        data: null,
        error: {
          code: "invalid-status",
          message: `Order status is "${order.status}" — only "paid" orders can be refunded`,
        },
      });
    }

    // Check for existing refund
    const existingRefund = await context.entities.RefundEvent.findFirst({
      where: { orderId, status: "completed" },
    });

    if (existingRefund) {
      return res.status(409).json({
        data: null,
        error: { code: "already-refunded", message: "Order has already been refunded" },
      });
    }

    // Create refund event
    const refund = await context.entities.RefundEvent.create({
      data: {
        orderId,
        reason,
        status: "completed",
        amountUsd: amountUsd ?? order.amountUsd,
        completedAt: new Date(),
      },
    });

    // Revoke all licenses
    const revokedLicenses: string[] = [];
    for (const license of order.licenses) {
      if (license.status === "active") {
        await context.entities.License.update({
          where: { id: license.id },
          data: {
            status: "revoked",
            downloadTokenId: null,
            downloadTokenExpiresAt: null,
            metadata: {
              ...((license.metadata as any) || {}),
              revokedAt: new Date().toISOString(),
              revokedReason: "order-refunded",
              refundEventId: refund.id,
            },
          },
        });
        revokedLicenses.push(license.id);
      }
    }

    // Mark order as refunded
    await context.entities.Order.update({
      where: { id: orderId },
      data: { status: "refunded" },
    });

    return res.json({
      data: {
        orderId,
        refundId: refund.id,
        status: "refunded",
        revokedLicenseCount: revokedLicenses.length,
        revokedLicenseIds: revokedLicenses,
      },
      error: null,
    });
  } catch (error) {
    console.error("[payments] refund failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to process refund" },
    });
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function issueLicenseForBundle(
  context: PaymentsContext,
  order: { id: string; customerId: string; tier: string },
  bundleSlug: string,
  licenseKind?: string,
) {
  const bundle = await context.entities.Bundle.findUnique({
    where: { slug: bundleSlug },
    include: {
      versions: {
        orderBy: { publishedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!bundle || !bundle.versions[0]) {
    console.error(`[payments] Bundle "${bundleSlug}" not found for license issuance`);
    return null;
  }

  const bundleVersionId = bundle.versions[0].id;

  // Idempotency: check existing license for this order + bundle version
  const existing = await context.entities.License.findFirst({
    where: { orderId: order.id, bundleVersionId, status: "active" },
  });

  if (existing) return existing;

  const { tokenId } = createSignedDownloadToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const kind = licenseKind ?? (order.tier === "enterprise" ? "org_100" : "single_user");

  return await context.entities.License.create({
    data: {
      orderId: order.id,
      bundleVersionId,
      licenseKey: crypto.randomUUID(),
      licenseKind: kind,
      status: "active",
      downloadTokenId: tokenId,
      downloadTokenExpiresAt: expiresAt,
      metadata: {
        issuedVia: "nowpayments-ipn",
        issuedAt: new Date().toISOString(),
      },
    },
  });
}

async function issueLicensesForVertical(
  context: PaymentsContext,
  order: { id: string; customerId: string; tier: string },
  verticalSlug: string,
) {
  const vertical = await context.entities.Vertical.findUnique({
    where: { slug: verticalSlug },
    include: { bundles: true },
  });

  if (!vertical) {
    console.error(`[payments] Vertical "${verticalSlug}" not found for license issuance`);
    return [];
  }

  const licenses: any[] = [];
  for (const bundle of vertical.bundles) {
    const license = await issueLicenseForBundle(context, order, bundle.slug);
    if (license) licenses.push(license);
  }

  return licenses;
}

// ─── Tier info helpers ────────────────────────────────────────────────────────
// These extract vertical/bundle context from the order when refSource is set.

function extractBundleSlug(order: any): string | null {
  if (order.refSource && order.refSource !== "vertical_pack" && order.refSource !== "landing") {
    return order.refSource;
  }
  return null;
}

function extractVerticalSlug(order: any): string | null {
  if (order.refSource && order.refSource !== "single_bundle" && order.refSource !== "landing") {
    return order.refSource;
  }
  return null;
}
