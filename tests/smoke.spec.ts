import { test, expect } from "@playwright/test";

// FR is the default locale (bare path). EN is /en prefixed.
const ROUTES = [
  "",
  "/products/cosmetiques",
  "/products/epicerie_fine",
  "/product/huile-argan",
  "/product/savon-beldi-nila",
  "/product/brume-duo",
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

// 308 redirects from retired routes (including the now-retired
// /rituals/[world] public browse pages, which were unreachable from
// the nav since the IA pivot).
const REDIRECTS = [
  { from: "/cosmetics", to: "/products/cosmetiques" },
  { from: "/textile",   to: "/products/epicerie_fine" },
  { from: "/food",      to: "/products/epicerie_fine" },
  { from: "/order",     to: "/contact" },
  { from: "/about",     to: "/story" },
  { from: "/rituals/hammam",    to: "/products/cosmetiques" },
  { from: "/rituals/botanical", to: "/products/cosmetiques" },
  { from: "/rituals/heritage",  to: "/" },
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
