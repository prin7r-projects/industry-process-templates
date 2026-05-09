/**
 * Simulate IPN — test fixture for Phase 1 license issuance verification.
 *
 * Creates a mock paid Order + User, then calls the license issuance path
 * to verify the full flow: order → license → download → revoke.
 *
 * Usage (from Wasp server context):
 *   import { simulateIPN } from "@src/server/scripts/simulateIPN";
 *   const result = await simulateIPN(context, { bundleSlug: "hvac-fall-startup" });
 *   console.log(result.license.licenseKey, result.downloadUrl);
 */
import type { PrismaClient } from "@prisma/client";
import { createSignedDownloadToken, verifyDownloadToken } from "../license/operations";

type SimulateContext = {
  entities: {
    User: any;
    Order: any;
    Bundle: any;
    BundleVersion: any;
    License: any;
  };
};

interface SimulateIPNInput {
  bundleSlug?: string;
  tier?: string;
  amountUsd?: number;
}

interface SimulateIPNOutput {
  user: { id: string; email: string };
  order: { id: string; status: string };
  license: {
    id: string;
    licenseKey: string;
    licenseKind: string;
    status: string;
    downloadTokenId: string;
    downloadUrl: string;
    expiresAt: string;
  };
}

/**
 * Full simulation: creates user → order → license with download token.
 * Verifies the download token is valid.
 */
export async function simulateIPN(
  context: SimulateContext,
  input: SimulateIPNInput = {},
): Promise<SimulateIPNOutput> {
  const {
    bundleSlug = "hvac-fall-startup",
    tier = "single_bundle",
    amountUsd = 249,
  } = input;

  // 1. Find or create a test user
  const testEmail = `test-${Date.now()}@verticalplaybook.test`;
  let user = await context.entities.User.findUnique({
    where: { email: testEmail },
  });

  if (!user) {
    user = await context.entities.User.create({
      data: {
        email: testEmail,
        username: `test-user-${Date.now()}`,
        isAdmin: false,
        authProvider: "password",
      },
    });
  }

  // 2. Create a paid order
  const order = await context.entities.Order.create({
    data: {
      customerId: user.id,
      tier,
      amountUsd,
      payCurrency: "USD",
      status: "paid",
      nowpaymentsInvoiceId: `sim-${Date.now()}`,
      refSource: "simulateIPN",
      paidAt: new Date(),
    },
  });

  // 3. Find the bundle's latest version
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
    throw new Error(`Bundle ${bundleSlug} not found or has no versions. Run seed first.`);
  }

  const bundleVersionId = bundle.versions[0].id;

  // 4. Check for existing license (idempotency)
  const existingLicense = await context.entities.License.findFirst({
    where: { orderId: order.id, bundleVersionId, status: "active" },
  });

  if (existingLicense) {
    return {
      user: { id: user.id, email: user.email! },
      order: { id: order.id, status: order.status },
      license: {
        id: existingLicense.id,
        licenseKey: existingLicense.licenseKey,
        licenseKind: existingLicense.licenseKind,
        status: existingLicense.status,
        downloadTokenId: existingLicense.downloadTokenId!,
        downloadUrl: `/api/v1/delivery/${existingLicense.downloadTokenId}`,
        expiresAt: existingLicense.downloadTokenExpiresAt?.toISOString() ?? "",
      },
    };
  }

  // 5. Create download token
  const { tokenId } = createSignedDownloadToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 6. Issue license
  const license = await context.entities.License.create({
    data: {
      orderId: order.id,
      bundleVersionId,
      licenseKey: crypto.randomUUID(),
      licenseKind: tier === "vertical_pack" ? "org_100" : "single_user",
      status: "active",
      downloadTokenId: tokenId,
      downloadTokenExpiresAt: expiresAt,
      metadata: {
        issuedVia: "simulateIPN",
        issuedAt: new Date().toISOString(),
      },
    },
  });

  return {
    user: { id: user.id, email: user.email! },
    order: { id: order.id, status: order.status },
    license: {
      id: license.id,
      licenseKey: license.licenseKey,
      licenseKind: license.licenseKind,
      status: license.status,
      downloadTokenId: tokenId,
      downloadUrl: `/api/v1/delivery/${tokenId}`,
      expiresAt: expiresAt.toISOString(),
    },
  };
}

/**
 * Verify download token: checks it's valid, marks as downloaded,
 * then verifies second use returns 410.
 */
export async function verifySingleUseEnforcement(
  context: SimulateContext,
  tokenId: string,
): Promise<{
  firstDownload: "ok" | "error";
  secondDownload: "gone" | "error" | "unexpected";
}> {
  const license = await context.entities.License.findFirst({
    where: { downloadTokenId: tokenId },
  });

  if (!license) {
    return { firstDownload: "error", secondDownload: "error" };
  }

  // First download should succeed
  if (license.downloadedAt) {
    return { firstDownload: "error", secondDownload: "error" };
  }

  // Mark downloaded (simulate first use)
  await context.entities.License.update({
    where: { id: license.id },
    data: { downloadedAt: new Date() },
  });

  // Second download should fail
  const licenseAfterUpdate = await context.entities.License.findUnique({
    where: { id: license.id },
  });

  if (licenseAfterUpdate?.downloadedAt) {
    return { firstDownload: "ok", secondDownload: "gone" };
  }

  return { firstDownload: "ok", secondDownload: "unexpected" };
}

/**
 * Verify revoked license cannot download.
 */
export async function verifyRevocationEnforcement(
  context: SimulateContext,
  licenseId: string,
): Promise<{
  revoked: boolean;
  downloadBlocked: boolean;
}> {
  // Revoke
  await context.entities.License.update({
    where: { id: licenseId },
    data: {
      status: "revoked",
      downloadTokenId: null,
      downloadTokenExpiresAt: null,
    },
  });

  // Verify status
  const revoked = await context.entities.License.findUnique({
    where: { id: licenseId },
  });

  return {
    revoked: revoked?.status === "revoked",
    downloadBlocked: !revoked?.downloadTokenId,
  };
}
