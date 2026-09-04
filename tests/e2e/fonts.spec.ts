import { expect, test } from '@playwright/test';

test('шрифт Onest отдаётся со своего домена и подключён к body', async ({ page }) => {
  const fontRequests: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fontRequests.push(r.url());
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  expect(fontRequests.length).toBeGreaterThan(0);
  for (const url of fontRequests) {
    expect(url).toContain('/fonts/onest-');
  }

  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Onest');
});

test('символ ₸ подключает отдельный шрифт с диапазоном валютных знаков', async ({ page }) => {
  // Тенге (U+20B8) не входит ни в кириллический, ни в латинский файл Onest —
  // для него подключён третий @font-face с unicode-range: U+20A0-20C0 и
  // src: onest-currency.woff2. Явно просим браузер разрешить глиф для этого
  // символа через Font Loading API — это надёжнее, чем полагаться на layout
  // с фиксированным ожиданием, и одинаково детерминировано на обоих проектах.
  const fontRequests: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fontRequests.push(r.url());
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.load('400 16px Onest', '₸'));

  expect(fontRequests.some((url) => url.includes('/fonts/onest-currency.woff2'))).toBe(true);
});
