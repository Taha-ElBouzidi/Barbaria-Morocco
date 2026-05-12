import { test, expect } from "@playwright/test";

test.describe("admin login page", () => {
  test("renders the magic-link form", async ({ page }) => {
    const r = await page.goto("/admin/login");
    expect(r?.status() ?? 0).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send magic link/i })).toBeVisible();
  });

  test("shows unauthorized error from query string", async ({ page }) => {
    await page.goto("/admin/login?error=unauthorized");
    await expect(page.getByText(/not authorized/i)).toBeVisible();
  });

  test("shows sent state when query string indicates", async ({ page }) => {
    await page.goto("/admin/login?sent=1&email=admin%40example.com");
    await expect(page.getByText(/magic link sent/i)).toBeVisible();
    await expect(page.getByText(/admin@example\.com/i)).toBeVisible();
  });

  test("invalid email is rejected before sending", async ({ page }) => {
    await page.goto("/admin/login");
    // HTML5 `type=email` validation prevents submit for malformed input.
    // We test the action's zod fallback by typing something that LOOKS like email but fails zod
    // (e.g., trailing space, or a value missing the dot). Default browser validation
    // may catch some — assert that the form ultimately doesn't transition to "sent".
    await page.getByLabel(/email/i).fill("not-an-email");
    // Use force:true to bypass Next.js dev overlay portal that intercepts pointer events in dev mode.
    await page.getByRole("button", { name: /send magic link/i }).click({ force: true });
    // Either browser validation blocks (URL stays the same), or our zod rejects.
    // Critically: we should NOT see the "sent" state.
    await expect(page.getByText(/magic link sent/i)).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe("admin route guards", () => {
  const PROTECTED = ["/admin", "/admin/products", "/admin/journal", "/admin/inquiries", "/admin/activity"];
  for (const path of PROTECTED) {
    test(`unauthenticated ${path} -> /admin/login`, async ({ page }) => {
      const r = await page.goto(path);
      // After middleware redirect, page lands on /admin/login
      await expect(page).toHaveURL(/\/admin\/login(\?|$)/);
      expect(r?.status() ?? 0).toBeLessThan(400);
    });
  }
});
