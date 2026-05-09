/**
 * License dashboard operations — Phase 2.
 * Queries for authenticated users to view and manage their licenses.
 */
import { type User } from "wasp/entities";
import { HttpError } from "wasp/server";
import {
  type GetUserLicenses,
  type GetUserLicenseById,
} from "wasp/server/operations";

// ─── getUserLicenses ──────────────────────────────────────────────────────────
//
// Returns all licenses owned by the authenticated user,
// with bundle version and bundle details for dashboard display.

type LicenseWithBundle = {
  id: string;
  createdAt: Date;
  licenseKey: string;
  licenseKind: string;
  status: string;
  expiresAt: Date | null;
  downloadedAt: Date | null;
  downloadTokenExpiresAt: Date | null;
  bundleVersion: {
    id: string;
    semver: string;
    publishedAt: Date;
    artifactSize: number;
    bundle: {
      slug: string;
      title: string;
      description: string | null;
      sopCount: number;
      automationCount: number;
      n8nFlowCount: number;
      promptPackCount: number;
      verticalSlug: string;
    };
  };
  order: {
    id: string;
    tier: string;
    status: string;
    amountUsd: number | null;
    paidAt: Date | null;
  } | null;
};

export const getUserLicenses: GetUserLicenses<void, LicenseWithBundle[]> = async (
  _args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Authentication required");
  }

  const licenses = await context.entities.License.findMany({
    where: {
      order: {
        customerId: context.user.id,
      },
    },
    include: {
      bundleVersion: {
        include: {
          bundle: true,
        },
      },
      order: {
        select: {
          id: true,
          tier: true,
          status: true,
          amountUsd: true,
          paidAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return licenses;
};

// ─── getUserLicenseById ───────────────────────────────────────────────────────
//
// Returns a single license with full details for the update/diff view.

type LicenseDetail = {
  id: string;
  licenseKey: string;
  licenseKind: string;
  status: string;
  downloadedAt: Date | null;
  downloadTokenExpiresAt: Date | null;
  bundleVersion: {
    id: string;
    semver: string;
    publishedAt: Date;
    artifactSize: number;
    bundle: {
      slug: string;
      title: string;
      description: string | null;
      verticalSlug: string;
    };
    templates: {
      id: string;
      kind: string;
      title: string;
    }[];
  };
  // Latest available version for the bundle
  latestVersion: {
    id: string;
    semver: string;
    publishedAt: Date;
    artifactSize: number;
    templates: {
      id: string;
      kind: string;
      title: string;
    }[];
  } | null;
};

export const getUserLicenseById: GetUserLicenseById<
  { licenseId: string },
  LicenseDetail | null
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Authentication required");
  }

  const license = await context.entities.License.findFirst({
    where: {
      id: args.licenseId,
      order: {
        customerId: context.user.id,
      },
    },
    include: {
      bundleVersion: {
        include: {
          bundle: true,
          templates: {
            select: {
              id: true,
              kind: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!license) return null;

  // Find the latest version for this bundle
  const latestVersion = await context.entities.BundleVersion.findFirst({
    where: {
      bundleSlug: license.bundleVersion.bundleSlug,
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      templates: {
        select: {
          id: true,
          kind: true,
          title: true,
        },
      },
    },
  });

  return {
    id: license.id,
    licenseKey: license.licenseKey,
    licenseKind: license.licenseKind,
    status: license.status,
    downloadedAt: license.downloadedAt,
    downloadTokenExpiresAt: license.downloadTokenExpiresAt,
    bundleVersion: {
      id: license.bundleVersion.id,
      semver: license.bundleVersion.semver,
      publishedAt: license.bundleVersion.publishedAt,
      artifactSize: license.bundleVersion.artifactSize,
      bundle: {
        slug: license.bundleVersion.bundle.slug,
        title: license.bundleVersion.bundle.title,
        description: license.bundleVersion.bundle.description,
        verticalSlug: license.bundleVersion.bundle.verticalSlug,
      },
      templates: license.bundleVersion.templates,
    },
    latestVersion: latestVersion
      ? {
          id: latestVersion.id,
          semver: latestVersion.semver,
          publishedAt: latestVersion.publishedAt,
          artifactSize: latestVersion.artifactSize,
          templates: latestVersion.templates,
        }
      : null,
  };
};
