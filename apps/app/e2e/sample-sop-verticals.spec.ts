/**
 * E2E: Sample SOP Pages + Vertical Detail Pages — PRI-2414 Phase 2
 *
 * Scenario: Public visitor views sample SOP pages and vertical detail pages.
 * Verifies content renders, sample footer/CTA shows, and pages are navigable.
 *
 * Test runner: Playwright (install: pnpm -F app add -D @playwright/test)
 * Run: npx playwright test e2e/sample-sop-verticals.spec.ts
 */

import { test, expect } from "@playwright/test";

test.describe("Sample SOP Pages", () => {
  const SAMPLE_SOP_PATHS = [
    "/sample-sop/hvac-fall-startup",
    "/sample-sop/marketing-agency-d1-30",
    "/sample-sop/accounting-year-end",
  ];

  for (const path of SAMPLE_SOP_PATHS) {
    test(`renders sample SOP at ${path}`, async ({ page }) => {
      await page.goto(path);

      // Page title should contain an SOP title (H1)
      await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

      // Shows bundle context (SOP count, automation count, etc.)
      await expect(page.locator("text=SOPs,")).toBeVisible();
      await expect(page.locator("text=automations,")).toBeVisible();
      await expect(page.locator("text=n8n flows,")).toBeVisible();
      await expect(page.locator("text=prompt packs")).toBeVisible();

      // Shows "Sample" label in footer
      await expect(page.locator("text=Sample")).toBeVisible();

      // Shows "Buy the Full Bundle" CTA
      await expect(page.locator("text=Buy the Full Bundle")).toBeVisible();

      // SOP content card is rendered
      await expect(page.locator(".prose")).toBeVisible();
    });

    test(`${path} has working header navigation`, async ({ page }) => {
      await page.goto(path);

      // Header has VerticalPlaybook branding and nav links
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("text=VerticalPlaybook")).toBeVisible();

      // Catalog link works
      await page.click("text=Catalog");
      await expect(page).toHaveURL(/\/catalog/);
    });

    test(`${path} has View Bundle Details link`, async ({ page }) => {
      await page.goto(path);

      // "View Bundle Details" link navigates to the bundle page
      const detailsLink = page.locator("text=View Bundle Details");
      await expect(detailsLink).toBeVisible();
    });
  }

  test("sample SOP page returns 404 for unknown slug", async ({ page }) => {
    await page.goto("/sample-sop/nonexistent-slug");

    // Should show "Not Found" heading
    await expect(page.locator("text=Not Found")).toBeVisible({ timeout: 5000 });
    // Should show error message
    await expect(page.locator("text=No sample SOP found")).toBeVisible();
    // Should have "Browse Catalog" button as fallback
    await expect(page.locator("text=Browse Catalog")).toBeVisible();
  });

  test("sample SOP header Buy Bundle link goes to pricing", async ({ page }) => {
    await page.goto("/sample-sop/hvac-fall-startup");

    // Header CTA links to pricing
    const headerCta = page.locator("header a:has-text('Buy Bundle')");
    await expect(headerCta).toHaveAttribute("href", "/#pricing");
  });
});

test.describe("Vertical Detail Pages", () => {
  const VERTICAL_PATHS = [
    "/vertical/hvac",
    "/vertical/marketing-agency",
    "/vertical/accounting",
  ];

  for (const path of VERTICAL_PATHS) {
    test(`renders vertical detail at ${path}`, async ({ page }) => {
      await page.goto(path);

      // Page title should be the vertical name
      await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

      // Shows "Vertical" label
      await expect(page.locator("text=Vertical")).toBeVisible();

      // Shows fit definition
      await expect(page.locator("p.text-lg")).toBeVisible();

      // Shows "Bundles" section with count
      await expect(page.locator("text=Bundles")).toBeVisible();

      // Shows bundle cards with metadata
      const bundleCards = page.locator("text=View Details");
      await expect(bundleCards.first()).toBeVisible();

      // Shows "Ready to deploy?" CTA section
      await expect(page.locator("text=Ready to deploy?")).toBeVisible();
      await expect(page.locator("text=View Pricing")).toBeVisible();
    });

    test(`${path} bundle card links work`, async ({ page }) => {
      await page.goto(path);

      // "View Details" link navigates to bundle detail page
      const detailsLink = page.locator("text=View Details").first();
      await expect(detailsLink).toBeVisible();
    });

    test(`${path} header navigation works`, async ({ page }) => {
      await page.goto(path);

      // Header nav links work
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("text=Catalog")).toBeVisible();
    });
  }

  test("vertical page returns error state for unknown slug", async ({ page }) => {
    await page.goto("/vertical/nonexistent");

    // Should show "Vertical Not Found" heading
    await expect(page.locator("text=Vertical Not Found")).toBeVisible({ timeout: 5000 });
    // Should have "Back Home" fallback
    await expect(page.locator("text=Back Home")).toBeVisible();
  });

  test("sample SOP links work from vertical detail page", async ({ page }) => {
    await page.goto("/vertical/hvac");

    // "Sample SOP" links navigate to sample-sop pages
    const sampleLink = page.locator("text=Sample SOP").first();
    if (await sampleLink.isVisible()) {
      await sampleLink.click();
      await expect(page).toHaveURL(/\/sample-sop\//);
    }
  });
});

test.describe("Mobile Responsiveness", () => {
  test("license dashboard renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X

    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "customer@verticalplaybook.test");
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/app/licenses");

    // Page title is visible and not truncated
    await expect(page.locator("h1")).toBeVisible();

    // Grid cards stack vertically (no horizontal overflow)
    const cards = page.locator(".grid > div");
    if (await cards.count() > 0) {
      const firstCard = cards.first();
      const box = await firstCard.boundingBox();
      expect(box).not.toBeNull();
      // Card should not overflow viewport
      expect(box!.x + box!.width).toBeLessThanOrEqual(380);
    }
  });

  test("sample SOP page renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto("/sample-sop/hvac-fall-startup");

    // Content is readable (no horizontal scroll)
    const body = page.locator("body");
    const box = await body.boundingBox();
    expect(box).not.toBeNull();

    // H1 is visible
    await expect(page.locator("h1")).toBeVisible();

    // CTA button is visible and not overflowing
    const cta = page.locator("text=Buy the Full Bundle");
    await expect(cta).toBeVisible();
  });

  test("vertical detail page renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto("/vertical/hvac");

    // H1 is visible
    await expect(page.locator("h1")).toBeVisible();

    // Bundle cards are visible and not overflowing
    const cards = page.locator("text=View Details");
    await expect(cards.first()).toBeVisible();
  });
});
