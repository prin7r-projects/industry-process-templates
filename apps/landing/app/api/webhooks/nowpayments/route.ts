import { NextResponse } from "next/server";
import { optionalEnv } from "@/lib/env";
import { verifyNowpaymentsIpn } from "@/lib/signatures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * NOWPayments IPN handler.
 * Verifies x-nowpayments-sig (HMAC-SHA512 over sorted-keys JSON) before any state read.
 * v1 in-memory log only — Wave 3 swaps in Postgres via the open-saas fork.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  const signature = request.headers.get("x-nowpayments-sig");
  const secret = optionalEnv("NOWPAYMENTS_IPN_SECRET");

  if (!secret) {
    console.error("[PLUMBLINE_WEBHOOK] NOWPAYMENTS_IPN_SECRET not configured; refusing to accept IPN");
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  const verified = verifyNowpaymentsIpn(payload, signature, secret);

  if (!verified) {
    console.warn(
      `[PLUMBLINE_WEBHOOK] verify_failed payment_id=${payload.payment_id ?? "?"} status=${payload.payment_status ?? "?"}`,
    );
    return NextResponse.json({ ok: false, error: "verify_failed" }, { status: 401 });
  }

  const orderId =
    typeof payload.order_id === "string"
      ? payload.order_id
      : typeof payload.payment_id === "string" || typeof payload.payment_id === "number"
        ? String(payload.payment_id)
        : "unknown";

  const status = typeof payload.payment_status === "string" ? payload.payment_status : "unknown";

  console.log(
    `[PLUMBLINE_WEBHOOK] verified order=${orderId} status=${status} amount=${payload.price_amount ?? "?"}${payload.price_currency ?? ""}`,
  );

  return NextResponse.json({
    ok: true,
    orderId,
    status,
  });
}
