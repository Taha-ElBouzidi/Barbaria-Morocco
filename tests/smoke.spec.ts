import { test, expect } from "@playwright/test";

// FR is the default locale (bare path). EN is /en prefixed.
const ROUTES = [
  "",
  "/rituals/hammam",
  "/rituals/botanical",
  "/rituals/heritage",
  "/product/huile-argan",
  "/product/beldi-soap",
  "/product/cedar-box",
  "/story",
  "/ateliers",
  "/journal",
  "/contact",
];

const LOCALES = [
  { locale: "fr", prefix: "" },        // FR is default — no prefix
  { locale: "en", prefix: "/en" },     // EN prefixed
];

for (const { locale, prefix } of LOCALES) {
  for (const route of ROUTES) {
    test(`200 OK: ${prefix}${route} (${locale})`, async ({ page }) => {
      const path = `${prefix}${route}` || "/";
      const response = await page.goto(path);
      expect(response?.status() ?? 200).toBeLessThan(400);
      // Every page renders the new shell header
      await expect(page.locator("header").first()).toBeVisible();
    });
  }
}

// 308 redirects from retired routes
const REDIRECTS = [
  { from: "/cosmetics", to: "/rituals/botanical" },
  { from: "/textile",   to: "/rituals/heritage" },
  { from: "/food",      to: "/rituals/heritage" },
  { from: "/order",     to: "/contact" },
  { from: "/about",     to: "/story" },
];

for (const { from, to } of REDIRECTS) {
  test(`redirect: ${from} -> ${to}`, async ({ request }) => {
    const response = await request.get(from, { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    const location = response.headers().location;
    expect(location).toBeTruthy();
    // Location header may be absolute or relative; check it contains the destination path
    expect(location).toContain(to);
  });

  test(`redirect: /en${from} -> /en${to}`, async ({ request }) => {
    const response = await request.get(`/en${from}`, { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers().location).toContain(`/en${to}`);
  });
}
