import { expect, test } from '@playwright/test';

test('в шапке четыре якоря, ведущих в существующие секции (от 1280px)', async ({ page }) => {
  // Навигация показывается с xl (1280px) — см. комментарий в Header.astro.
  // Ссылки лежат в DOM независимо от видимости, но выставляем вьюпорт явно,
  // чтобы тест был буквально привязан к заявленному порогу, а не к
  // случайному размеру окна десктопного проекта.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  // #desktop-nav, а не просто "header nav": с бургер-меню в шапке теперь
  // два <nav> (десктопное горизонтальное и то, что внутри боковой панели) —
  // "header nav" матчил бы оба и падал на строгом режиме Playwright.
  const links = page.locator('#desktop-nav a[href^="/#"]');
  await expect(links).toHaveCount(4);

  const hrefs = await links.evaluateAll((ns) => ns.map((n) => n.getAttribute('href') ?? ''));
  for (const href of hrefs) {
    const id = href.slice(href.indexOf('#'));
    await expect(page.locator(id)).toHaveCount(1);
  }
});

test('от 1280px: горизонтальное меню видно, бургер скрыт, кнопка WhatsApp — полная пилюля', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'вьюпорт задаётся вручную, достаточно одного проекта');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('#desktop-nav')).toBeVisible();
  await expect(page.locator('#burger-toggle')).toBeHidden();
  // Кнопка WhatsApp в шапке теперь рендерится ДВУМЯ инстансами (круглая
  // ниже md, полная пилюля от md — см. Header.astro), поэтому
  // 'header a[data-cta="header"]' матчит два элемента и .toBeVisible()
  // падает в строгом режиме Playwright. ':visible' — его собственное
  // расширение CSS-селекторов, сужает до реально показанного сейчас.
  const visible = page.locator('header a[data-cta="header"]:visible');
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveText(/Написать в WhatsApp/);
});

test('между md и xl (1024px): бургер и кнопка WhatsApp (пилюля) видны, горизонтальное меню скрыто', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'вьюпорт задаётся вручную, достаточно одного проекта');
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  await expect(page.locator('#desktop-nav')).toBeHidden();
  await expect(page.locator('#burger-toggle')).toBeVisible();
  // На этой ширине запас уже достаточен (см. комментарий в Header.astro,
  // замерено на 768px) — кнопка WhatsApp в шапке остаётся рядом с бургером,
  // всё ещё в виде полной пилюли (не круглой).
  const visible = page.locator('header a[data-cta="header"]:visible');
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveText(/Написать в WhatsApp/);
});

test('на мобильном (<768px): бургер и круглая кнопка WhatsApp видны, горизонтальное меню и полная пилюля скрыты', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'только мобильный проект');
  await page.goto('/');
  await expect(page.locator('#desktop-nav')).toBeHidden();
  await expect(page.locator('#burger-toggle')).toBeVisible();
  // Кнопка WhatsApp в шапке не должна пропадать ни на одной ширине — это
  // единственная липкая точка конверсии, доступная с любого места
  // страницы. Ниже md полная пилюля не помещается рядом с бургером
  // (замерено в Header.astro), поэтому здесь видна круглая кнопка-значок
  // (size="round"), без видимого текста, но с осмысленным aria-label.
  const visible = page.locator('header a[data-cta="header"]:visible');
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAccessibleName('Написать в WhatsApp');
  await expect(visible).not.toHaveText(/Написать в WhatsApp/);
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
