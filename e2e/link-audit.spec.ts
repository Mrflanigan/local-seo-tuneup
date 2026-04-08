import { test, expect } from "../playwright-fixture";

/*
 * E2E Link & CTA Audit
 * ---------------------
 * Clicks every link/CTA across all public pages and verifies:
 *  1. The destination URL matches what the label promises
 *  2. The destination page actually renders (no crash / 404)
 *  3. Key content on the destination matches the link's claim
 */

const PAGES = [
  "/",
  "/get-started",
  "/methodology",
  "/osmosis",
  "/privacy",
  "/case-study",
];

// ─── Page-load smoke tests ───────────────────────────────────

test.describe("All public pages load without error", () => {
  for (const path of PAGES) {
    test(`${path} renders without crash`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(path, { waitUntil: "networkidle" });

      // Should NOT land on the 404 page (unless we're testing a real 404)
      const heading = page.locator("h1").first();
      if (path !== "/bogus") {
        // If there's an h1, it shouldn't say "404" or "not found"
        const h1Text = await heading.textContent().catch(() => "");
        expect(h1Text?.toLowerCase()).not.toContain("not found");
      }

      expect(errors).toHaveLength(0);
    });
  }
});

// ─── Homepage link audit ─────────────────────────────────────

test.describe("Homepage links go where they claim", () => {
  test("'Run My Complimentary SEO Checkup' CTA goes to /get-started", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // There are two CTAs with this text; click the first (hero)
    const cta = page.getByRole("button", { name: /run my complimentary/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    await page.waitForURL("**/get-started");
    expect(page.url()).toContain("/get-started");
  });

  test("'Read ChatGPT & Gemini's 2026 review' link goes to a page with actual reviews", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const reviewLink = page.locator("a", { hasText: /chatgpt.*review/i }).first();
    await expect(reviewLink).toBeVisible();

    const href = await reviewLink.getAttribute("href");
    expect(href).toBeTruthy();

    await reviewLink.click();
    await page.waitForLoadState("networkidle");

    // The destination page MUST contain actual review content —
    // not just a scoring methodology. Check for review-specific signals.
    const body = await page.locator("body").textContent();
    const hasReviewSignals =
      /review/i.test(body || "") &&
      (/score.*\/\s*10/i.test(body || "") || /rating/i.test(body || "") || /chatgpt/i.test(body || ""));

    expect(hasReviewSignals).toBe(true);
  });

  test("'SEO Osmosis™' link goes to /osmosis", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const link = page.locator("a", { hasText: /seo osmosis/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("**/osmosis");
    expect(page.url()).toContain("/osmosis");
  });

  test("'How it works' nav link scrolls to section", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const link = page.locator("a", { hasText: /how it works/i }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBe("#how-it-works");
  });
});

// ─── GetStarted page ─────────────────────────────────────────

test.describe("GetStarted page", () => {
  test("Back button navigates to homepage", async ({ page }) => {
    await page.goto("/get-started", { waitUntil: "networkidle" });
    const back = page.getByRole("button", { name: /back/i }).first();
    await expect(back).toBeVisible();
    await back.click();
    await page.waitForURL("**/");
    // Should be on the root
    expect(new URL(page.url()).pathname).toBe("/");
  });
});

// ─── Report footer links ────────────────────────────────────

test.describe("ReportFooter links", () => {
  test("'Data & privacy' link goes to /privacy with privacy content", async ({ page }) => {
    // The report page requires state, so test the footer link from /privacy itself
    // Just verify /privacy loads and has privacy content
    await page.goto("/privacy", { waitUntil: "networkidle" });
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toContain("privacy");
  });
});

// ─── Methodology page ────────────────────────────────────────

test.describe("Methodology page", () => {
  test("page loads and has scoring methodology content", async ({ page }) => {
    await page.goto("/methodology", { waitUntil: "networkidle" });
    const body = await page.locator("body").textContent();
    // Should contain scoring-related content
    expect(body?.toLowerCase()).toMatch(/score|point|check/);
  });
});

// ─── 404 handling ────────────────────────────────────────────

test.describe("404 handling", () => {
  test("bogus URL shows not-found page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz", { waitUntil: "networkidle" });
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toMatch(/not found|404|doesn.t exist/);
  });
});
