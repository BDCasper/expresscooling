import { expect, test } from '@playwright/test';

test('вес страницы укладывается в бюджет', async ({ page }) => {
  let total = 0;
  const byType: Record<string, number> = {};

  page.on('response', async (res) => {
    const len = Number(res.headers()['content-length'] ?? 0);
    if (!len) return;
    total += len;
    const type = res.request().resourceType();
    byType[type] = (byType[type] ?? 0) + len;
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');

  console.log('вес по типам:', byType);
  expect(total).toBeLessThan(800 * 1024);
});

test('внешних JS-файлов нет', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'script' && new URL(r.url()).hostname !== 'localhost') {
      external.push(r.url());
    }
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(external).toEqual([]);
});
