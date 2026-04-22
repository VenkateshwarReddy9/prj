import { test, expect } from '@playwright/test';

test.describe('Not found page', () => {
  test('renders 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-at-all');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Dashboard' })).toBeVisible();
  });
});
