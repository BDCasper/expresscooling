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

test('иконки двух разных брендов на одной странице не делят id между собой', async ({ page }) => {
  // Все brand-*.svg выгружены из Figma одним инструментом и внутри имеют
  // совпадающие id (clip0_0_4, Icon, Vector). Если Icon.astro не переписывает
  // их под уникальный префикс на каждый экземпляр, второй SVG на странице
  // унаследует clip-path первого через одинаковый id — и обрежется чужой
  // маской. Проверяем на уровне HTML: ни один id не должен повторяться дважды.
  await page.goto('/');

  const ids = await page.locator('#test-icons [id]').evaluateAll((nodes) => nodes.map((n) => n.id));

  expect(ids.length).toBeGreaterThan(0);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  expect(duplicates).toEqual([]);
});
