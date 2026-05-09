/**
 * Catalog API namespace middleware.
 * Enables CORS for all public catalog endpoints under /api/v1/catalog.
 */
import type { MiddlewareConfigFn } from "wasp/server";

export const catalogApiMiddleware: MiddlewareConfigFn = (config) => {
  // Default middleware config already enables CORS for Wasp APIs.
  // We return the default config unchanged since catalog endpoints
  // are public (no auth required) and need CORS for cross-origin
  // access from the landing page.
  return config;
};
