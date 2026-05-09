/**
 * License & Delivery Service — Phase 1.
 * Implements doc 12 §3.4 (bundles + delivery) and §3.5 (n8n tokens, deferred to Phase 3).
 *
 * License issuance: on verified NOWPayments IPN, creates License + download token.
 * Delivery: validates single-use download token, streams artifact from S3.
 * Revocation: admin-only, revokes license and invalidates tokens.
 */
import crypto from "crypto";
import type { License, BundleVersion, Order } from "@prisma/client";

type LicenseContext = {
  entities: {
    License: any;
    Order: any;
    BundleVersion: any;
    User: any;
  };
};

// ─── Delivery signing ─────────────────────────────────────────────────────────

const DELIVERY_SIGNING_KEY = process.env.DELIVERY_SIGNING_KEY || "dev-signing-key-change-in-prod";

/**
 * Create an HMAC-SHA256 signed download token.
 * Format: tokenId.signature
 * - tokenId: UUID v7
 * - signature: HMAC(tokenId, DELIVERY_SIGNING_KEY).hex
 */
export function createSignedDownloadToken(tokenId?: string): {
  tokenId: string;
  token: string;
} {
  const id = tokenId || crypto.randomUUID();
  const sig = crypto
    .createHmac("sha256", DELIVERY_SIGNING_KEY)
    .update(id)
    .digest("hex")
    .slice(0, 16);
  return { tokenId: id, token: `${id}.${sig}` };
}

/**
 * Verify a signed download token.
 * Returns the tokenId if valid, null if invalid.
 */
export function verifyDownloadToken(token: string): string | null {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex < 0) return null;

  const tokenId = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  if (!sig || !tokenId) return null;

  const expectedSig = crypto
    .createHmac("sha256", DELIVERY_SIGNING_KEY)
    .update(tokenId)
    .digest("hex")
    .slice(0, 16);

  // Constant-time comparison to prevent timing attacks.
  // timingSafeEqual requires equal-length buffers; pad or reject if lengths differ.
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length) return null;

  if (crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return tokenId;
  }
  return null;
}

// ─── POST /api/v1/licenses/issue ──────────────────────────────────────────────
//
// Issues a license on verified payment. Called by the IPN handler (Phase 3).
// For Phase 1, this is callable directly for testing with admin-like access.
//
// Body: { orderId: string, bundleVersionId: string, licenseKind?: string }
// Response: { licenseKey, downloadToken, downloadUrl, expiresAt }

export async function issueLicense(req: any, res: any, context: LicenseContext) {
  try {
    const { orderId, bundleVersionId, licenseKind = "single_user" } = req.body;

    if (!orderId || !bundleVersionId) {
      return res.status(400).json({
        data: null,
        error: { code: "invalid-request", message: "orderId and bundleVersionId are required" },
      });
    }

    // Verify order exists and is paid
    const order = await context.entities.Order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        data: null,
        error: { code: "order-not-found", message: `Order "${orderId}" not found` },
      });
    }

    if (order.status !== "paid") {
      return res.status(400).json({
        data: null,
        error: { code: "order-not-paid", message: "Order must be in 'paid' status to issue a license" },
      });
    }

    // Check for existing license for this order + bundle version (idempotency)
    const existingLicense = await context.entities.License.findFirst({
      where: { orderId, bundleVersionId, status: "active" },
    });

    if (existingLicense) {
      // Return existing license — idempotent
      const downloadUrl = existingLicense.downloadTokenId
        ? `/api/v1/delivery/${existingLicense.downloadTokenId}`
        : null;

      return res.json({
        data: {
          licenseKey: existingLicense.licenseKey,
          downloadToken: existingLicense.downloadTokenId,
          downloadUrl,
          expiresAt: existingLicense.downloadTokenExpiresAt,
          licenseId: existingLicense.id,
        },
        error: null,
      });
    }

    // Verify bundle version exists
    const bundleVersion = await context.entities.BundleVersion.findUnique({
      where: { id: bundleVersionId },
    });

    if (!bundleVersion) {
      return res.status(404).json({
        data: null,
        error: { code: "bundle-version-not-found", message: "Bundle version not found" },
      });
    }

    // Create download token (24h TTL)
    const { tokenId, token } = createSignedDownloadToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create license
    const license = await context.entities.License.create({
      data: {
        orderId,
        bundleVersionId,
        licenseKey: crypto.randomUUID(),
        licenseKind,
        status: "active",
        expiresAt: null, // perpetual for single_bundle tier
        downloadTokenId: tokenId,
        downloadTokenExpiresAt: expiresAt,
        metadata: {
          issuedVia: "api",
          issuedAt: new Date().toISOString(),
        },
      },
    });

    return res.status(201).json({
      data: {
        licenseKey: license.licenseKey,
        downloadToken: tokenId,
        downloadUrl: `/api/v1/delivery/${tokenId}`,
        expiresAt: expiresAt.toISOString(),
        licenseId: license.id,
      },
      error: null,
    });
  } catch (error) {
    console.error("[license] issue failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to issue license" },
    });
  }
}

// ─── GET /api/v1/delivery/:tokenId ────────────────────────────────────────────
//
// Validates a download token (single-use, TTL, license active) and streams the
// bundle artifact from S3. Returns 410 Gone on second use.

export async function downloadBundle(req: any, res: any, context: LicenseContext) {
  try {
    const { tokenId } = req.params;

    // Find license by download token
    const license = await context.entities.License.findFirst({
      where: { downloadTokenId: tokenId },
      include: {
        bundleVersion: true,
      },
    });

    if (!license) {
      return res.status(404).json({
        data: null,
        error: { code: "token-not-found", message: "Download token not found" },
      });
    }

    // Check if already downloaded (single-use)
    if (license.downloadedAt) {
      return res.status(410).json({
        data: null,
        error: { code: "token-already-used", message: "This download token has already been used" },
      });
    }

    // Check TTL
    if (license.downloadTokenExpiresAt && new Date() > license.downloadTokenExpiresAt) {
      return res.status(410).json({
        data: null,
        error: { code: "token-expired", message: "Download token has expired" },
      });
    }

    // Check license is active and not revoked
    if (license.status !== "active") {
      return res.status(403).json({
        data: null,
        error: { code: "license-inactive", message: `License is ${license.status}` },
      });
    }

    // Check artifact exists
    if (!license.bundleVersion.artifactS3Key) {
      return res.status(404).json({
        data: null,
        error: { code: "artifact-not-found", message: "Bundle artifact not yet published" },
      });
    }

    // Mark as downloaded
    await context.entities.License.update({
      where: { id: license.id },
      data: { downloadedAt: new Date() },
    });

    // For Phase 1, S3 streaming is deferred until S3 is configured.
    // Return a redirect URL or signed S3 URL once S3 is wired (Phase 3).
    // For now, return metadata so the endpoint shape is verified.
    res.setHeader("X-Bundle-Slug", license.bundleVersion.bundleSlug);
    res.setHeader("X-Bundle-Version", license.bundleVersion.semver);
    res.setHeader("X-Artifact-S3-Key", license.bundleVersion.artifactS3Key);
    res.setHeader("X-License-Key", license.licenseKey);

    return res.json({
      data: {
        message: "Download ready — S3 streaming wired in Phase 3",
        bundleVersion: {
          slug: license.bundleVersion.bundleSlug,
          semver: license.bundleVersion.semver,
          artifactS3Key: license.bundleVersion.artifactS3Key,
          artifactSize: license.bundleVersion.artifactSize,
        },
        license: {
          key: license.licenseKey,
          kind: license.licenseKind,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("[delivery] download failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Download failed" },
    });
  }
}

// ─── POST /api/v1/delivery/refresh-token ──────────────────────────────────────
//
// Mints a fresh download token for an existing license.
// Body: { licenseId: string }
// Response: { downloadToken, downloadUrl, expiresAt }

export async function refreshDownloadToken(req: any, res: any, context: LicenseContext) {
  try {
    const { licenseId } = req.body;

    if (!licenseId) {
      return res.status(400).json({
        data: null,
        error: { code: "invalid-request", message: "licenseId is required" },
      });
    }

    const license = await context.entities.License.findUnique({
      where: { id: licenseId },
    });

    if (!license) {
      return res.status(404).json({
        data: null,
        error: { code: "license-not-found", message: "License not found" },
      });
    }

    if (license.status !== "active") {
      return res.status(403).json({
        data: null,
        error: { code: "license-inactive", message: `License is ${license.status}` },
      });
    }

    const { tokenId } = createSignedDownloadToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await context.entities.License.update({
      where: { id: licenseId },
      data: {
        downloadTokenId: tokenId,
        downloadTokenExpiresAt: expiresAt,
        downloadedAt: null, // reset single-use flag
      },
    });

    return res.json({
      data: {
        downloadToken: tokenId,
        downloadUrl: `/api/v1/delivery/${tokenId}`,
        expiresAt: expiresAt.toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("[delivery] refresh token failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to refresh download token" },
    });
  }
}

// ─── POST /api/v1/admin/licenses/:licenseId/revoke ────────────────────────────
//
// Admin-only: revokes a license, invalidating any active download tokens.
// Body: { reason?: string }

export async function revokeLicense(req: any, res: any, context: LicenseContext) {
  try {
    const { licenseId } = req.params;
    const { reason = "admin-revoked" } = req.body;

    const license = await context.entities.License.findUnique({
      where: { id: licenseId },
    });

    if (!license) {
      return res.status(404).json({
        data: null,
        error: { code: "license-not-found", message: "License not found" },
      });
    }

    if (license.status === "revoked") {
      return res.status(409).json({
        data: null,
        error: { code: "already-revoked", message: "License is already revoked" },
      });
    }

    await context.entities.License.update({
      where: { id: licenseId },
      data: {
        status: "revoked",
        downloadTokenId: null,
        downloadTokenExpiresAt: null,
        metadata: {
          ...((license.metadata as any) || {}),
          revokedAt: new Date().toISOString(),
          revokedReason: reason,
        },
      },
    });

    return res.json({
      data: {
        licenseId,
        status: "revoked",
        reason,
      },
      error: null,
    });
  } catch (error) {
    console.error("[license] revoke failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to revoke license" },
    });
  }
}
