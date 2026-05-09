/**
 * Catalog API — public, no auth required.
 * Implements doc 12 §3.1 endpoints via Wasp API declarations.
 */
import type { Vertical, Bundle, BundleVersion, Template } from "@prisma/client";

// Context type for unauthenticated API handlers
type CatalogContext = {
  entities: {
    Vertical: any;
    Bundle: any;
    BundleVersion: any;
    Template: any;
  };
};

// ─── GET /api/v1/catalog/verticals ────────────────────────────────────────────
//
// Returns all verticals with summary counts.
// Cache: public, max-age=300, stale-while-revalidate=900

export async function catalogVerticals(_req: any, res: any, context: CatalogContext) {
  try {
    const verticals = await context.entities.Vertical.findMany({
      include: {
        bundles: {
          include: {
            versions: {
              orderBy: { publishedAt: "desc" },
              take: 1,
              include: {
                templates: {
                  select: { kind: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = verticals.map((v: any) => {
      const allTemplates = v.bundles.flatMap((b: any) =>
        b.versions.flatMap((ver: any) => ver.templates)
      );
      const kinds = (t: any[], k: string) => t.filter((x: any) => x.kind === k).length;

      return {
        slug: v.slug,
        name: v.name,
        fitDefinition: v.fitDefinition,
        bundleCount: v.bundles.length,
        sopCount: kinds(allTemplates, "sop"),
        automationCount: kinds(allTemplates, "automation"),
        flowCount: kinds(allTemplates, "n8n_flow"),
        promptPackCount: kinds(allTemplates, "prompt_pack"),
      };
    });

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return res.json({ data, error: null });
  } catch (error) {
    console.error("[catalog] GET /verticals failed:", error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to fetch verticals" },
    });
  }
}

// ─── GET /api/v1/catalog/verticals/:slug ──────────────────────────────────────
//
// Returns a single vertical with its bundles and sample SOPs.

export async function catalogVerticalBySlug(req: any, res: any, context: CatalogContext) {
  const { slug } = req.params;

  try {
    const vertical = await context.entities.Vertical.findUnique({
      where: { slug },
      include: {
        bundles: {
          include: {
            versions: {
              orderBy: { publishedAt: "desc" },
              take: 1,
              include: {
                templates: {
                  select: { id: true, kind: true, title: true, metadata: true },
                  take: 5, // sample SOPs
                },
              },
            },
          },
        },
      },
    });

    if (!vertical) {
      return res.status(404).json({
        data: null,
        error: { code: "vertical-not-found", message: `Vertical "${slug}" not found` },
      });
    }

    const bundles = vertical.bundles.map((b: any) => {
      const latestVersion = b.versions[0];
      const templates = latestVersion?.templates ?? [];
      const kinds = (k: string) => templates.filter((t: any) => t.kind === k).length;

      return {
        slug: b.slug,
        title: b.title,
        description: b.description,
        latestVersion: latestVersion?.semver ?? null,
        sopCount: kinds("sop"),
        automationCount: kinds("automation"),
        flowCount: kinds("n8n_flow"),
        promptPackCount: kinds("prompt_pack"),
      };
    });

    const sampleSops = vertical.bundles.flatMap((b: any) => {
      const latestVersion = b.versions[0];
      return (latestVersion?.templates ?? [])
        .filter((t: any) => t.kind === "sop")
        .slice(0, 1) // one sample SOP per bundle
        .map((t: any) => ({
          vertical: vertical.slug,
          bundle: b.slug,
          name: t.title,
          templateId: t.id,
          metadata: t.metadata,
        }));
    });

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return res.json({
      data: {
        slug: vertical.slug,
        name: vertical.name,
        fitDefinition: vertical.fitDefinition,
        bundles,
        sampleSops: sampleSops.slice(0, 3), // max 3
      },
      error: null,
    });
  } catch (error) {
    console.error(`[catalog] GET /verticals/${slug} failed:`, error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to fetch vertical" },
    });
  }
}

// ─── GET /api/v1/catalog/verticals/:slug/bundles ──────────────────────────────
//
// Returns bundle summaries for a vertical.

export async function catalogVerticalBundles(req: any, res: any, context: CatalogContext) {
  const { slug } = req.params;

  try {
    const vertical = await context.entities.Vertical.findUnique({
      where: { slug },
      include: {
        bundles: {
          include: {
            versions: {
              orderBy: { publishedAt: "desc" },
              take: 1,
              include: {
                templates: {
                  select: { kind: true },
                },
              },
            },
          },
        },
      },
    });

    if (!vertical) {
      return res.status(404).json({
        data: null,
        error: { code: "vertical-not-found", message: `Vertical "${slug}" not found` },
      });
    }

    const data = vertical.bundles.map((b: any) => {
      const latestVersion = b.versions[0];
      const templates = latestVersion?.templates ?? [];
      const kinds = (k: string) => templates.filter((t: any) => t.kind === k).length;

      return {
        slug: b.slug,
        title: b.title,
        description: b.description,
        latestVersion: latestVersion?.semver ?? null,
        sopCount: kinds("sop"),
        automationCount: kinds("automation"),
        flowCount: kinds("n8n_flow"),
        promptPackCount: kinds("prompt_pack"),
      };
    });

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return res.json({ data, error: null });
  } catch (error) {
    console.error(`[catalog] GET /verticals/${slug}/bundles failed:`, error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to fetch bundles" },
    });
  }
}

// ─── GET /api/v1/catalog/bundles/:slug ────────────────────────────────────────
//
// Returns full bundle detail: manifest + latest version + pricing + fit definition.

export async function catalogBundleBySlug(req: any, res: any, context: CatalogContext) {
  const { slug } = req.params;

  try {
    const bundle = await context.entities.Bundle.findUnique({
      where: { slug },
      include: {
        vertical: true,
        versions: {
          orderBy: { publishedAt: "desc" },
          include: {
            templates: {
              select: {
                id: true,
                kind: true,
                title: true,
                metadata: true,
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      return res.status(404).json({
        data: null,
        error: { code: "bundle-not-found", message: `Bundle "${slug}" not found` },
      });
    }

    const latestVersion = bundle.versions[0];
    const templates = latestVersion?.templates ?? [];
    const kinds = (k: string) => templates.filter((t: any) => t.kind === k).length;

    const data = {
      slug: bundle.slug,
      title: bundle.title,
      description: bundle.description,
      vertical: {
        slug: bundle.vertical.slug,
        name: bundle.vertical.name,
        fitDefinition: bundle.vertical.fitDefinition,
      },
      latestVersion: latestVersion
        ? {
            semver: latestVersion.semver,
            publishedAt: latestVersion.publishedAt,
            isBreaking: latestVersion.isBreaking,
            changelog: latestVersion.changelog,
            artifactSize: latestVersion.artifactSize,
          }
        : null,
      contents: {
        sops: kinds("sop"),
        automations: kinds("automation"),
        n8nFlows: kinds("n8n_flow"),
        promptPacks: kinds("prompt_pack"),
        total: templates.length,
        items: templates.map((t: any) => ({
          kind: t.kind,
          title: t.title,
          metadata: t.metadata,
        })),
      },
      // Pricing from bundle metadata (stored in vertical.metadata or bundle description)
      pricing: bundle.vertical.metadata &&
        typeof bundle.vertical.metadata === "object" &&
        !Array.isArray(bundle.vertical.metadata)
        ? (bundle.vertical.metadata as any).pricing ?? null
        : null,
    };

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return res.json({ data, error: null });
  } catch (error) {
    console.error(`[catalog] GET /bundles/${slug} failed:`, error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to fetch bundle" },
    });
  }
}

// ─── GET /api/v1/catalog/bundles/:slug/versions ───────────────────────────────
//
// Returns all versions for a bundle.

export async function catalogBundleVersions(req: any, res: any, context: CatalogContext) {
  const { slug } = req.params;

  try {
    const bundle = await context.entities.Bundle.findUnique({ where: { slug } });
    if (!bundle) {
      return res.status(404).json({
        data: null,
        error: { code: "bundle-not-found", message: `Bundle "${slug}" not found` },
      });
    }

    const versions = await context.entities.BundleVersion.findMany({
      where: { bundleSlug: slug },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        semver: true,
        isBreaking: true,
        changelog: true,
        publishedAt: true,
        artifactSize: true,
        _count: { select: { templates: true } },
      },
    });

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return res.json({ data: versions, error: null });
  } catch (error) {
    console.error(`[catalog] GET /bundles/${slug}/versions failed:`, error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to fetch versions" },
    });
  }
}

// ─── GET /api/v1/catalog/bundles/:slug/sample-sop ────────────────────────────
//
// Returns the first SOP template's markdown content for a bundle.
// Used by sample-SOP marketing pages. Public, cached.

export async function catalogSampleSop(req: any, res: any, context: CatalogContext) {
  const { slug } = req.params;

  try {
    const bundle = await context.entities.Bundle.findUnique({
      where: { slug },
      include: {
        vertical: true,
        versions: {
          orderBy: { publishedAt: "desc" },
          take: 1,
          include: {
            templates: {
              where: { kind: "sop" },
              take: 1,
              include: {
                blob: true,
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      return res.status(404).json({
        data: null,
        error: { code: "bundle-not-found", message: `Bundle "${slug}" not found` },
      });
    }

    const latestVersion = bundle.versions[0];
    const sopTemplate = latestVersion?.templates[0];

    if (!sopTemplate || !sopTemplate.blob) {
      return res.status(404).json({
        data: null,
        error: { code: "sop-not-found", message: "No sample SOP available for this bundle" },
      });
    }

    const data = {
      bundleSlug: bundle.slug,
      bundleTitle: bundle.title,
      verticalName: bundle.vertical.name,
      verticalSlug: bundle.vertical.slug,
      sopTitle: sopTemplate.title,
      sopId: sopTemplate.id,
      contentMd: sopTemplate.blob.contentMd,
      sopCount: bundle.sopCount,
      automationCount: bundle.automationCount,
      n8nFlowCount: bundle.n8nFlowCount,
      promptPackCount: bundle.promptPackCount,
    };

    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res.json({ data, error: null });
  } catch (error) {
    console.error(`[catalog] GET /bundles/${slug}/sample-sop failed:`, error);
    return res.status(500).json({
      data: null,
      error: { code: "internal-error", message: "Failed to fetch sample SOP" },
    });
  }
}
