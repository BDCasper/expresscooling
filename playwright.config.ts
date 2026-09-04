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
    reuseExistingServer: !process.env.CI,
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
