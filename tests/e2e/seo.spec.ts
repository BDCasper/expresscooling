import { expect, test } from '@playwright/test';

test('robots.txt разрешает обход и указывает карту сайта', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('Sitemap: https://expresscooling.kz/sitemap-index.xml');
  expect(body).not.toMatch(/^Disallow: \/$/m);
});

test('карта сайта отдаётся', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  expect(res.status()).toBe(200);
});

test('страница 404 существует и не индексируется', async ({ page }) => {
  await page.goto('/nesushchestvuyushchaya-stranica');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('link', { name: /на главную/i })).toBeVisible();
});

test('иерархия заголовков не имеет разрывов', async ({ page }) => {
  await page.goto('/');
  const levels = await page
    .locator('h1, h2, h3, h4')
    .evaluateAll((ns) => ns.map((n) => Number(n.tagName[1])));

  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  }
});

test('у каждого изображения осмысленный alt', async ({ page }) => {
  await page.goto('/');
  const alts = await page.locator('img').evaluateAll((ns) =>
    ns.map((n) => n.getAttribute('alt') ?? ''),
  );
  for (const alt of alts) {
    expect(alt.trim().length).toBeGreaterThan(5);
  }
});
