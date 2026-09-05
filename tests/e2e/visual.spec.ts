import { expect, test } from '@playwright/test';

const SECTIONS = [
  'hero', 'facts', 'breakages', 'how-it-works',
  'equipment', 'warehouse', 'business', 'not-doing',
];

// Плотность пикселей снимка не выше 1: у мобильного проекта (Pixel 7) она
// 2.625 по умолчанию, что раздувает вес каждого эталона более чем вдвое без
// пользы для ловли сдвигов вёрстки. Переопределяем только для этого файла —
// остальные тесты мобильного проекта по-прежнему используют реальный DPR.
test.use({ deviceScaleFactor: 1 });

test.describe('визуальная регрессия', () => {
  for (const section of SECTIONS) {
    test(`секция ${section} не изменилась`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      // Анимации появления выключаем, иначе снимок зависит от момента съёмки.
      await page.emulateMedia({ reducedMotion: 'reduce' });

      // Прокручиваем до низа и обратно, чтобы догрузились все ленивые
      // изображения (loading="lazy") по всей странице, а не только в целевой
      // секции — иначе фото ниже по странице остаются серыми плашками.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));

      // AVIF не успевает декодироваться к моменту networkidle — без паузы
      // фотография в кадре снимка выглядит отсутствующей (see task-14-brief).
      await page.waitForTimeout(1200);

      const target = page.locator(`[data-section="${section}"]`);
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // Секции выше высоты вьюпорта (breakages, equipment и т.п.) Chromium
      // иначе снимал бы по частям со скроллом и склеивал в один PNG — а липкая
      // шапка (`position: sticky`) на каждом внутреннем кадре прилипает к
      // своему локальному верху и оказывается «впечатанной» в середину
      // итогового снимка. Хуже того: точная точка склейки кадров у Chromium
      // не детерминирована день в день, из-за чего один и тот же прогон без
      // этой правки давал то одно, то другое положение шапки на снимке —
      // поймано вживую при повторном прогоне (2-й прогон уронил `business`
      // с диффом ровно по полосе шапки, см. task-14-report.md). Раздуваем
      // вьюпорт по высоте до размера самой секции, чтобы Chromium снимал её
      // за один кадр без склейки и артефакта — тогда результат стабилен.
      const box = await target.boundingBox();
      if (box) {
        const viewport = page.viewportSize();
        await page.setViewportSize({
          width: viewport?.width ?? 1280,
          height: Math.ceil(box.height) + 100,
        });
        await target.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
      }

      await expect(target).toHaveScreenshot(`${section}.png`, { maxDiffPixelRatio: 0.01 });
    });
  }
});

test('состояние наведения на карточке поломки отличается от обычного', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-breakage]').first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(250);
  const after = await card.boundingBox();
  expect(after?.y).toBeLessThan((before?.y ?? 0) + 0.5);
});
