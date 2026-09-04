import { expect, test } from '@playwright/test';
import { site } from '../../src/data/site';

test('в футере оба настоящих номера и ни одного из макета', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');

  for (const phone of site.phones) {
    await expect(footer.getByText(phone.display)).toBeVisible();
    await expect(footer.locator(`a[href="tel:${phone.raw}"]`)).toHaveCount(1);
  }

  const html = (await footer.innerHTML()) ?? '';
  expect(html).not.toContain('776 025 1088');
  expect(html).not.toContain('707 888 7371');
});

test('футер сообщает город и режим работы', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByText(site.city)).toBeVisible();
  await expect(footer.getByText(`Заявки ${site.hours.label}`)).toBeVisible();
});

test('три позиции скидок', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-discount]')).toHaveCount(3);
});
