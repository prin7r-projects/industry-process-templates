/**
 * Payments API namespace middleware.
 * Enables CORS for checkout, IPN, and admin refund routes.
 */
import type { MiddlewareConfigFn } from "wasp/server";

export const paymentsApiMiddleware: MiddlewareConfigFn = (config) => {
  return config;
};
