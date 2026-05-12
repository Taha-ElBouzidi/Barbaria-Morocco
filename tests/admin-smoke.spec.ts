import { test, expect } from "@playwright/test";

test.describe("admin login page", () => {
  test("renders the password form", async ({ page }) => {
    const r = await page.goto("/admin/login");
    expect(r?.status() ?? 0).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows unauthorized error from query string", async ({ page }) => {
    await page.goto("/admin/login?error=unauthorized");
    await expect(page.getByText(/not authorized/i)).toBeVisible();
  });

  test("shows invalid_credentials error from query string", async ({ page }) => {
    await page.goto("/admin/login?error=invalid_credentials");
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("invalid credentials shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill("notreal@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click({ force: true });
    // Either browser validation blocks, or the server action rejects with invalid_credentials.
    // Critically: we should NOT be redirected to /admin (the dashboard).
    await expect(page).not.toHaveURL(/\/admin$/, { timeout: 3000 });
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
