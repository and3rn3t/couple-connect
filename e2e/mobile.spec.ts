import { test, expect, devices } from '@playwright/test';

// Configure mobile projects using Playwright's project configuration approach
const mobileTests = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone 14 Pro', device: devices['iPhone 14 Pro'] },
];

// Simple mobile tests that work with Playwright's constraints
for (const { name, device } of mobileTests) {
  test.describe(`Mobile Tests - ${name}`, () => {
    test(`should load homepage on ${name} @mobile`, async ({ page, browser }) => {
      // Create a new page with the specific device viewport
      const context = await browser.newContext(device);
      const mobilePage = await context.newPage();

      try {
        await mobilePage.goto('/');

        // Check basic page load
        await expect(mobilePage).toHaveTitle(/Together|Couple Connect/);

        // Verify responsive design
        const viewport = mobilePage.viewportSize();
        expect(viewport?.width).toBeLessThanOrEqual(device.viewport.width);
        await context.close();
      } catch (error) {
        await context.close();
        throw error;
      }
    });

    test(`should have proper touch targets on ${name} @mobile`, async ({ page, browser }) => {
      const context = await browser.newContext(device);
      const mobilePage = await context.newPage();

      try {
        await mobilePage.goto('/');

        // Check button touch targets
        const buttons = mobilePage.locator('button');
        const count = await buttons.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const box = await button.boundingBox();

            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(30);
              expect(box.width).toBeGreaterThanOrEqual(30);
            }
          }
        }

        await context.close();
      } catch (error) {
        await context.close();
        throw error;
      }
    });

    test(`should have proper mobile meta tags on ${name} @mobile`, async ({ page, browser }) => {
      const context = await browser.newContext(device);
      const mobilePage = await context.newPage();

      try {
        await mobilePage.goto('/');

        // Check viewport meta tag
        const viewportMeta = mobilePage.locator('meta[name="viewport"]');
        expect(await viewportMeta.count()).toBeGreaterThan(0);

        const content = await viewportMeta.getAttribute('content');
        expect(content).toContain('width=device-width');

        await context.close();
      } catch (error) {
        await context.close();
        throw error;
      }
    });
  });
}

// Cross-device responsive tests
test.describe('Cross-Device Mobile Tests', () => {
  test('should be responsive across different mobile viewports @mobile', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 390, height: 844 }, // iPhone 12
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Check that content fits and is accessible
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Verify page doesn't have horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 50);
    }
  });

  test('should have PWA features for mobile @mobile', async ({ page }) => {
    await page.goto('/');

    // Check for PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    expect(await manifestLink.count()).toBeGreaterThan(0);

    // Check for service worker support
    const swSupport = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swSupport).toBe(true);

    // Check for basic iOS meta tags
    const appleMobileCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    expect(await appleMobileCapable.count()).toBeGreaterThan(0);
  });

  test('should load within acceptable time on mobile @mobile', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 15 seconds (very relaxed for CI)
    expect(loadTime).toBeLessThan(15000);
  });
});
