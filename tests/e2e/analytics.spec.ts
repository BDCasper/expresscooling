import { expect, test } from '@playwright/test';

const TAG_HOST = 'googletagmanager.com';

test('до взаимодействия трекер не грузится', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.hostname !== 'localhost') external.push(r.url());
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(external.filter((u) => u.includes(TAG_HOST))).toHaveLength(0);
});

test('на странице нет внешних JS-файлов', async ({ page }) => {
  await page.goto('/');
  const srcs = await page.locator('script[src]').evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLScriptElement).src),
  );
  for (const src of srcs) {
    expect(new URL(src).hostname).toBe('localhost');
  }
});

test('клик по CTA кладёт событие в dataLayer с меткой источника', async ({ page }) => {
  await page.goto('/');
  // Отменяем переход, чтобы не уходить на wa.me
  await page.route('**/wa.me/**', (route) => route.abort());
  await page.locator('a[data-cta]').first().click({ button: 'left' }).catch(() => {});

  const events = await page.evaluate(() => (window as any).dataLayer ?? []);
  const serialized = JSON.stringify(events);
  expect(serialized).toContain('whatsapp_click');
});

test('UTM-метки дописываются в сообщение WhatsApp', async ({ page }) => {
  await page.goto('/?gclid=TEST123&utm_source=google');
  const href = await page.locator('a[data-cta]').first().getAttribute('href');
  const text = new URL(href ?? '').searchParams.get('text') ?? '';
  expect(text).toContain('TEST123');
  expect(text).toContain('google');
});
