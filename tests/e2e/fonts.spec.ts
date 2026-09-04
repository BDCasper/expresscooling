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

  // Отдельно от факта загрузки шрифта (её уже обеспечивает голое `body {
  // font-family }` в global.css) проверяем, что <body> явно подключает
  // именно Tailwind-утилиту font-sans. Это важно при @source-ограниченном
  // сканировании: если ни один файл в src/ не использует класс font-sans,
  // Tailwind не сгенерирует для него CSS вовсе.
  const bodyClass = await page.locator('body').getAttribute('class');
  expect(bodyClass).toContain('font-sans');

  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Onest');
});
