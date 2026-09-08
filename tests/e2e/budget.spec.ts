import { expect, test } from '@playwright/test';

test('вес страницы укладывается в бюджет', async ({ page }) => {
  let total = 0;
  const byType: Record<string, number> = {};

  page.on('response', async (res) => {
    // Заголовок content-length есть не у всех ответов — dev/preview-сервер
    // Astro отдаёт HTML-документ без него, поэтому раньше такие ответы (в
    // том числе сам документ страницы со встроенными скриптами) молча
    // пропускались и не попадали в подсчёт. Настоящий вес тела ответа — из
    // res.body(), а не из заголовка, который может отсутствовать или врать.
    let len = 0;
    try {
      len = (await res.body()).length;
    } catch {
      // Ответ мог быть перенаправлением/без тела — тогда просто 0.
      return;
    }
    if (!len) return;
    total += len;
    const type = res.request().resourceType();
    byType[type] = (byType[type] ?? 0) + len;
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');

  console.log('вес по типам:', byType);

  /**
   * Нижние границы защищают от того, что подсчёт снова начнёт молча терять
   * ресурсы (пятая версия этой тавтологии в проекте): без них тест мерил
   * 294 КБ (только картинки и шрифты через content-length) вместо реальных
   * ~440-460 КБ и проходил бы, даже если сам HTML-документ выпадет из
   * подсчёта.
   *
   * Значение 150 КБ из первоначального требования само по себе перестало
   * различать эти два случая: после добавления WebP-фолбэка (см. дефект 2
   * этой же задачи) одни только картинки в byType.image легко превышают
   * 150 КБ, поэтому граница проходила бы и с "дырявым" content-length-
   * подсчётом, не заметив пропажи document. Проверено вживую: с обратно
   * включённым content-length-подсчётом byType.document пропадает, а
   * total (294-309 КБ по обоим проектам) всё ещё больше 150 КБ.
   *
   * Поэтому здесь две прицельные проверки вместо одной: конкретно byType.document
   * должен быть заметно больше нуля (сам факт, что документ вообще попал в
   * подсчёт), а общий total — заметно выше суммы, которую даёт подсчёт без
   * него (294-309 КБ по фактическим замерам), но с запасом ниже реального
   * бюджета в 800 КБ.
   */
  expect(byType.document ?? 0).toBeGreaterThan(100 * 1024);
  expect(total).toBeGreaterThan(350 * 1024);
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

test('встроенные скрипты укладываются в бюджет 6144 байт', async ({ page }) => {
  /**
   * Потолок поднят с 4.5 КБ (4608 байт) до 6 КБ (6144 байт) ради бургер-меню
   * в Header.astro (задача "burger-blur") — на момент правки три встроенных
   * скрипта (аналитика в Base.astro, RevealFallback.astro, бургер-меню)
   * весят 5929 байт сырых. Само число проверяем на актуальной, а не
   * зафиксированной странице: считаем содержимое каждого <script> без
   * атрибута src (внешних тут и так ноль — см. тест выше) и не
   * application/ld+json (это данные, не код). JSON.stringify(schema) в
   * Base.astro меняется вместе с данными сайта, поэтому его размер не
   * бюджетируется как код.
   */
  const response = await page.goto('/', { waitUntil: 'networkidle' });
  const html = (await response?.body())?.toString('utf8') ?? '';

  const scripts = Array.from(
    html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g),
  ).map((m) => m[1]);

  expect(scripts.length).toBeGreaterThan(0);

  const totalBytes = scripts.reduce((sum, code) => sum + Buffer.byteLength(code, 'utf8'), 0);
  console.log('встроенные скрипты, байт:', totalBytes, 'по одному:', scripts.map((s) => Buffer.byteLength(s, 'utf8')));

  expect(totalBytes).toBeLessThanOrEqual(6144);
});
