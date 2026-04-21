import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders hero section and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Navigate Your Career')).toBeVisible();
    await expect(page.getByText('CareerCompass').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Free Assessment' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Pricing' })).toBeVisible();
  });

  test('features section displays 6 feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Career Assessment')).toBeVisible();
    await expect(page.getByText('Smart Job Matching')).toBeVisible();
    await expect(page.getByText('Resume Optimizer')).toBeVisible();
    await expect(page.getByText('Interview Prep')).toBeVisible();
    await expect(page.getByText('Skill Roadmap')).toBeVisible();
    await expect(page.getByText('AI Career Coach')).toBeVisible();
  });

  test('navigates to pricing page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'View Pricing' }).first().click();
    await expect(page).toHaveURL('/pricing');
    await expect(page.getByText('Simple, transparent pricing')).toBeVisible();
  });

  test('sign up link navigates to sign-up page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get Started Free' }).first().click();
    await expect(page).toHaveURL(/sign-up/);
  });
});
