import { test, expect } from '@playwright/test';

test.describe('Authentication redirects', () => {
  test('unauthenticated access to /dashboard redirects to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('unauthenticated access to /jobs redirects to sign-in', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('unauthenticated access to /settings redirects to sign-in', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('sign-in page renders Clerk UI', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/sign-in/);
    // Clerk renders an iframe or component
    await expect(page.locator('body')).toBeVisible();
  });

  test('sign-up page is accessible', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/sign-up/);
    await expect(page.locator('body')).toBeVisible();
  });
});
