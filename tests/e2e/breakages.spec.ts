import { expect, test } from '@playwright/test';
import { breakages } from '../../src/data/breakages';
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

/**
 * У каждой карточки чат должен открываться уже с её поломкой в тексте —
 * человек не должен переписывать то, по чему только что щёлкнул. Проверяем
 * не «текст непустой», а точное совпадение с заголовком именно этой
 * карточки: перепутанный порядок или один и тот же текст на всех восьми
 * кнопках прошли бы более слабую проверку незамеченными.
 */
test('в каждой карточке ссылка WhatsApp несёт свою поломку', async ({ page }) => {
  await page.goto('/');

  for (const breakage of breakages) {
    const href =
      (await page.locator(`[data-breakage="${breakage.slug}"] a[data-cta]`).getAttribute('href')) ?? '';
    const text = decodeURIComponent(href.split('text=')[1] ?? '');
    expect(text, `карточка ${breakage.slug}`).toBe(
      `${site.whatsappText} Проблема: ${breakage.title}.`,
    );
  }
});

/**
 * Широкая карточка «Другая поломка» — единственная в секции, у которой
 * поломки нет по смыслу: человек как раз не знает, что случилось. Её текст
 * обязан остаться общей заготовкой, без предложения «Проблема: …», а не
 * получить чужой симптом «на всякий случай».
 */
test('у карточки «Другая поломка» текст остаётся общим', async ({ page }) => {
  await page.goto('/');
  const href = (await page.locator('a[data-cta="card-other"]').getAttribute('href')) ?? '';
  expect(decodeURIComponent(href.split('text=')[1] ?? '')).toBe(site.whatsappText);
});
