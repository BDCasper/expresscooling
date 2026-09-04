import { expect, test } from '@playwright/test';

test('восемь карточек поломок, у каждой своя метка источника', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('[data-breakage]');
  await expect(cards).toHaveCount(8);

  const sources = await page
    .locator('[data-breakage] a[data-cta]')
    .evaluateAll((ns) => ns.map((n) => n.getAttribute('data-cta') ?? ''));

  expect(new Set(sources).size).toBe(8);
  for (const s of sources) expect(s).toMatch(/^card-/);
});

test('полоса фактов показывает цену из данных, а не из макета', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#polomki')).toHaveCount(1);
  await expect(page.getByText('от 3500 ₸').first()).toBeVisible();
});

test('карточки поломок не тянут изображения заранее', async ({ page }) => {
  await page.goto('/');
  const imgs = page.locator('[data-breakage] img');
  const count = await imgs.count();
  expect(count).toBe(8);
  for (let i = 0; i < count; i++) {
    await expect(imgs.nth(i)).toHaveAttribute('loading', 'lazy');
  }
});
