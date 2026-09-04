import { expect, test } from '@playwright/test';

test('в шапке четыре якоря, ведущих в существующие секции (от 1280px)', async ({ page }) => {
  // Навигация показывается с xl (1280px) — см. комментарий в Header.astro.
  // Ссылки лежат в DOM независимо от видимости, но выставляем вьюпорт явно,
  // чтобы тест был буквально привязан к заявленному порогу, а не к
  // случайному размеру окна десктопного проекта.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const links = page.locator('header nav a[href^="#"]');
  await expect(links).toHaveCount(4);

  const hrefs = await links.evaluateAll((ns) => ns.map((n) => n.getAttribute('href') ?? ''));
  for (const href of hrefs) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('навигация скрыта между md и xl — остаются только логотип и кнопка WhatsApp', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'вьюпорт задаётся вручную, достаточно одного проекта');
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  await expect(page.locator('header nav')).toBeHidden();
  await expect(page.locator('header a[data-cta="header"]')).toBeVisible();
});

test('на мобильном навигация скрыта, кнопка WhatsApp видна', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'только мобильный проект');
  await page.goto('/');
  await expect(page.locator('header nav')).toBeHidden();
  await expect(page.locator('header a[data-cta="header"]')).toBeVisible();
});

test('заголовок первого экрана — единственный h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/Холодильник чинит тот, кто взял трубку/);
});

test('фото первого экрана грузится приоритетно и не ленится', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('img').first();
  await expect(img).toHaveAttribute('fetchpriority', 'high');
  await expect(img).not.toHaveAttribute('loading', 'lazy');
  await expect(img).toHaveAttribute('alt', /Мастер Express Cooling/);
});
