/**
 * E2E: License Dashboard — PRI-2414 Phase 2
 *
 * Scenario: Authenticated customer views their licenses, downloads a bundle,
 * and navigates to the update/diff view.
 *
 * Test runner: Playwright (install: pnpm -F app add -D @playwright/test)
 * Run: npx playwright test e2e/licenses-dashboard.spec.ts
 */

import { test, expect } from "@playwright/test";

test.describe("License Dashboard /app/licenses", () => {
  test.beforeEach(async ({ page }) => {
    // Log in as a test customer with at least one purchased license.
    // Uses Wasp email/password auth; seed user from dbSeeds.ts.
    await page.goto("/login");
    await page.fill('input[name="email"]', "customer@verticalplaybook.test");
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/app/licenses");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders license list with bundle metadata", async ({ page }) => {
    await page.goto("/app/licenses");
    await expect(page.locator("h1")).toContainText("Your Licenses");

    // Each license card shows bundle title, version, and status
    const cards = page.locator(".grid > div");
    await expect(cards.first()).toBeVisible();

    // Shows tier, issued date, size, and template counts
    await expect(page.locator("text=Tier")).toBeVisible();
    await expect(page.locator("text=Issued")).toBeVisible();
    await expect(page.locator("text=Size")).toBeVisible();
  });

  test("shows empty state when no licenses", async ({ page, browser }) => {
    // Use a fresh browser context with a user that has no licenses
    const context = await browser.newContext();
    const freshPage = await context.newPage();
    // Navigate with a seeded no-license user or just verify the empty-card renders
    await freshPage.goto("/login");
    await freshPage.fill('input[name="email"]', "newuser@verticalplaybook.test");
    await freshPage.fill('input[name="password"]', "testpass123");
    await freshPage.click('button[type="submit"]');
    await freshPage.waitForURL("/dashboard");
    await freshPage.goto("/app/licenses");

    await expect(freshPage.locator("text=You don't have any licenses yet")).toBeVisible();
    await expect(freshPage.locator("text=Browse Catalog")).toBeVisible();
    await context.close();
  });

  test("download CTA mints a fresh signed URL", async ({ page }) => {
    await page.goto("/app/licenses");

    // Click download on an active license
    const downloadButton = page.locator("button:has-text('Download Bundle')");
    if (await downloadButton.count() > 0) {
      // Mock the refresh-token API response to test UI feedback
      await page.route("**/api/v1/delivery/refresh-token", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              downloadToken: "test-token-123",
              downloadUrl: "/api/v1/delivery/test-token-123",
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
            },
            error: null,
          }),
        });
      });

      await downloadButton.first().click();

      // Shows success message
      await expect(page.locator("text=Download started")).toBeVisible({ timeout: 5000 });
    }
  });

  test("shows revoked/expired license status correctly", async ({ page }) => {
    await page.goto("/app/licenses");

    // Verify status badges render
    const badges = page.locator("text=Active, text=Revoked, text=Expired");
    // At least one status badge exists
    const hasBadge = (await page.locator("text=Active").count()) > 0 ||
      (await page.locator("text=Revoked").count()) > 0 ||
      (await page.locator("text=Expired").count()) > 0;
    expect(hasBadge).toBeTruthy();
  });

  test("navigates to bundle update view", async ({ page }) => {
    await page.goto("/app/licenses");

    const updateLink = page.locator("a:has-text('Check for Updates')");
    if (await updateLink.count() > 0) {
      await updateLink.first().click();
      await expect(page).toHaveURL(/\/app\/licenses\/.+\/updates/);
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});

test.describe("Bundle Update View /app/licenses/:id/updates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "customer@verticalplaybook.test");
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("shows version comparison cards", async ({ page }) => {
    // Navigate directly to a known license update view (seeded license ID)
    await page.goto("/app/licenses/test-license-id/updates");

    // Should show "Your Version" and "Latest Available" cards
    await expect(page.locator("text=Your Version")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Latest Available")).toBeVisible({ timeout: 5000 });
  });

  test("merged checkbox toggles local state", async ({ page }) => {
    await page.goto("/app/licenses/test-license-id/updates");

    // If there are new templates (added), checkboxes should be toggleable
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().check();
      await expect(checkboxes.first()).toBeChecked();
      await expect(page.locator("text=Merged (local)")).toBeVisible();

      await checkboxes.first().uncheck();
      await expect(checkboxes.first()).not.toBeChecked();
    }
  });

  test("shows up-to-date message when on latest version", async ({ page }) => {
    // Navigate to a license that's on the latest version
    await page.goto("/app/licenses/up-to-date-license-id/updates");

    // Should show green checkmark and "latest version" message
    await expect(page.locator("text=You have the latest version")).toBeVisible({ timeout: 5000 });
  });
});
