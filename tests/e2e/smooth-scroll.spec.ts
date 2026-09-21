import { expect, test, type Page } from '@playwright/test';

/**
 * Инерционная прокрутка колесом (SmoothScroll.astro). Тесты проверяют
 * механику, а не «ощущение плавности»: Chrome и сам слегка анимирует
 * нативную прокрутку колесом, поэтому «двигалось несколько кадров» —
 * не признак того, что работает именно наш скрипт. Однозначные признаки
 * ровно два: событие wheel отменено (значит страницу везёт скрипт, а не
 * браузер) и итоговая дистанция равна дельте события один к одному
 * (значит скрипт не подмешал множитель скорости — самая заметная и самая
 * раздражающая ошибка в таких скриптах).
 */

async function centerPointer(page: Page) {
  const size = page.viewportSize() ?? { width: 800, height: 600 };
  await page.mouse.move(size.width / 2, size.height / 2);
}

/** Ждём, пока инерция доедет: две подряд одинаковые позиции. */
async function settledScrollY(page: Page): Promise<number> {
  let prev = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === prev) return y;
    prev = y;
    await page.waitForTimeout(50);
  }
  return prev;
}

/**
 * Первое синтетическое колесо после goto иногда «проглатывается» ещё до
 * готовности страницы к прокрутке — та же оговорка, что в burger.spec.ts.
 * Крутим на разогрев, дожидаемся движения и возвращаемся в ноль мгновенной
 * прокруткой (behavior: 'instant' — обычный scrollTo подчинился бы
 * scroll-behavior: smooth из global.css и уехал бы анимацией).
 */
async function warmUpAndReset(page: Page) {
  await page.mouse.wheel(0, 200);
  await page.waitForFunction(() => window.scrollY > 0, undefined, { timeout: 5000 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => window.scrollY === 0);
}

test('колесо везёт скрипт, и дистанция равна дельте события', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await centerPointer(page);

  // Слушатель добавлен после скрипта, поэтому в порядке вызова он идёт
  // вторым и видит уже выставленный defaultPrevented. passive: true —
  // сам он ничего не отменяет.
  await page.evaluate(() => {
    (window as unknown as { prevented: boolean[] }).prevented = [];
    addEventListener(
      'wheel',
      (ev) => (window as unknown as { prevented: boolean[] }).prevented.push(ev.defaultPrevented),
      { passive: true },
    );
  });

  await warmUpAndReset(page);
  await page.mouse.wheel(0, 400);
  const y = await settledScrollY(page);

  // Допуск 2 px — браузер округляет позицию прокрутки до физического
  // пикселя, а на мобильном проекте devicePixelRatio не единица.
  expect(Math.abs(y - 400), `доехали до ${y}, ожидали 400`).toBeLessThanOrEqual(2);

  const prevented = await page.evaluate(() => (window as unknown as { prevented: boolean[] }).prevented);
  expect(prevented.length).toBeGreaterThan(0);
  expect(prevented.every(Boolean), 'событие wheel не отменено — страницу везёт браузер, а не скрипт').toBe(true);
});

test('при prefers-reduced-motion скрипт не вмешивается вовсе', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await centerPointer(page);

  await page.evaluate(() => {
    (window as unknown as { prevented: boolean[] }).prevented = [];
    addEventListener(
      'wheel',
      (ev) => (window as unknown as { prevented: boolean[] }).prevented.push(ev.defaultPrevented),
      { passive: true },
    );
  });

  await page.mouse.wheel(0, 400);
  await page.waitForFunction(() => window.scrollY > 0, undefined, { timeout: 5000 });

  const prevented = await page.evaluate(() => (window as unknown as { prevented: boolean[] }).prevented);
  expect(prevented.length).toBeGreaterThan(0);
  expect(prevented.some(Boolean), 'скрипт отменил wheel, хотя движение запрошено сокращённым').toBe(false);
});

/**
 * burger.spec.ts проверяет блокировку прокрутки при открытом меню, но
 * прогоняется с reducedMotion: 'reduce' — то есть мимо этого скрипта.
 * Здесь тот же случай без сокращённого движения: скрипт обязан заметить
 * overflow-y: hidden на <html> и отдать колесо браузеру, иначе он повезёт
 * заблокированную страницу сам.
 */
test('при открытом бургер-меню сглаживание не двигает страницу', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await centerPointer(page);
  await warmUpAndReset(page);

  await page.locator('#burger-toggle').click();
  await expect(page.locator('#mobile-nav')).toHaveClass(/is-open/);

  const before = await page.evaluate(() => window.scrollY);
  for (let i = 0; i < 5; i++) await page.mouse.wheel(0, 400);
  expect(await settledScrollY(page)).toBe(before);
});
