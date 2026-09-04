import { expect, test } from '@playwright/test';

/**
 * Chromium (в том числе бандл Playwright) уже умеет animation-timeline:
 * view() нативно — проверено отдельно (`CSS.supports('animation-timeline',
 * 'view()')` возвращает true). Значит просто подменить JS-функцию
 * CSS.supports недостаточно: нативный CSS-движок разрешает
 * `@supports (animation-timeline: view())` независимо от того, что
 * отвечает JS API, и ветка `@supports not (...)` в global.css в реальном
 * Chromium никогда не активируется, как бы её ни просило JS.
 *
 * Чтобы честно воспроизвести браузер без поддержки (то, что увидел бы
 * Firefox с настройками по умолчанию), перехватываем HTML-документ и
 * заменяем "animation-timeline:view()" (собранный CSS минифицирован —
 * пробела после ":" нет, см. dist/index.html) на заведомо невалидное имя
 * свойства прямо в отданном `<style>`. Тогда нативный `@supports (…)` с
 * этим именем возвращает false в любом браузере, а `@supports not (…)` —
 * true, и в силу вступает именно тот CSS, который увидел бы настоящий
 * Firefox. JS-функция CSS.supports подменяется отдельно и независимо —
 * это то, что проверяет собственный код RevealFallback.astro (форма его
 * вызова, `CSS.supports('animation-timeline', 'view()')` — строковые
 * аргументы через запятую — под паттерн замены CSS не подходит и не
 * задевается этой заменой).
 */
async function forceUnsupportedAnimationTimeline(page: import('@playwright/test').Page) {
  await page.route('**/', async (route) => {
    if (route.request().resourceType() !== 'document') {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const body = await response.text();
    const patched = body.replaceAll('animation-timeline:view()', 'definitely-unsupported-property:1');
    await route.fulfill({ response, body: patched });
  });
}

test.describe('фолбэк анимации появления в браузере без animation-timeline: view()', () => {
  test('с работающим JS: контент скрывается и затем становится видимым', async ({ page }) => {
    await forceUnsupportedAnimationTimeline(page);
    // Свою JS-проверку RevealFallback.astro тоже переводим в "не поддерживается",
    // синхронно с тем, что теперь отвечает нативный @supports.
    await page.addInitScript(() => {
      const real = CSS.supports.bind(CSS);
      // @ts-expect-error переопределение только для теста
      CSS.supports = (...args) => (args[0] === 'animation-timeline' ? false : real(...args));
    });

    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(/js-reveal/);

    const probe = page.getByTestId('reveal-probe');
    await expect(probe).toHaveClass(/is-visible/);
    await expect(probe).toHaveCSS('opacity', '1');
  });

  test.describe('с полностью отключённым JavaScript', () => {
    // javaScriptEnabled: false — самый важный сценарий из этого раунда:
    // скрипта, который мог бы поставить класс js-reveal и потом снять
    // opacity: 0, здесь нет и не будет. Правильный результат — контент
    // остаётся видимым, потому что CSS не скрывает его без .js-reveal.
    // test.use (а не ручной browser.newContext) нужен, чтобы контекст
    // унаследовал baseURL и остальные project-опции из playwright.config.
    test.use({ javaScriptEnabled: false });

    test('контент виден сразу, без анимации', async ({ page }) => {
      await forceUnsupportedAnimationTimeline(page);

      await page.goto('/');

      await expect(page.locator('html')).not.toHaveClass(/js-reveal/);

      const probe = page.getByTestId('reveal-probe');
      await expect(probe).toHaveCSS('opacity', '1');
    });
  });
});
