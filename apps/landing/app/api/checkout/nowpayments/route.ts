import { NextResponse } from "next/server";
import { appUrlFromRequest, MissingEnvError, optionalEnv, requiredEnv } from "@/lib/env";
import { tiers, type Tier } from "@/lib/tiers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = {
  tierId?: Tier["id"];
  vertical?: string;
};

function tierFromId(id: string | undefined): Tier | undefined {
  if (!id) return undefined;
  return tiers.find((t) => t.id === id);
}

export async function POST(request: Request) {
  let body: CheckoutBody = {};
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    body = {};
  }

  const tier = tierFromId(body.tierId) ?? tiers[0];
  const baseUrl = appUrlFromRequest(request);
  const orderId = `verticalplaybook_${tier.id}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const verticalLabel = body.vertical ? ` — ${body.vertical}` : "";
  const description = `VerticalPlaybook ${tier.name}${verticalLabel}`;

  try {
    const apiKey = requiredEnv("NOWPAYMENTS_API_KEY");
    const sandbox = optionalEnv("NOWPAYMENTS_SANDBOX") === "true";
    const apiBase = sandbox
      ? "https://api-sandbox.nowpayments.io/v1"
      : "https://api.nowpayments.io/v1";

    const invoiceRequest = {
      price_amount: tier.price,
      price_currency: "usd",
      order_id: orderId,
      order_description: description,
      ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
      success_url: `${baseUrl}/?order=${orderId}&status=success`,
      cancel_url: `${baseUrl}/?order=${orderId}&status=cancelled`,
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
      console.error(`[VERTICALPLAYBOOK_CHECKOUT] NOWPayments invoice failed (${response.status}): ${text.slice(0, 500)}`);
      return NextResponse.json(
        {
          ok: false,
          error: "provider-unavailable",
          providerStatus: response.status,
          message: "Checkout provider is unavailable. Please try again in a moment, or email hello@verticalplaybook.",
        },
        { status: 502 },
      );
    }

    const invoiceUrl =
      typeof data.invoice_url === "string"
        ? data.invoice_url
        : typeof data.payment_url === "string"
          ? data.payment_url
          : undefined;

    if (!invoiceUrl) {
      console.error(`[VERTICALPLAYBOOK_CHECKOUT] NOWPayments returned no invoice_url. Body: ${text.slice(0, 500)}`);
      return NextResponse.json(
        { ok: false, error: "provider-shape", message: "Checkout provider returned an unexpected response." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId,
      tierId: tier.id,
      checkoutUrl: invoiceUrl,
      providerReference: typeof data.id === "string" || typeof data.id === "number" ? String(data.id) : undefined,
      mode: sandbox ? "sandbox" : "live",
    });
  } catch (error) {
    if (error instanceof MissingEnvError) {
      return NextResponse.json(
        {
          ok: false,
          error: "configuration",
          missing: error.name,
          message:
            "Checkout is not yet configured on this environment. The deployed environment populates the NOWPayments key on first deploy.",
        },
        { status: 503 },
      );
    }
    console.error("[VERTICALPLAYBOOK_CHECKOUT] unexpected error", error);
    return NextResponse.json(
      { ok: false, error: "unexpected", message: "Unexpected error creating invoice." },
      { status: 500 },
    );
  }
}
