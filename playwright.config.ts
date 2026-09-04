import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321' },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    // Безусловно false, а не `!process.env.CI`. Локально CI не выставлен,
    // и с `!process.env.CI` Playwright переиспользовал уже поднятый на
    // 4321 preview-сервер вместо пересборки — после правки CSS/компонента
    // тесты молча прогонялись на устаревшем dist/ и давали ложный зелёный
    // результат (поймано вживую в раунде правок 1 задачи 5, воспроизведено
    // намеренно в раунде 2 — см. task-5-report.md). Сборка занимает меньше
    // секунды, а цена незамеченной регрессии на девяти следующих задачах
    // вёрстки несопоставимо выше. Не возвращать на `!process.env.CI`.
    reuseExistingServer: false,
    timeout: 120_000,
    // Astro 7 переводит `astro preview` в фоновый демон, когда определяет
    // запуск из-под AI-агента (пакет am-i-vibing), из-за чего процесс
    // мгновенно завершается и Playwright считает вебсервер упавшим.
    // Эта переменная — штатный флаг Astro, которым он помечает уже
    // запущенный фоновый процесс, чтобы не демонизировать его повторно;
    // выставляя её здесь, мы держим процесс на переднем плане, как и
    // ожидает webServer. Вне агентского окружения на поведение не влияет.
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
});
