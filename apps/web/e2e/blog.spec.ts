import { test, expect } from '@playwright/test';

test.describe('Blog page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('renders blog listing with posts', async ({ page }) => {
    await expect(page.getByText('CareerCompass Blog')).toBeVisible();
    await expect(page.getByText('How AI Is Changing Career Navigation')).toBeVisible();
    await expect(page.getByText('The Complete ATS Optimization Guide')).toBeVisible();
  });

  test('category filter shows all categories', async ({ page }) => {
    await expect(page.getByText('All')).toBeVisible();
    await expect(page.getByText('Career Advice')).toBeVisible();
    await expect(page.getByText('Resume Tips')).toBeVisible();
    await expect(page.getByText('Interview Prep')).toBeVisible();
  });

  test('post cards show read time and author', async ({ page }) => {
    const firstPost = page.locator('article').first();
    await expect(firstPost.getByText(/min read/)).toBeVisible();
    await expect(firstPost.getByText(/Sarah Chen|Marcus Rivera|Priya Patel/)).toBeVisible();
  });
});
