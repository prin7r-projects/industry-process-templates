import crypto from "node:crypto";

/**
 * Constant-time string comparison for hex-encoded signatures.
 */
export function timingSafeEqualHex(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Recursively sort object keys for deterministic JSON serialization.
 * NOWPayments IPN signs HMAC-SHA512 over the sorted-keys JSON of the payload.
 */
export function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Verify NOWPayments IPN signature.
 * `x-nowpayments-sig` = HMAC-SHA512(IPN_SECRET, JSON.stringify(sortObject(payload)))
 */
export function verifyNowpaymentsIpn(
  payload: unknown,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const sorted = JSON.stringify(sortObject(payload));
  const expected = crypto.createHmac("sha512", secret.trim()).update(sorted).digest("hex");
  return timingSafeEqualHex(expected, signature);
}
