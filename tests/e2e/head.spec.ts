import { expect, test } from '@playwright/test';

test('мета-данные заполнены', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Ремонт холодильников/i);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Алматы/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://expresscooling.kz/');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
});

test('на странице ровно один h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('JSON-LD валиден и содержит настоящие телефоны', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(raw ?? '');
  expect(data['@type']).toBe('LocalBusiness');
  expect(data.telephone).toContain('+77011325970');
  expect(data.areaServed.name).toBe('Алматы');
  expect(data.openingHoursSpecification[0].opens).toBe('06:00');
  expect(data.address).toBeUndefined();
});

test('шрифты предзагружаются', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2);
});
