/**
 * License/Delivery API namespace middleware.
 * Enables CORS for /api/v1/license and /api/v1/delivery routes.
 */
import type { MiddlewareConfigFn } from "wasp/server";

export const licenseApiMiddleware: MiddlewareConfigFn = (config) => {
  return config;
};
