import { test, expect } from "@playwright/test";
import { homepageDefaults } from "../src/content/homepage";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

async function waitForLandingFrame(page: any) {
  const frameLocator = page.frameLocator('iframe[title="CoachFlow Landing"]');
  await expect(page.locator('iframe[title="CoachFlow Landing"]')).toBeVisible();
  await expect(frameLocator.locator("body")).toBeVisible();
  return frameLocator;
}

test.describe("Landing preset integration", () => {
  test("builder preview message hides deleted sections", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/?builderPreview=true&device=desktop`);
    const frame = await waitForLandingFrame(page);

    await expect(frame.locator(".hero")).toBeVisible();
    await expect(frame.locator("#promise")).toBeVisible();

    const next = clone(homepageDefaults);
    next.page = {
      sections: (homepageDefaults.page?.sections || []).filter(
        (s: any) => s.type !== "hero" && s.type !== "features",
      ),
    } as any;

    await page.evaluate(
      (payload) => {
        window.postMessage({ type: "coachflow_builder_preview", content: payload }, window.location.origin);
      },
      next,
    );

    await expect(frame.locator(".hero")).toHaveCSS("display", "none");
    await expect(frame.locator("#promise")).toHaveCSS("display", "none");
  });

  test("builder preview message disables section via enabled=false", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/?builderPreview=true&device=desktop`);
    const frame = await waitForLandingFrame(page);

    await expect(frame.locator("#pricing")).toBeVisible();

    const next = clone(homepageDefaults);
    const sections = clone((homepageDefaults.page?.sections || []) as any[]);
    next.page = {
      sections: sections.map((s) => (s.type === "pricing" ? { ...s, enabled: false } : s)),
    } as any;

    await page.evaluate(
      (payload) => {
        window.postMessage({ type: "coachflow_builder_preview", content: payload }, window.location.origin);
      },
      next,
    );

    await expect(frame.locator("#pricing")).toHaveCSS("display", "none");
  });

  test("theme/custom css are applied inside iframe", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/?builderPreview=true&device=desktop`);
    const frame = await waitForLandingFrame(page);

    const next = clone(homepageDefaults) as any;
    next.site = { ...next.site, theme: { ...(next.site?.theme || {}), enabled: true } };
    next.branding = { ...(next.branding || {}), enabled: true };
    next.site.customCss = "body{outline:4px solid rgb(255,0,0)!important}";

    await page.evaluate(
      (payload) => {
        window.postMessage({ type: "coachflow_builder_preview", content: payload }, window.location.origin);
      },
      next,
    );

    await expect(frame.locator("style#cf-site-custom-css")).toHaveCount(1);
    await expect(frame.locator("style#cf-theme-vars")).toHaveCount(1);
    await expect(frame.locator("body")).toHaveCSS("outline-style", "solid");
  });
});

