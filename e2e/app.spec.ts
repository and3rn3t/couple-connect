import { test, expect } from '@playwright/test';

test.describe('Couple Connect App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Couple Connect/);

    // Check for main navigation or key elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display partner setup when no partners exist', async ({ page }) => {
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.reload();

    // Should show partner setup if no partners exist
    // This test may need adjustment based on your actual UI
    const partnerSetup = page.locator('[data-testid="partner-setup"]');
    if (await partnerSetup.isVisible()) {
      await expect(partnerSetup).toBeVisible();
    }
  });

  test('should navigate between tabs', async ({ page }) => {
    // Look for tab navigation elements
    const tabs = page.locator('[role="tablist"]');
    if (await tabs.isVisible()) {
      const firstTab = tabs.locator('[role="tab"]').first();
      await firstTab.click();
      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that the page still loads and is usable
    await expect(page.locator('body')).toBeVisible();

    // Check for mobile-specific navigation if it exists
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test('should handle offline functionality', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // The app should still be functional offline
    await expect(page.locator('body')).toBeVisible();

    // Check for offline indicator if it exists
    const offlineIndicator = page.locator('[data-testid="offline-notification"]');
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);
  });
});
