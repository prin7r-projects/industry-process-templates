#!/usr/bin/env node
/**
 * Bundle build script — produces versioned .zip files from bundle directories.
 *
 * Usage:
 *   node scripts/bundle-build.js <slug>           # Build one bundle
 *   node scripts/bundle-build.js all              # Build all bundles
 *   pnpm -F app bundle:build hvac-fall-startup    # via pnpm filter
 *   pnpm -F app bundle:build all                  # build all
 *
 * Output: data/bundles/<slug>-v<version>.zip
 */

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const ROOT = path.join(__dirname, "..");
const BUNDLES_DIR = path.join(ROOT, "bundles");
const OUTPUT_DIR = path.join(ROOT, "data", "bundles");

function getBundleVersion(slug) {
  const manifestPath = path.join(BUNDLES_DIR, slug, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Bundle not found: ${slug} (missing ${manifestPath})`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  return manifest.version || "1.0.0";
}

function verifyBundleContents(slug) {
  const manifestPath = path.join(BUNDLES_DIR, slug, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const expected = manifest.contents;
  const base = path.join(BUNDLES_DIR, slug);

  const countFiles = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter((f) => !f.startsWith(".")).length;
  };

  const actual = {
    sops: countFiles(path.join(base, "sops")),
    automations: countFiles(path.join(base, "automations")),
    n8nFlows: countFiles(path.join(base, "n8n-flows")),
    promptPacks: countFiles(path.join(base, "prompt-packs")),
  };

  const errors = [];
  if (actual.sops !== expected.sops) {
    errors.push(`SOPs: expected ${expected.sops}, got ${actual.sops}`);
  }
  if (actual.automations !== expected.automations) {
    errors.push(`Automations: expected ${expected.automations}, got ${actual.automations}`);
  }
  if (actual.n8nFlows !== expected.n8nFlows) {
    errors.push(`n8n Flows: expected ${expected.n8nFlows}, got ${actual.n8nFlows}`);
  }
  if (actual.promptPacks !== expected.promptPacks) {
    errors.push(`Prompt Packs: expected ${expected.promptPacks}, got ${actual.promptPacks}`);
  }

  return { valid: errors.length === 0, errors, actual, expected };
}

async function buildBundle(slug) {
  console.log(`\n📦 Building bundle: ${slug}`);

  const version = getBundleVersion(slug);
  const zipName = `${slug}-v${version}.zip`;
  const zipPath = path.join(OUTPUT_DIR, zipName);

  // Verify contents match manifest
  const verification = verifyBundleContents(slug);
  if (!verification.valid) {
    console.error(`  ❌ Content verification failed for ${slug}:`);
    verification.errors.forEach((e) => console.error(`     - ${e}`));
    throw new Error(`Bundle ${slug} content does not match manifest.`);
  }
  console.log(`  ✅ Content counts verified`);

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Build zip using JSZip
  const bundleDir = path.join(BUNDLES_DIR, slug);
  const zip = new JSZip();

  function addDirToZip(zipInstance, dirPath, zipPathPrefix) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const zipPath2 = zipPathPrefix ? `${zipPathPrefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        addDirToZip(zipInstance, fullPath, zipPath2);
      } else {
        const content = fs.readFileSync(fullPath);
        zipInstance.file(zipPath2, content);
      }
    }
  }

  addDirToZip(zip, bundleDir, "");

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "STORE",
  });

  fs.writeFileSync(zipPath, zipBuffer);

  const stats = fs.statSync(zipPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const sizeOK = stats.size >= 1024 * 1024;

  console.log(`  📁 ${zipPath}`);
  console.log(`  📏 Size: ${sizeMB} MB${sizeOK ? " ✅" : " ❌ (must be ≥1 MB)"}`);
  console.log(`  📋 SOPs: ${verification.actual.sops}, Automations: ${verification.actual.automations}, n8n Flows: ${verification.actual.n8nFlows}, Prompt Packs: ${verification.actual.promptPacks}`);

  return { slug, zipPath, sizeMB, sizeOK, ...verification };
}

async function main() {
  const target = process.argv[2];

  if (!target) {
    console.error("Usage: node scripts/bundle-build.js <slug|all>");
    console.error("Available bundles:");
    const dirs = fs.readdirSync(BUNDLES_DIR).filter((d) => {
      return fs.statSync(path.join(BUNDLES_DIR, d)).isDirectory();
    });
    dirs.forEach((d) => console.error(`  - ${d}`));
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let slugs;
  if (target === "all") {
    slugs = fs.readdirSync(BUNDLES_DIR).filter((d) => {
      return fs.statSync(path.join(BUNDLES_DIR, d)).isDirectory();
    });
  } else {
    slugs = [target];
  }

  const results = [];
  let hasErrors = false;

  for (const slug of slugs) {
    try {
      const result = await buildBundle(slug);
      results.push(result);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      hasErrors = true;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Build Summary");
  console.log("=".repeat(60));
  for (const r of results) {
    const status = r.sizeOK ? "✅" : "❌";
    console.log(`  ${status} ${r.slug}: ${r.sizeMB} MB | ${r.actual.sops}S ${r.actual.automations}A ${r.actual.n8nFlows}N ${r.actual.promptPacks}P`);
  }

  if (hasErrors) {
    console.error("\n❌ Some bundles failed to build.");
    process.exit(1);
  }

  console.log("\n✅ All bundles built successfully.");
}

main();
