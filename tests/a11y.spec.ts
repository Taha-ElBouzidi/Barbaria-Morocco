import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { path: "/en", name: "Home" },
  { path: "/en/rituals/hammam", name: "Category" },
  { path: "/en/product/savon-beldi-nila", name: "PDP" },
  { path: "/en/contact", name: "Contact" },
];

for (const { path, name } of PAGES) {
  test(`axe a11y: ${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    // Wait for any reveal animations to settle
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    if (serious.length > 0) {
      console.log("Serious/critical a11y violations:", JSON.stringify(serious, null, 2));
    }
    expect(serious).toEqual([]);
  });
}
