import { expect, test } from '@playwright/test';

const ANCHORS = ['#polomki', '#kak-rabotaem', '#oborudovanie', '#dlya-biznesa'];

test('секции идут в порядке макета', async ({ page }) => {
  await page.goto('/');
  const order = await page.locator('main > section').evaluateAll((ns) =>
    ns.map((n) => n.getAttribute('data-section') ?? ''),
  );
  expect(order).toEqual([
    'hero', 'facts', 'breakages', 'how-it-works',
    'equipment', 'warehouse', 'business', 'not-doing',
  ]);
});

test('все якоря ведут в реальные секции', async ({ page }) => {
  await page.goto('/');
  for (const a of ANCHORS) {
    await expect(page.locator(a)).toHaveCount(1);
  }
});

test('горизонтального скролла нет ни на одном брейкпоинте', async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `ширина ${width}px`).toBeLessThanOrEqual(1);
  }
});

test('заглушек и незаполненных мест не осталось', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('body').innerText()).toLowerCase();
  for (const marker of ['lorem', 'placeholder', 'tbd', 'todo', 'заглушка']) {
    expect(text).not.toContain(marker);
  }
});

// Защита от возврата временной оснастки Task 5/6 (WhatsAppButton
// source="test-primitive", PhoneButton source="test-phone", #test-icons):
// сама оснастка удалена в Task 12 вместе с primitives.spec.ts, но ничто не
// мешает ей вернуться незамеченной при слиянии веток или copy-paste секции.
// Реальные data-cta на странице — источники аналитики вида "hero",
// "card-<slug>", "footer-phone-<n>" — ни один не начинается с "test-".
test('временная оснастка задач 5-6 не вернулась на страницу', async ({ page }) => {
  await page.goto('/');

  const testCtas = await page.locator('[data-cta^="test-"]').count();
  expect(testCtas).toBe(0);

  await expect(page.locator('#test-icons')).toHaveCount(0);
});

/**
 * Зелёная плашка WhatsApp (bg-wa, #25D366) несёт белый текст и белый
 * значок — правка заказчика поверх макета, где и то и другое было
 * тёмно-зелёным (--color-wa-ink, #08251A). Цвет значка при этом запечён в
 * сам SVG (см. Icon.astro), поэтому одной подмены класса текста мало:
 * проверяем и заливку внутри <svg>, иначе вернувшийся тёмный файл значка
 * остался бы незамеченным на белой подписи. Кнопок с плашкой на странице
 * несколько (шапка, hero, бургер, «Другая поломка», футер, для бизнеса) —
 * проверяем все, а не первую.
 */
test('на зелёных кнопках WhatsApp текст и значок белые', async ({ page }) => {
  await page.goto('/');

  const solid = page.locator('a[data-cta][class*="bg-wa"]');
  const count = await solid.count();
  expect(count).toBeGreaterThan(3);

  for (let i = 0; i < count; i++) {
    const button = solid.nth(i);
    const source = await button.getAttribute('data-cta');

    expect(await button.evaluate((el) => getComputedStyle(el).color), `текст кнопки ${source}`).toBe(
      'rgb(255, 255, 255)',
    );

    const fills = await button
      .locator('svg path')
      .evaluateAll((paths) => paths.map((p) => (p.getAttribute('fill') ?? '').toUpperCase()));
    expect(fills.length, `значок кнопки ${source}`).toBeGreaterThan(0);
    for (const fill of fills) {
      expect(fill, `заливка значка кнопки ${source}`).toBe('#FFFFFF');
    }
  }
});
