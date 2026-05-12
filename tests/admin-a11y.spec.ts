import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("admin a11y", () => {
  test("axe a11y: /admin/login", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    if (serious.length > 0) {
      console.log("Serious/critical a11y violations on /admin/login:", JSON.stringify(serious, null, 2));
    }
    expect(serious).toEqual([]);
  });
});
