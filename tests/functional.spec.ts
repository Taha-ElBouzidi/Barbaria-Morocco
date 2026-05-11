import { test, expect } from "@playwright/test";

test("add product to inquiry, persists across reload, appears in contact sidebar", async ({ page }) => {
  // Use EN locale for predictable copy
  await page.goto("/en/product/beldi-soap");

  // Find and click the Add to Inquiry button
  const addBtn = page.getByRole("button", { name: /add to inquiry/i }).first();
  await expect(addBtn).toBeVisible();
  await addBtn.click();

  // Confirm UI flips to "Added" state (button text becomes "Added ✓")
  await expect(page.getByRole("button", { name: /added/i }).first()).toBeVisible();

  // Reload — localStorage should hydrate the state
  await page.reload();
  await expect(page.getByRole("button", { name: /added/i }).first()).toBeVisible();

  // Navigate to contact page; the inquiry sidebar should list this product
  await page.goto("/en/contact");
  await expect(page.getByText(/Beldi Black Soap/i).first()).toBeVisible();
});

test("locale toggle preserves route", async ({ page }) => {
  await page.goto("/en/rituals/hammam");
  // Header shows the OTHER locale as a link. When viewing EN, it shows "FR".
  // The footer also has FR/EN links with aria-current on the active one.
  // Click the footer FR link (non-active link = FR since we're on EN).
  const frLink = page.getByRole("link", { name: /^FR$/i }).first();
  await frLink.click();
  await expect(page).toHaveURL(/\/rituals\/hammam$/); // FR is default, no prefix
});

test("inquiry mailto link contains structured body", async ({ page }) => {
  await page.goto("/en/product/huile-argan");
  await page.getByRole("button", { name: /add to inquiry/i }).first().click();
  await page.goto("/en/contact");

  // Step 01: Maison fields — label text from en.json contact namespace
  await page.getByLabel(/Company/i).fill("Acme Hospitality");
  await page.getByLabel(/Contact name/i).fill("Jane Doe");
  await page.getByLabel(/Email/i).fill("jane@acme.test");
  // Phone label is "Phone / WhatsApp"
  await page.getByLabel(/Phone/i).fill("+33 1 23 45 67 89");

  // Click "Next" to advance to step 2 — use .first() to avoid ambiguity with the Next.js dev toolbar button
  await page.getByRole("button", { name: /next/i }).first().click();

  // Step 02: Occasion fields — use exact label to avoid matching the sidebar's quantity +/- aria-labels
  await page.getByLabel("Quantity", { exact: true }).fill("500");
  await page.getByLabel("Event date", { exact: true }).fill("2026-12-01");
  // The Occasion select — pick "Year-end" (exact label from en.json contact.f_occasion_yearend)
  await page.getByLabel("Occasion", { exact: true }).selectOption({ label: "Year-end" });

  // Inspect submit button's data-mailto attribute (test pattern — avoids triggering navigation)
  const submit = page.getByRole("button", { name: /request quote/i });
  const mailto = await submit.getAttribute("data-mailto");
  expect(mailto).toBeTruthy();
  expect(mailto).toContain("mailto:concierge@barbariamorocco.com");

  const decoded = decodeURIComponent(mailto ?? "");
  expect(decoded).toContain("Acme Hospitality");
  expect(decoded).toContain("Jane Doe");
  expect(decoded).toContain("Pure Argan Oil");
});

test("inquiry list survives navigation across pages", async ({ page }) => {
  await page.goto("/en/product/beldi-soap");
  await page.getByRole("button", { name: /add to inquiry/i }).first().click();
  await page.goto("/en/rituals/botanical");
  await page.goto("/en/product/huile-argan");
  await page.getByRole("button", { name: /add to inquiry/i }).first().click();

  // Header should show count of 2 — rendered as "Inquiry (2)"
  const header = page.locator("header").first();
  await expect(header.getByText(/inquiry.*2/i)).toBeVisible();
});
