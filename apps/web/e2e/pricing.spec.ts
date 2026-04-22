import { test, expect } from '@playwright/test';

test.describe('Pricing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('displays all 4 pricing plans', async ({ page }) => {
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Starter')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });

  test('Pro plan has Most Popular badge', async ({ page }) => {
    await expect(page.getByText('Most Popular')).toBeVisible();
  });

  test('plan prices are correct', async ({ page }) => {
    await expect(page.getByText('$0')).toBeVisible();
    await expect(page.getByText('$19')).toBeVisible();
    await expect(page.getByText('$49')).toBeVisible();
    await expect(page.getByText('Custom')).toBeVisible();
  });

  test('Free plan CTA links to sign-up', async ({ page }) => {
    const getStartedLink = page.getByRole('link', { name: 'Get Started Free' }).first();
    await expect(getStartedLink).toHaveAttribute('href', '/sign-up');
  });
});
