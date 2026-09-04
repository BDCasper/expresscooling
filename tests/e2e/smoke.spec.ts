import { expect, test } from '@playwright/test';

test('страница отдаётся и объявляет русский язык', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByTestId('page-title')).toBeVisible();
});
