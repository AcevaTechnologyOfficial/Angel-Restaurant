import { test, expect } from "@playwright/test";

const routes = ["/", "/menu", "/story", "/gallery", "/visit", "/press", "/faq", "/private-dining", "/privacy"];

test("public layouts stay readable on mobile and desktop", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [320, 390, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      expect((await page.goto(route))?.status(), route).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test("hero video autoplays and the gallery contains keyboard focus", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const videos: string[] = [];
  page.on("request", request => { if (request.url().includes("hero-loop-v4.mp4")) videos.push(request.url()); });
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("data-motion-hydrated", "");
  await expect(page.locator(".hero-poster")).toBeVisible();
  await expect(page.locator(".hero h1")).toBeVisible();
  await expect(page.locator(".certificate-highlight h2")).toBeVisible();
  await expect.poll(() => videos.length).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Pause video", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/sqa-home-desktop.png" });
  await page.getByRole("button", { name: "Pause video", exact: true }).click();
  await expect(page.getByRole("button", { name: "Play video", exact: true })).toBeVisible();
  await page.goto("/gallery");
  const opener = page.locator(".gallery-grid-trigger").first();
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: "test-results/sqa-home-mobile.png" });
});

test("essential public content remains visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of ["/", "/visit", "/menu"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-reveal]").first()).toHaveCSS("opacity", "1");
    if (route === "/menu") await expect(page.locator(".menu-item")).toHaveCount(84);
  }
  await context.close();
});

test("gallery lightbox fits phone and iPad screens", async ({ page }) => {
  for (const width of [390, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/gallery");
    await page.locator(".gallery-grid-trigger").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const name of ["Previous photograph", "Next photograph", "Close"]) {
      const box = await dialog.getByRole("button", { name }).boundingBox();
      expect(box, `${name} at ${width}px`).not.toBeNull();
      expect(box!.x, `${name} left edge at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, `${name} right edge at ${width}px`).toBeLessThanOrEqual(width);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
});
