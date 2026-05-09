/**
 * Catalog seed — populates Vertical, Bundle, BundleVersion, and Template tables
 * from the authored bundle manifests in /bundles/.
 *
 * This mirrors the `pnpm -F app bundle:publish` flow but runs as a database seed
 * so the catalog API returns real data during development.
 */
import fs from "fs";
import path from "path";
import type { PrismaClient } from "@prisma/client";

interface BundleManifest {
  slug: string;
  vertical: string;
  name: string;
  version: string;
  description: string;
  pricing: {
    single: number;
    verticalPack: number;
    reseller: number;
  };
  contents: {
    sops: number;
    automations: number;
    n8nFlows: number;
    promptPacks: number;
  };
  targetRoles: string[];
  estimatedTimeToDeploy: string;
  prerequisites: string[];
}

interface TemplateEntry {
  kind: "sop" | "automation" | "n8n_flow" | "prompt_pack";
  filename: string;
  title: string;
}

function titleFromFilename(filename: string, kind: string): string {
  const withoutExt = filename.replace(/\.(md|json)$/, "");
  // Convert "SOP-001-pre-season-equipment-inventory-audit" → "Pre Season Equipment Inventory Audit"
  const parts = withoutExt.split("-").slice(1); // remove prefix like SOP-001
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function scanBundleDir(bundleDir: string): TemplateEntry[] {
  const entries: TemplateEntry[] = [];

  const subdirs: Record<string, string> = {
    sops: "sop",
    automations: "automation",
    "n8n-flows": "n8n_flow",
    "prompt-packs": "prompt_pack",
  };

  for (const [subdir, kind] of Object.entries(subdirs)) {
    const dirPath = path.join(bundleDir, subdir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md") || f.endsWith(".json"));
      for (const file of files) {
        entries.push({
          kind: kind as TemplateEntry["kind"],
          filename: file,
          title: titleFromFilename(file, kind),
        });
      }
    }
  }

  return entries;
}

export async function seedCatalog(prismaClient: PrismaClient) {
  const bundlesDir = path.resolve(process.cwd(), "../../bundles");
  console.log(`[catalog-seed] Scanning bundles in ${bundlesDir}`);

  const bundleDirs = fs
    .readdirSync(bundlesDir)
    .filter((d) => fs.statSync(path.join(bundlesDir, d)).isDirectory());

  // Collect verticals from all manifests
  const verticalMap = new Map<string, { name: string; fit: string; pricing: any }>();

  for (const dir of bundleDirs) {
    const manifestPath = path.join(bundlesDir, dir, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      console.warn(`[catalog-seed] No manifest.json in ${dir}, skipping`);
      continue;
    }

    const manifest: BundleManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    // Define fit definitions per vertical
    const fitDefs: Record<string, string> = {
      HVAC: "This bundle fits you if you run an HVAC contracting business with 3–25 technicians doing residential or light commercial work. You want to systematize your fall-season startup so every truck rolls out with the same checklist — reducing callbacks, capturing more equipment-replacement leads, and hitting your seasonal revenue targets without burning out your service manager.",
      "Marketing Agency":
        "This bundle fits you if you run a marketing agency with 5–50 retainer clients. You need a repeatable 30-day onboarding sequence that takes every new client from signed proposal to live campaign without the account manager reinventing the process each time. If your team spends more than 2 hours per week per client on onboarding busywork, this bundle pays for itself in the first month.",
      Accounting:
        "This bundle fits you if you work in an accounting firm with 2–50 staff. Your year-end close process is too manual — trial balances come in late, adjusting entries pile up, and the tax prep handoff is a fire drill every December. You want a cadence that starts 90 days out and lands clean financials on the partner's desk before the holiday break.",
    };

    verticalMap.set(manifest.vertical, {
      name: manifest.vertical,
      fit: fitDefs[manifest.vertical] || `${manifest.vertical} industry professionals.`,
      pricing: manifest.pricing,
    });
  }

  // Upsert verticals
  for (const [slug, { name, fit, pricing }] of verticalMap) {
    const verticalSlug = slug.toLowerCase().replace(/\s+/g, "-");
    await prismaClient.vertical.upsert({
      where: { slug: verticalSlug },
      create: {
        slug: verticalSlug,
        name,
        fitDefinition: fit,
        metadata: { pricing },
      },
      update: {
        name,
        fitDefinition: fit,
        metadata: { pricing },
      },
    });
    console.log(`[catalog-seed] Vertical: ${verticalSlug}`);
  }

  // Upsert bundles and their versions
  for (const dir of bundleDirs) {
    const manifestPath = path.join(bundlesDir, dir, "manifest.json");
    if (!fs.existsSync(manifestPath)) continue;

    const manifest: BundleManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const verticalSlug = manifest.vertical.toLowerCase().replace(/\s+/g, "-");
    const templates = scanBundleDir(path.join(bundlesDir, dir));

    // Upsert bundle
    const bundle = await prismaClient.bundle.upsert({
      where: { slug: manifest.slug },
      create: {
        slug: manifest.slug,
        verticalSlug,
        title: manifest.name,
        description: manifest.description,
        sopCount: manifest.contents.sops,
        automationCount: manifest.contents.automations,
        n8nFlowCount: manifest.contents.n8nFlows,
        promptPackCount: manifest.contents.promptPacks,
      },
      update: {
        verticalSlug,
        title: manifest.name,
        description: manifest.description,
        sopCount: manifest.contents.sops,
        automationCount: manifest.contents.automations,
        n8nFlowCount: manifest.contents.n8nFlows,
        promptPackCount: manifest.contents.promptPacks,
      },
    });

    // Check if this version already exists
    const existingVersion = await prismaClient.bundleVersion.findFirst({
      where: { bundleSlug: manifest.slug, semver: manifest.version },
    });

    let version;
    if (existingVersion) {
      version = existingVersion;
      console.log(`[catalog-seed] Bundle ${manifest.slug} v${manifest.version} already exists, skipping templates refresh`);
    } else {
      // Create bundle version
      version = await prismaClient.bundleVersion.create({
        data: {
          bundleSlug: manifest.slug,
          semver: manifest.version,
          changelog: [{ type: "initial", message: "Initial release" }],
          isBreaking: false,
          artifactS3Key: `bundles/${manifest.slug}/${manifest.version}/bundle.zip`,
          artifactSize: 0, // S3 size unknown at seed time
          publishedAt: new Date(),
        },
      });

      // Create templates for this version
      for (const tpl of templates) {
        await prismaClient.template.create({
          data: {
            bundleVersionId: version.id,
            kind: tpl.kind,
            title: tpl.title,
            s3Key: `bundles/${manifest.slug}/${manifest.version}/${tpl.kind}s/${tpl.filename}`,
            metadata: {
              filename: tpl.filename,
              estimatedMinutes: tpl.kind === "sop" ? 15 : tpl.kind === "n8n_flow" ? 5 : tpl.kind === "automation" ? 2 : 10,
              prerequisites: manifest.prerequisites,
              targetRoles: manifest.targetRoles,
            },
          },
        });
      }

      console.log(
        `[catalog-seed] Bundle: ${manifest.slug} v${manifest.version} — ${templates.length} templates`,
      );
    }
  }

  console.log(`[catalog-seed] Done — ${verticalMap.size} verticals seeded`);
}
