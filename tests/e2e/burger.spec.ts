import { expect, test, type Page } from '@playwright/test';

/**
 * Бургер-меню (Header.astro) появляется только ниже 1280px (xl) — выше
 * десктопное горизонтальное меню остаётся как в макете и бургер скрыт.
 * Большинство сценариев здесь запускаются с явным вьюпортом < 1280 на обоих
 * проектах (мобильный Pixel 7 и так уже уже, десктопный по умолчанию
 * 1440×900 — шире порога, поэтому для него вьюпорт сужаем вручную).
 */
async function openBurgerViewport(page: Page) {
  const size = page.viewportSize();
  if (!size || size.width >= 1280) {
    await page.setViewportSize({ width: 1024, height: 900 });
  }
}

test('ниже 1280px кнопка-бургер видна, горизонтальное меню скрыто', async ({ page }) => {
  await openBurgerViewport(page);
  await page.goto('/');
  await expect(page.locator('#burger-toggle')).toBeVisible();
  await expect(page.locator('#desktop-nav')).toBeHidden();
});

test('от 1280px горизонтальное меню видно, бургер скрыт', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('#desktop-nav')).toBeVisible();
  await expect(page.locator('#burger-toggle')).toBeHidden();
});

test('клик по бургеру открывает панель со всеми ссылками, видимыми и кликабельными', async ({ page }) => {
  await openBurgerViewport(page);
  await page.goto('/');

  const panel = page.locator('#mobile-nav');
  const links = panel.locator('nav a[href^="/#"]');

  await page.locator('#burger-toggle').click();

  await expect(panel).toHaveClass(/is-open/);
  await expect(links).toHaveCount(4);
  for (const link of await links.all()) {
    await expect(link).toBeVisible();
    await expect(link).toBeEnabled();
  }
});

test('клик по ссылке в панели закрывает её и ведёт к нужной секции', async ({ page }) => {
  await openBurgerViewport(page);
  await page.goto('/');

  await page.locator('#burger-toggle').click();
  const panel = page.locator('#mobile-nav');
  await expect(panel).toHaveClass(/is-open/);

  await panel.locator('a[href="/#dlya-biznesa"]').click();

  await expect(panel).not.toHaveClass(/is-open/);
  await expect(page.locator('#burger-toggle')).toHaveAttribute('aria-expanded', 'false');
  // Тот же документ ("/" -> "/#dlya-biznesa"), поэтому это переход внутри
  // страницы, а не перезагрузка — секция должна оказаться в кадре.
  await expect(page).toHaveURL(/#dlya-biznesa$/);
  await expect(page.locator('#dlya-biznesa')).toBeInViewport();
});

test('Escape закрывает панель', async ({ page }) => {
  await openBurgerViewport(page);
  await page.goto('/');

  await page.locator('#burger-toggle').click();
  const panel = page.locator('#mobile-nav');
  await expect(panel).toHaveClass(/is-open/);

  await page.keyboard.press('Escape');

  await expect(panel).not.toHaveClass(/is-open/);
  await expect(page.locator('#burger-toggle')).toHaveAttribute('aria-expanded', 'false');
});

test('клик по подложке закрывает панель', async ({ page }) => {
  await openBurgerViewport(page);
  await page.goto('/');

  await page.locator('#burger-toggle').click();
  const panel = page.locator('#mobile-nav');
  await expect(panel).toHaveClass(/is-open/);

  // Подложка растянута на весь экран, но перекрыта панелью справа —
  // кликаем заведомо в левой части экрана, где панели (320px) точно нет.
  await page.locator('#mobile-nav-backdrop').click({ position: { x: 5, y: 5 } });

  await expect(panel).not.toHaveClass(/is-open/);
});

test('aria-expanded на кнопке-бургере меняется при открытии/закрытии', async ({ page }) => {
  await openBurgerViewport(page);
  await page.goto('/');

  const toggle = page.locator('#burger-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('пока панель открыта, страница под ней не прокручивается', async ({ page }) => {
  await openBurgerViewport(page);
  // html {scroll-behavior: smooth} (global.css) делает колёсный скролл
  // асинхронным и по времени неопределённым для теста — reduced motion
  // переключает его на auto (мгновенный), см. global.css, тот же приём,
  // что в visual.spec.ts.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  // Курсор должен стоять над документом (не в его исходных 0,0, откуда
  // колесо иногда не попадает по скроллящемуся элементу).
  const size = page.viewportSize() ?? { width: 800, height: 600 };
  await page.mouse.move(size.width / 2, size.height / 2);

  // Одиночное синтетическое колесо от Playwright не всегда даёт эффект с
  // первой попытки сразу после goto (первое событие иногда "проглатывается"
  // ещё до готовности страницы к скроллу) — крутим несколько раз подряд
  // вместо одной жёстко таймированной прокрутки и читаем итоговую позицию.
  async function wheelSeveralTimes(times = 8): Promise<number> {
    for (let i = 0; i < times; i++) {
      await page.mouse.wheel(0, 400);
    }
    return page.evaluate(() => window.scrollY);
  }

  // Без прокрутки не проверить блокировку — сначала убеждаемся, что вообще
  // есть куда скроллить и скролл колесом действительно работает штатно.
  const scrolledBeforeOpen = await wheelSeveralTimes();
  expect(scrolledBeforeOpen).toBeGreaterThan(0);

  await page.locator('#burger-toggle').click();
  await expect(page.locator('#mobile-nav')).toHaveClass(/is-open/);

  const scrollAtOpen = await page.evaluate(() => window.scrollY);
  // Несколько попыток подряд — ни одна не должна сдвинуть страницу.
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 400);
  }
  const scrollAfterWheel = await page.evaluate(() => window.scrollY);
  expect(scrollAfterWheel).toBe(scrollAtOpen);

  // Закрываем и проверяем, что скролл снова штатно работает — иначе тест
  // выше мог бы пройти просто потому, что скролл сломан вообще.
  await page.keyboard.press('Escape');
  const scrollAfterClose = await wheelSeveralTimes();
  expect(scrollAfterClose).toBeGreaterThan(scrollAtOpen);
});
