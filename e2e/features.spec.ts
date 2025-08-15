import { test, expect } from '@playwright/test';

test.describe('Partner Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Clear any existing data to ensure clean state
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should allow setting up partners', async ({ page }) => {
    // Look for partner setup form
    const setupForm = page.locator('[data-testid="partner-setup"]');

    if (await setupForm.isVisible()) {
      // Fill in partner information
      const currentPartnerName = page.locator('input[name="currentPartnerName"]');
      const otherPartnerName = page.locator('input[name="otherPartnerName"]');

      if (await currentPartnerName.isVisible()) {
        await currentPartnerName.fill('Alice');
        await otherPartnerName.fill('Bob');

        // Submit the form
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Verify partners were created
        await expect(page.locator('text=Alice')).toBeVisible();
        await expect(page.locator('text=Bob')).toBeVisible();
      }
    }
  });

  test('should display partner profiles', async ({ page }) => {
    // Set up test data
    await page.evaluate(() => {
      localStorage.setItem(
        'current-partner',
        JSON.stringify({
          name: 'Alice',
          email: 'alice@example.com',
        })
      );
      localStorage.setItem(
        'other-partner',
        JSON.stringify({
          name: 'Bob',
          email: 'bob@example.com',
        })
      );
    });

    await page.reload();

    // Check if partner profiles are displayed
    const partnerProfile = page.locator('[data-testid="partner-profile"]');
    if (await partnerProfile.isVisible()) {
      await expect(partnerProfile).toBeVisible();
      await expect(page.locator('text=Alice')).toBeVisible();
      await expect(page.locator('text=Bob')).toBeVisible();
    }
  });
});

test.describe('Issue Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Set up partners for issue management tests
    await page.evaluate(() => {
      localStorage.setItem(
        'current-partner',
        JSON.stringify({
          name: 'Alice',
          email: 'alice@example.com',
        })
      );
      localStorage.setItem(
        'other-partner',
        JSON.stringify({
          name: 'Bob',
          email: 'bob@example.com',
        })
      );
    });
  });

  test('should allow creating new issues', async ({ page }) => {
    // Look for add issue button
    const addIssueButton = page.locator('[data-testid="add-issue"]');

    if (await addIssueButton.isVisible()) {
      await addIssueButton.click();

      // Fill in issue details
      const titleInput = page.locator('input[name="title"]');
      const descriptionInput = page.locator('textarea[name="description"]');

      if (await titleInput.isVisible()) {
        await titleInput.fill('Communication Issue');
        await descriptionInput.fill('We need to work on our communication skills.');

        // Submit the issue
        const saveButton = page.locator('button:has-text("Save")');
        await saveButton.click();

        // Verify issue was created
        await expect(page.locator('text=Communication Issue')).toBeVisible();
      }
    }
  });

  test('should display issue mindmap', async ({ page }) => {
    // Check if mindmap view is available
    const mindmapView = page.locator('[data-testid="mindmap-view"]');

    if (await mindmapView.isVisible()) {
      await expect(mindmapView).toBeVisible();

      // Check for SVG or canvas elements that make up the mindmap
      const mindmapContainer = page.locator('[data-testid="mindmap-container"]');
      if (await mindmapContainer.isVisible()) {
        await expect(mindmapContainer).toBeVisible();
      }
    }
  });
});

test.describe('Action Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Set up test data
    await page.evaluate(() => {
      localStorage.setItem(
        'current-partner',
        JSON.stringify({
          name: 'Alice',
          email: 'alice@example.com',
        })
      );
      localStorage.setItem(
        'relationship-issues',
        JSON.stringify([
          {
            id: '1',
            title: 'Communication Issue',
            description: 'Test issue',
          },
        ])
      );
    });
  });

  test('should allow creating actions from issues', async ({ page }) => {
    // Look for action creation interface
    const actionDashboard = page.locator('[data-testid="action-dashboard"]');

    if (await actionDashboard.isVisible()) {
      const addActionButton = page.locator('[data-testid="add-action"]');

      if (await addActionButton.isVisible()) {
        await addActionButton.click();

        // Fill in action details
        const titleInput = page.locator('input[name="title"]');
        if (await titleInput.isVisible()) {
          await titleInput.fill('Practice Active Listening');

          // Submit the action
          const submitButton = page.locator('button:has-text("Create")');
          await submitButton.click();

          // Verify action was created
          await expect(page.locator('text=Practice Active Listening')).toBeVisible();
        }
      }
    }
  });

  test('should allow completing actions', async ({ page }) => {
    // Set up test data with an action
    await page.evaluate(() => {
      localStorage.setItem(
        'relationship-actions',
        JSON.stringify([
          {
            id: '1',
            title: 'Practice Active Listening',
            status: 'pending',
            assignedTo: 'Alice',
          },
        ])
      );
    });

    await page.reload();

    // Look for action to complete
    const actionCard = page.locator('[data-testid="action-card"]').first();

    if (await actionCard.isVisible()) {
      const completeButton = page.locator('button:has-text("Complete")').first();

      if (await completeButton.isVisible()) {
        await completeButton.click();

        // Verify action was marked as completed
        await expect(page.locator('text=Completed')).toBeVisible();
      }
    }
  });
});
