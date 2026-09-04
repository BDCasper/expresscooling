import { expect, test } from '@playwright/test';

test('три шага выезда', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#kak-rabotaem [data-step]')).toHaveCount(3);
});

test('двенадцать брендов, каждый читается текстом', async ({ page }) => {
  await page.goto('/');
  const brands = page.locator('#oborudovanie [data-brand]');
  await expect(brands).toHaveCount(12);

  // Логотип картинкой поисковик не прочитает: у каждого бренда
  // обязан быть текстовый эквивалент — либо видимый текст, либо
  // aria-label на самом значке (LG, Samsung, Bosch, Hitachi рисуются
  // значком, без подписи рядом — так в макете, добавлять подпись,
  // которой там нет, не нужно).
  const names = await brands.evaluateAll((ns) =>
    ns.map(
      (n) =>
        (n.textContent ?? '').trim() ||
        n.getAttribute('aria-label') ||
        n.querySelector('[aria-label]')?.getAttribute('aria-label') ||
        n.querySelector('img,svg')?.getAttribute('alt') ||
        '',
    ),
  );
  for (const name of names) expect(name.length).toBeGreaterThan(1);
});

test('четыре категории оборудования', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#oborudovanie [data-equipment]')).toHaveCount(4);
});

test('ряд логотипов брендов не делит id между экземплярами', async ({ page }) => {
  // Все brand-*.svg выгружены из Figma одним инструментом и делят внутри
  // id (clip0_0_4, Icon, Vector). Эта секция — первое место на сайте, где
  // рядом стоят все четыре бренда сразу, поэтому именно здесь защита
  // Icon.astro (уникальный префикс на экземпляр) проверяется по-настоящему.
  await page.goto('/');

  const ids = await page.locator('#oborudovanie [data-brand] [id]').evaluateAll((nodes) => nodes.map((n) => n.id));

  expect(ids.length).toBeGreaterThan(0);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  expect(duplicates).toEqual([]);

  // Каждая ссылка url(#...) обязана разрешаться в id, реально присутствующий
  // на странице — иначе она молча ссылается в никуда или на чужой экземпляр.
  const refs = await page
    .locator('#oborudovanie [data-brand]')
    .evaluateAll((nodes) =>
      nodes.flatMap((n) =>
        Array.from(n.querySelectorAll('[fill],[clip-path],[mask],[filter]')).flatMap((el) =>
          ['fill', 'clip-path', 'mask', 'filter']
            .map((attr) => el.getAttribute(attr))
            .filter((v): v is string => !!v && v.startsWith('url(#'))
            .map((v) => v.slice(5, -1)),
        ),
      ),
    );

  const idSet = new Set(ids);
  for (const ref of refs) expect(idSet.has(ref)).toBe(true);
});
