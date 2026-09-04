import { expect, test } from '@playwright/test';

test('секция для бизнеса доступна по якорю и содержит CTA', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#dlya-biznesa');
  await expect(section).toHaveCount(1);
  await expect(section.locator('a[data-cta="business"]')).toHaveAttribute('href', /wa\.me/);
  await expect(section.getByRole('listitem')).toHaveCount(4);
});

test('текст на фоне фото читаем: под ним есть затемнение', async ({ page }) => {
  await page.goto('/');
  const heading = page.locator('#dlya-biznesa h2');
  await expect(heading).toBeVisible();
  const color = await heading.evaluate((n) => getComputedStyle(n).color);
  expect(color).toBe('rgb(246, 246, 246)');
});

test('фото склада не блокирует первый экран', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('img[alt*="склад" i]').first();
  await expect(img).toHaveAttribute('loading', 'lazy');
});
