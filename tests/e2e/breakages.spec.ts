import { expect, test } from '@playwright/test';
import { site } from '../../src/data/site';

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
  // Локатор ограничен самой полосой фактов (data-section="facts"), а не
  // всей страницей: цена из site.diagnosticsFrom дублируется текстом ещё в
  // паре других секций, и ненаправленный поиск по всей странице находил бы
  // первое совпадение где угодно, даже если сама полоса фактов вписала бы
  // цену литералом, разошедшимся с site.ts.
  await expect(
    page.locator('[data-section="facts"]').getByText(site.diagnosticsFrom).first(),
  ).toBeVisible();
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
