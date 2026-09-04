import { expect, test } from '@playwright/test';

test('кнопка WhatsApp ведёт на настоящий номер и помечена источником', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('a[data-cta="test-primitive"]');
  await expect(button).toHaveAttribute('href', /wa\.me\/77011325970/);
  await expect(button).toHaveAttribute('rel', /noopener/);
});

test('ссылка на телефон использует tel: с международным префиксом', async ({ page }) => {
  await page.goto('/');
  const phone = page.locator('a[data-cta="test-phone"]');
  await expect(phone).toHaveAttribute('href', 'tel:+77011325970');
});

// Проверка уникальности id между несколькими brand-*.svg на одной странице
// перенесена в tests/e2e/equipment.spec.ts — там их четыре подряд рядом
// по-настоящему (ряд брендов), а не тестовая площадка #test-icons, которую
// удалит задача 12.
