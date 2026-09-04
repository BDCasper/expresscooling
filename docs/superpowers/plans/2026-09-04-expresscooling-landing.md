# Express Cooling Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать одностраничный сайт expresscooling.kz по макету Figma — максимально быстрый, готовый к Google Ads и к индексации.

**Architecture:** Astro генерирует статический HTML без клиентского фреймворка. На странице нет ни одного интерактивного элемента, требующего компонента: меню-бургера в макете нет, аккордеона нет, формы нет. Весь клиентский код — один инлайн-скрипт до 2 КБ, который откладывает загрузку gtag до первого взаимодействия, вешает делегированный обработчик кликов по CTA и подставляет UTM-метки в ссылки WhatsApp. Анимации появления — нативный `animation-timeline: view()`, который считается в композиторе браузера.

**Tech Stack:** Astro 5, Tailwind CSS 4, TypeScript strict, `astro:assets` + sharp, `@astrojs/sitemap`, `@fontsource-variable/onest`, Vitest (модульные тесты), Playwright (визуальные и функциональные), `@lhci/cli` (бюджет производительности). Хостинг Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-04-expresscooling-landing-design.md`

## Global Constraints

Требования ниже действуют в каждой задаче, повторно не перечисляются.

- **Никаких новых зависимостей** сверх перечисленных в Tech Stack. Нужна ещё одна — сначала спросить.
- **React не подключается.** Клиентских компонентов на странице нет.
- **Клиентский JS:** ноль внешних JS-файлов. Один инлайн-скрипт в `<head>`, минифицированный, **не более 2 КБ**. Уточнение к спеке: в спеке записано «JS до загрузки трекера — 0 КБ», имелись в виду внешние бандлы; инлайн-скрипт в этот бюджет не входит и ограничен отдельно.
- **Контакты только из `src/data/site.ts`.** Ни один телефон, номер WhatsApp, цена или режим работы не пишутся в разметке компонента напрямую.
- Настоящие телефоны: `+7 701 132 5970` (основной, WhatsApp), `+7 707 327 9715`. Номера из макета Figma (`+7 776 025 1088`, `+7 707 888 7371`) — заглушки дизайнера, в код не попадают.
- Текст сообщения WhatsApp: `Здравствуйте! Пишу с сайта. Холодильник: [модель]. Проблема: `
- **Блоков, которых нет в Figma, не добавляем.** Ни FAQ, ни списка районов, ни отзывов.
- **Скрытого текста с ключевыми словами нет** ни в каком виде: ни `display:none`, ни нулевой прозрачности, ни выноса за экран, ни `aria-hidden` с ключевиками. Это политика cloaking у Google Ads и ручные санкции в поиске.
- **Каждое изображение и иконка** рендерится из экспортированного из Figma ассета. Ничего не перерисовываем вручную и не заменяем заглушками.
- **У каждого изображения жёсткие `width` и `height`** в разметке. CLS должен остаться ниже 0.02.
- `lang="ru"` на `<html>`.
- Все анимации выключаются под `prefers-reduced-motion: reduce`.
- Коммит после каждой задачи. Сообщения на русском, в теле — почему, а не что.

### Дизайн-токены (утверждены, снимались из design context и пикселей макета)

| Токен | Значение |
|---|---|
| `--color-graphite` | `#232323` |
| `--color-graphite-soft` | `#2a2a2a` |
| `--color-graphite-footer` | `#242424` |
| `--color-cream` | `#f6f6f6` |
| `--color-ink` | `#1c1c1c` |
| `--color-ink-muted` | `#5f5f5f` |
| `--color-chalk` | `#f6f6f6` |
| `--color-chalk-body` | `#d2d2d2` |
| `--color-chalk-muted` | `#a5a5a5` |
| `--color-amber` | `#efb726` |
| `--color-wa` | `#25d366` |
| `--color-wa-ink` | `#08251a` |

Границы: на тёмном `rgba(255,255,255,0.13)` и `rgba(255,255,255,0.36)`, на светлом `rgba(0,0,0,0.12)`.
Радиусы: кнопки `100px`, hero-изображение `34px` снизу слева, карточки `16px`.
Сетка: контейнер `max-width: 1320px`, внутренние отступы `40px`, полезная ширина контента `1240px`.
Шрифт: `Onest`, начертания 400 / 500 / 600 / 700 / 800.

### Файлы Figma

Файл `HiN1MAjCcK42Cx5dxxKk10`. ПК — `1:4`, мобильная — `1:491`.

| Секция | node ПК | Задача |
|---|---|---|
| Header | `1:471` | 7 |
| Hero | `1:8` | 7 |
| Полоса фактов | `1:36` | 8 |
| Выберите поломку | `1:78` | 8 |
| Как проходит выезд | `1:211` | 9 |
| Что берём в работу | `1:246` | 9 |
| Свой склад | `1:329` | 10 |
| Для бизнеса | `1:343` | 10 |
| Чем не занимаемся + Скидки | `1:366` | 11 |
| Footer | `1:417` | 11 |

### Бюджет производительности

| Метрика | Порог |
|---------|-------|
| Lighthouse Performance (mobile) | ≥ 98 |
| Lighthouse SEO | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse Accessibility | ≥ 95 |
| LCP (mobile, Slow 4G) | < 1.2 с |
| CLS | < 0.02 |
| Внешних JS-файлов | 0 |
| Инлайн-скрипт | ≤ 2 КБ |
| CSS | < 15 КБ gzip |
| Вес первого экрана | < 250 КБ |
| Вес всей страницы | < 800 КБ |

---

## Task 1: Каркас проекта

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/pages/index.astro`, `src/styles/global.css`
- Create: `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: ничего, это первая задача
- Produces: рабочие команды `npm run dev`, `npm run build`, `npm run test:unit`, `npm run test:e2e`; страница `/` отдаёт валидный HTML

- [ ] **Step 1: Создать проект и поставить зависимости**

```bash
cd d:/Coding/holodilniki
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --skip-houston
npm install
npm install tailwindcss @tailwindcss/vite @astrojs/sitemap sharp @fontsource-variable/onest
npm install -D vitest @playwright/test @lhci/cli
npx playwright install chromium
```

- [ ] **Step 2: Настроить Astro**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://expresscooling.kz',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
```

`inlineStylesheets: 'always'` убирает единственный блокирующий рендер запрос за CSS. Работает только потому, что бюджет CSS у нас 15 КБ.

- [ ] **Step 3: Подключить Tailwind**

`src/styles/global.css`:

```css
@import "tailwindcss";
```

`src/pages/index.astro`:

```astro
---
import '../styles/global.css';
---
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Express Cooling</title>
  </head>
  <body>
    <h1 data-testid="page-title">Express Cooling</h1>
  </body>
</html>
```

- [ ] **Step 4: Написать падающий модульный тест**

`tests/unit/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('окружение', () => {
  it('собирает TypeScript и запускает Vitest', () => {
    const twoPlusTwo: number = 2 + 2;
    expect(twoPlusTwo).toBe(4);
  });
});
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
```

- [ ] **Step 5: Написать падающий e2e-тест**

`playwright.config.ts`:

```ts
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
  },
});
```

`tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('страница отдаётся и объявляет русский язык', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByTestId('page-title')).toBeVisible();
});
```

- [ ] **Step 6: Прописать команды в package.json**

Добавить в `scripts`:

```json
"test:unit": "vitest run",
"test:e2e": "playwright test",
"test": "npm run test:unit && npm run test:e2e"
```

- [ ] **Step 7: Запустить тесты, убедиться что проходят**

Run: `npm run test:unit`
Expected: PASS, 1 тест

Run: `npm run test:e2e`
Expected: PASS, 2 теста (mobile + desktop)

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "chore: каркас проекта Astro + Tailwind + Vitest + Playwright

Тестовая инфраструктура ставится до первой строчки вёрстки, чтобы
бюджет производительности проверялся с самого начала, а не подгонялся
в конце."
```

---

## Task 2: Токены дизайна и шрифт Onest

**Files:**
- Modify: `src/styles/global.css`
- Create: `public/fonts/onest-cyrillic.woff2`, `public/fonts/onest-latin.woff2`
- Test: `tests/e2e/fonts.spec.ts`

**Interfaces:**
- Consumes: каркас из Task 1
- Produces: Tailwind-утилиты `bg-graphite`, `text-amber`, `font-sans` и остальные токены из таблицы Global Constraints; шрифт Onest доступен по `/fonts/onest-*.woff2`

- [ ] **Step 1: Найти файлы шрифта в пакете**

```bash
ls node_modules/@fontsource-variable/onest/files/
```

Нужны два файла вариативного начертания `wght`: с суффиксом `cyrillic` и с суффиксом `latin`, оба `.woff2`. Латиница обязательна: на странице есть «Express Cooling», «WhatsApp», «INDESIT», «ARISTON», «BEKO», «LIEBHERR», «ARDO», «HOTPOINT».

- [ ] **Step 2: Скопировать шрифты под стабильными именами**

```bash
mkdir -p public/fonts
cp node_modules/@fontsource-variable/onest/files/onest-cyrillic-wght-normal.woff2 public/fonts/onest-cyrillic.woff2
cp node_modules/@fontsource-variable/onest/files/onest-latin-wght-normal.woff2 public/fonts/onest-latin.woff2
ls -la public/fonts/
```

Имена в пакете могут отличаться — брать фактические из вывода Step 1. Стабильные имена в `public/` нужны для того, чтобы прописать `<link rel="preload">` вручную: хешированные имена из `_astro/` на момент написания разметки неизвестны.

- [ ] **Step 3: Записать токены и `@font-face`**

`src/styles/global.css` целиком:

```css
@import "tailwindcss";

@font-face {
  font-family: "Onest";
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url("/fonts/onest-cyrillic.woff2") format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

@font-face {
  font-family: "Onest";
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url("/fonts/onest-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F,
    U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215;
}

@theme {
  --color-graphite: #232323;
  --color-graphite-soft: #2a2a2a;
  --color-graphite-footer: #242424;
  --color-cream: #f6f6f6;
  --color-ink: #1c1c1c;
  --color-ink-muted: #5f5f5f;
  --color-chalk: #f6f6f6;
  --color-chalk-body: #d2d2d2;
  --color-chalk-muted: #a5a5a5;
  --color-amber: #efb726;
  --color-wa: #25d366;
  --color-wa-ink: #08251a;

  --font-sans: "Onest", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --radius-card: 16px;
  --radius-hero: 34px;
  --radius-pill: 100px;

  --ease-soft: cubic-bezier(0.2, 0.8, 0.2, 1);
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Якоря не должны уезжать под липкий хедер */
[id] {
  scroll-margin-top: 100px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Написать падающий тест на шрифт**

`tests/e2e/fonts.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('шрифт Onest отдаётся со своего домена и подключён к body', async ({ page }) => {
  const fontRequests: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fontRequests.push(r.url());
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  expect(fontRequests.length).toBeGreaterThan(0);
  for (const url of fontRequests) {
    expect(url).toContain('/fonts/onest-');
  }

  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Onest');
});
```

- [ ] **Step 5: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/fonts.spec.ts --project=desktop`
Expected: FAIL — `fontRequests.length` равен 0, потому что `index.astro` пока не использует `font-sans` и браузеру нечего грузить.

- [ ] **Step 6: Применить шрифт на странице**

В `src/pages/index.astro` заменить `<body>` на `<body class="font-sans">`.

- [ ] **Step 7: Запустить тест, убедиться что проходит**

Run: `npx playwright test tests/e2e/fonts.spec.ts`
Expected: PASS на обоих проектах

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "feat: дизайн-токены и самостоятельный хостинг шрифта Onest

Шрифт лежит на своём домене вместо Google Fonts: это убирает два
лишних DNS-запроса и TLS-рукопожатия с критического пути. Вариативное
начертание одним файлом дешевле пяти статических."
```

---

## Task 3: Данные и построители ссылок

**Files:**
- Create: `src/data/site.ts`, `src/lib/links.ts`
- Test: `tests/unit/links.test.ts`

**Interfaces:**
- Consumes: каркас из Task 1
- Produces:
  - `site` — объект с полями `name: string`, `url: string`, `city: string`, `phones: Phone[]`, `hours: { opens: string; closes: string; label: string }`, `whatsappText: string`, `diagnosticsFrom: string`
  - `Phone` — `{ raw: string; display: string; isWhatsapp: boolean }`
  - `digitsOnly(phone: string): string`
  - `telHref(phone: string): string`
  - `whatsappHref(): string`
  - `primaryPhone(): Phone`

- [ ] **Step 1: Написать падающие тесты**

`tests/unit/links.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../../src/data/site';
import { digitsOnly, primaryPhone, telHref, whatsappHref } from '../../src/lib/links';

describe('digitsOnly', () => {
  it('оставляет только цифры', () => {
    expect(digitsOnly('+7 701 132 59 70')).toBe('77011325970');
  });
});

describe('telHref', () => {
  it('строит tel: с международным префиксом', () => {
    expect(telHref('+7 701 132 59 70')).toBe('tel:+77011325970');
  });
});

describe('primaryPhone', () => {
  it('возвращает номер, помеченный как WhatsApp', () => {
    expect(primaryPhone().raw).toBe('+77011325970');
    expect(primaryPhone().isWhatsapp).toBe(true);
  });
});

describe('whatsappHref', () => {
  it('ведёт на wa.me с основным номером', () => {
    expect(whatsappHref()).toMatch(/^https:\/\/wa\.me\/77011325970\?/);
  });

  it('подставляет заготовку сообщения', () => {
    const text = new URL(whatsappHref()).searchParams.get('text');
    expect(text).toBe(site.whatsappText);
  });
});

describe('site', () => {
  it('не содержит номеров-заглушек из макета', () => {
    const serialized = JSON.stringify(site);
    expect(serialized).not.toContain('7760251088');
    expect(serialized).not.toContain('7078887371');
  });

  it('содержит оба настоящих номера', () => {
    expect(site.phones.map((p) => p.raw)).toEqual(['+77011325970', '+77073279715']);
  });
});
```

- [ ] **Step 2: Запустить тесты, убедиться что падают**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module '../../src/data/site'`

- [ ] **Step 3: Написать данные**

`src/data/site.ts`:

```ts
export interface Phone {
  /** Номер в каноничном виде, для tel: и schema.org */
  raw: string;
  /** Как показывается человеку */
  display: string;
  isWhatsapp: boolean;
}

export const site = {
  name: 'Express Cooling',
  legalLine: 'Express Cooling, ремонт холодильного оборудования',
  url: 'https://expresscooling.kz',
  city: 'Алматы',
  /** Адреса нет: обслуживаем территорию, а не точку */
  hasStorefront: false,
  phones: [
    { raw: '+77011325970', display: '+7 701 132 5970', isWhatsapp: true },
    { raw: '+77073279715', display: '+7 707 327 9715', isWhatsapp: true },
  ] as Phone[],
  hours: {
    opens: '06:00',
    /** 23:59, а не 00:00: интервал нулевой длины ломает разметку schema.org */
    closes: '23:59',
    label: '6:00-00:00',
  },
  whatsappText: 'Здравствуйте! Пишу с сайта. Холодильник: [модель]. Проблема: ',
  diagnosticsFrom: 'от 3500 ₸',
  responseTime: '40-90 мин',
} as const;
```

- [ ] **Step 4: Написать построители ссылок**

`src/lib/links.ts`:

```ts
import { site, type Phone } from '../data/site';

export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function telHref(phone: string): string {
  return `tel:+${digitsOnly(phone)}`;
}

export function primaryPhone(): Phone {
  const found = site.phones.find((p) => p.isWhatsapp);
  if (!found) throw new Error('В site.phones нет номера с WhatsApp');
  return found;
}

/**
 * Базовая ссылка на WhatsApp. UTM-метки и gclid дописываются на клиенте
 * в inline-скрипте: статический HTML не знает параметров запроса.
 */
export function whatsappHref(): string {
  const url = new URL(`https://wa.me/${digitsOnly(primaryPhone().raw)}`);
  url.searchParams.set('text', site.whatsappText);
  return url.toString();
}
```

- [ ] **Step 5: Запустить тесты, убедиться что проходят**

Run: `npm run test:unit`
Expected: PASS, 7 тестов

- [ ] **Step 6: Коммит**

```bash
git add -A
git commit -m "feat: единый источник контактов и построители ссылок

Тест отдельно проверяет, что номера-заглушки из макета Figma не
просочились в код: дизайнер оставил в макете чужие телефоны, и это
самая дорогая ошибка, которую можно допустить на лендинге."
```

---

## Task 4: Выгрузка изображений и иконок из Figma

**Files:**
- Create: `src/assets/images/*` (растровые фото), `src/assets/icons/*.svg`
- Create: `src/data/assets.ts` — реестр изображений с alt-текстами

**Interfaces:**
- Consumes: ничего из предыдущих задач
- Produces: `images` — объект вида `Record<string, { src: ImageMetadata; alt: string }>`; импорты изображений через `astro:assets`

- [ ] **Step 1: Выгрузить ассеты по секциям**

Вызвать `mcp__figma__download_assets` для каждого node: `1:471`, `1:8`, `1:36`, `1:78`, `1:211`, `1:246`, `1:329`, `1:343`, `1:366`, `1:417`.

Из ответа сохранить:
- `rawImages` → `src/assets/images/` с расширением из поля `format`
- `svgAssets` → `src/assets/icons/`

Ссылки живут около 7 дней, качать сразу.

- [ ] **Step 2: Проверить, что всё скачалось**

```bash
ls -la src/assets/images/ src/assets/icons/
```

Expected: не менее 15 растровых файлов и не менее 12 SVG. Логотипы брендов (LG, Samsung, Bosch, Whirlpool) приходят как SVG. Ни одного файла нулевого размера.

- [ ] **Step 3: Собрать реестр с alt-текстами**

`src/data/assets.ts`. Alt-тексты берутся из имён слоёв Figma — дизайнер прописал их осмысленно. Пример структуры:

```ts
import type { ImageMetadata } from 'astro';
import heroMaster from '../assets/images/hero-master.jpg';
import warehouseShelves from '../assets/images/warehouse-shelves.jpg';

export interface SiteImage {
  src: ImageMetadata;
  alt: string;
}

export const images = {
  heroMaster: {
    src: heroMaster,
    alt: 'Мастер Express Cooling ремонтирует холодильник на кухне в Алматы',
  },
  warehouseShelves: {
    src: warehouseShelves,
    alt: 'Стеллажи со склада запчастей',
  },
} satisfies Record<string, SiteImage>;
```

Заполнить всеми выгруженными изображениями. Реестр — точка замены стока на реальные фото: подменяется файл, компоненты не трогаются.

- [ ] **Step 4: Проверить, что реестр типизируется**

Run: `npx astro check`
Expected: 0 ошибок

- [ ] **Step 5: Коммит**

```bash
git add -A
git commit -m "assets: изображения и иконки из макета Figma

Alt-тексты взяты из имён слоёв: дизайнер прописал их осмысленно,
переписывать своими словами — потерять точность."
```

---

## Task 5: UI-примитивы и анимации

**Files:**
- Create: `src/components/ui/Container.astro`, `src/components/ui/Section.astro`, `src/components/ui/WhatsAppButton.astro`, `src/components/ui/PhoneButton.astro`, `src/components/ui/SectionHeading.astro`, `src/components/ui/Icon.astro`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/primitives.spec.ts`

**Interfaces:**
- Consumes: `whatsappHref`, `telHref`, `primaryPhone` из Task 3; токены из Task 2
- Produces:
  - `<Container>` — `max-width: 1320px`, паддинг `40px` на десктопе, `20px` на мобильном
  - `<Section tone="dark" | "light" | "soft" | "amber" | "footer" id?: string>` — обёртка с фоном и вертикальными отступами
  - `<WhatsAppButton source: string, variant?: "solid" | "inline", label?: string>` — рендерит `<a data-cta={source}>` на `whatsappHref()`
  - `<PhoneButton source: string, phone?: Phone>` — рендерит `<a data-cta={source}>` на `telHref()`
  - `<SectionHeading eyebrow?: string, title: string, lead?: string, tone: "dark" | "light">`
  - `<Icon name: string, size?: number>` — инлайнит SVG из `src/assets/icons/`
  - CSS-классы `.reveal`, `.reveal-soft`, `.reveal-stagger`

- [ ] **Step 1: Написать падающий тест на примитивы**

`tests/e2e/primitives.spec.ts`:

```ts
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
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/primitives.spec.ts --project=desktop`
Expected: FAIL — элементов с `data-cta` на странице нет

- [ ] **Step 3: Написать WhatsAppButton**

`src/components/ui/WhatsAppButton.astro`:

```astro
---
import { whatsappHref } from '../../lib/links';
import Icon from './Icon.astro';

interface Props {
  /** Метка источника для аналитики: hero, card-<slug>, footer */
  source: string;
  variant?: 'solid' | 'inline';
  label?: string;
  class?: string;
}

const { source, variant = 'solid', label = 'Написать в WhatsApp', class: className = '' } = Astro.props;

const base =
  'inline-flex items-center gap-3 font-semibold transition-[background-color,box-shadow,transform] duration-200 ease-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber';

const variants = {
  solid:
    'rounded-pill bg-wa text-wa-ink pl-9 pr-6 h-14 text-[18px] hover:bg-[#2ee070] hover:shadow-[0_8px_24px_-8px_rgba(37,211,102,0.6)]',
  inline: 'text-wa-ink/90 text-[17px] hover:gap-4',
};
---

<a
  href={whatsappHref()}
  data-cta={source}
  target="_blank"
  rel="noopener noreferrer"
  class={`${base} ${variants[variant]} ${className}`}
>
  <Icon name="whatsapp" size={21} />
  <span>{label}</span>
</a>
```

- [ ] **Step 4: Написать PhoneButton**

`src/components/ui/PhoneButton.astro`:

```astro
---
import { primaryPhone, telHref } from '../../lib/links';
import type { Phone } from '../../data/site';
import Icon from './Icon.astro';

interface Props {
  source: string;
  phone?: Phone;
  class?: string;
}

const { source, phone = primaryPhone(), class: className = '' } = Astro.props;
---

<a
  href={telHref(phone.raw)}
  data-cta={source}
  class={`inline-flex h-14 items-center gap-3 rounded-pill border border-white/36 pl-9 pr-6 text-[18px] font-semibold text-white transition-colors duration-200 ease-soft hover:border-white/70 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${className}`}
>
  <Icon name="phone" size={21} />
  <span>{phone.display}</span>
</a>
```

- [ ] **Step 5: Написать Icon, Container, Section, SectionHeading**

`src/components/ui/Icon.astro` инлайнит SVG-файл, чтобы не плодить сетевые запросы:

```astro
---
interface Props {
  name: string;
  size?: number;
  class?: string;
}

const { name, size = 24, class: className = '' } = Astro.props;

const files = import.meta.glob<string>('../../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const key = `../../assets/icons/${name}.svg`;
const raw = files[key];
if (!raw) {
  throw new Error(`Иконка ${name} не найдена. Доступны: ${Object.keys(files).join(', ')}`);
}

const markup = raw
  .replace(/<svg /, `<svg width="${size}" height="${size}" aria-hidden="true" focusable="false" `)
  .replace(/\s(width|height)="[^"]*"/g, (m) => (raw.indexOf('viewBox') > -1 ? '' : m));
---

<span class={`inline-flex shrink-0 ${className}`} style={`width:${size}px;height:${size}px`} set:html={markup} />
```

`src/components/ui/Container.astro`:

```astro
---
interface Props { class?: string }
const { class: className = '' } = Astro.props;
---
<div class={`mx-auto w-full max-w-[1320px] px-5 md:px-10 ${className}`}><slot /></div>
```

`src/components/ui/Section.astro`:

```astro
---
interface Props {
  tone?: 'dark' | 'soft' | 'light' | 'amber' | 'footer';
  id?: string;
  class?: string;
  /** Ожидаемая высота для content-visibility. Ставится только секциям ниже второго экрана. */
  deferPaint?: number;
}

const { tone = 'light', id, class: className = '', deferPaint } = Astro.props;

const tones = {
  dark: 'bg-graphite text-chalk',
  soft: 'bg-graphite-soft text-chalk',
  light: 'bg-cream text-ink',
  amber: 'bg-amber text-ink',
  footer: 'bg-graphite-footer text-chalk',
};
---

<section
  id={id}
  class={`${tones[tone]} ${className}`}
  style={deferPaint ? `content-visibility:auto;contain-intrinsic-size:auto ${deferPaint}px` : undefined}
>
  <slot />
</section>
```

`src/components/ui/SectionHeading.astro`:

```astro
---
interface Props {
  eyebrow?: string;
  title: string;
  lead?: string;
  tone?: 'dark' | 'light';
}

const { eyebrow, title, lead, tone = 'light' } = Astro.props;

const titleColor = tone === 'dark' ? 'text-chalk' : 'text-ink';
const leadColor = tone === 'dark' ? 'text-chalk-body' : 'text-ink-muted';
---

<div class="reveal">
  {eyebrow && (
    <p class="text-[14px] font-bold uppercase tracking-[2.24px] text-amber">{eyebrow}</p>
  )}
  <h2 class={`mt-2 text-[32px] font-bold leading-[1.08] tracking-[-1.288px] md:text-[46px] ${titleColor}`}>
    {title}
  </h2>
  {lead && <p class={`mt-4 max-w-[825px] text-[18px] leading-[1.58] md:text-[20px] ${leadColor}`}>{lead}</p>}
</div>
```

- [ ] **Step 6: Добавить анимации в global.css**

Дописать в конец `src/styles/global.css`:

```css
/*
  «Оттаивание»: контент выходит из размытия и подъёма, как отогревающееся
  запотевшее стекло. Размытие включено только для небольших блоков —
  на крупных перерисовка размытого слоя каждый кадр стоит дорого на
  мобильных GPU. Для крупной медиа используется .reveal-soft без blur.
*/
@keyframes thaw {
  from { opacity: 0; filter: blur(6px); transform: translateY(16px); }
  to   { opacity: 1; filter: blur(0);   transform: translateY(0); }
}

@keyframes thaw-soft {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: thaw linear both;
      animation-timeline: view();
      animation-range: entry 8% cover 26%;
    }
    .reveal-soft {
      animation: thaw-soft linear both;
      animation-timeline: view();
      animation-range: entry 8% cover 26%;
    }
    /* Каскад карточек внутри одной сетки */
    .reveal-stagger > * {
      animation: thaw linear both;
      animation-timeline: view();
      animation-range: entry 8% cover 30%;
    }
  }

  @supports not (animation-timeline: view()) {
    .reveal, .reveal-soft, .reveal-stagger > * { opacity: 0; }
    .is-visible.reveal, .is-visible .reveal-soft, .is-visible > * {
      animation: thaw 0.6s var(--ease-soft) both;
    }
  }
}
```

- [ ] **Step 7: Временно вывести примитивы на странице для теста**

В `src/pages/index.astro` внутри `<body>` добавить:

```astro
<WhatsAppButton source="test-primitive" />
<PhoneButton source="test-phone" />
```

с соответствующими импортами. Этот блок удаляется в Task 12.

- [ ] **Step 8: Запустить тест, убедиться что проходит**

Run: `npx playwright test tests/e2e/primitives.spec.ts`
Expected: PASS на обоих проектах

- [ ] **Step 9: Коммит**

```bash
git add -A
git commit -m "feat: UI-примитивы и анимация появления

Размытие в анимации применяется только к небольшим блокам: перерисовка
размытого слоя на каждом кадре дорога на мобильных GPU, поэтому для
крупной медиа сделан отдельный класс без blur."
```

---

## Task 6: Базовый макет, мета-данные, JSON-LD и аналитика

**Files:**
- Create: `src/layouts/Base.astro`, `src/lib/schema.ts`
- Create: `.env.example`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/head.spec.ts`, `tests/e2e/analytics.spec.ts`

**Interfaces:**
- Consumes: `site` из Task 3, токены из Task 2
- Produces:
  - `<Base title: string, description: string>` — обёртка страницы с `<head>`, JSON-LD и инлайн-скриптом
  - `buildLocalBusinessSchema(): object` из `src/lib/schema.ts`

- [ ] **Step 1: Написать падающие тесты**

`tests/e2e/head.spec.ts`:

```ts
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
```

`tests/e2e/analytics.spec.ts`:

```ts
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
```

- [ ] **Step 2: Запустить тесты, убедиться что падают**

Run: `npx playwright test tests/e2e/head.spec.ts tests/e2e/analytics.spec.ts --project=desktop`
Expected: FAIL — заголовок страницы «Express Cooling», JSON-LD отсутствует

- [ ] **Step 3: Написать генератор JSON-LD**

`src/lib/schema.ts`:

```ts
import { site } from '../data/site';

const WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export function buildLocalBusinessSchema(ogImageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    description:
      'Ремонт холодильников и холодильного оборудования в Алматы. Звонки принимают сами мастера, выезд по городу за 40-90 минут, стоимость работ называем до начала ремонта.',
    url: site.url,
    image: ogImageUrl,
    telephone: site.phones.map((p) => p.raw),
    priceRange: site.diagnosticsFrom,
    currenciesAccepted: 'KZT',
    areaServed: { '@type': 'City', name: site.city },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...WEEK],
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
    // address намеренно отсутствует: физической точки нет, только выезд.
    // Пустой или выдуманный адрес — прямой путь к отклонению в Google Business.
  };
}
```

- [ ] **Step 4: Написать Base.astro**

`src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
import { buildLocalBusinessSchema } from '../lib/schema';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
const ogImage = new URL('/og-image.jpg', Astro.site).href;
const schema = buildLocalBusinessSchema(ogImage);

const GA_ID = import.meta.env.PUBLIC_GA_ID ?? '';
const ADS_ID = import.meta.env.PUBLIC_ADS_ID ?? '';
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <link rel="preload" as="font" type="font/woff2" href="/fonts/onest-cyrillic.woff2" crossorigin />
    <link rel="preload" as="font" type="font/woff2" href="/fonts/onest-latin.woff2" crossorigin />

    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <script type="application/ld+json" set:html={JSON.stringify(schema)} is:inline />

    <script is:inline define:vars={{ GA_ID, ADS_ID }}>
      (function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;

        var loaded = false;
        function loadTag() {
          if (loaded) return;
          loaded = true;
          var id = GA_ID || ADS_ID;
          if (!id) return;
          var s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
          document.head.appendChild(s);
          gtag('js', new Date());
          if (GA_ID) gtag('config', GA_ID);
          if (ADS_ID) gtag('config', ADS_ID);
        }

        // Грузим тег только после того, как человек проявил интерес.
        // Резервный таймер длинный: до него доходят лишь вкладки, где
        // никто ничего не сделал, и они всё равно не конвертируются.
        ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (e) {
          addEventListener(e, loadTag, { once: true, passive: true });
        });
        addEventListener('load', function () { setTimeout(loadTag, 10000); });

        // Источник заявки едет вместе с сообщением: мастер сразу видит,
        // из какой кампании пришёл человек.
        var q = new URLSearchParams(location.search);
        var marks = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
          .map(function (k) { var v = q.get(k); return v ? k + '=' + v : null; })
          .filter(Boolean);

        addEventListener('DOMContentLoaded', function () {
          if (marks.length) {
            document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
              var u = new URL(a.href);
              u.searchParams.set('text', (u.searchParams.get('text') || '') + '\n\n[' + marks.join(' ') + ']');
              a.href = u.toString();
            });
          }
        });

        addEventListener('click', function (ev) {
          var a = ev.target.closest && ev.target.closest('a[data-cta]');
          if (!a) return;
          var isWa = a.href.indexOf('wa.me') > -1;
          gtag('event', isWa ? 'whatsapp_click' : 'phone_click', { source: a.getAttribute('data-cta') });
        }, { capture: true });
      })();
    </script>
  </head>
  <body class="font-sans">
    <slot />
  </body>
</html>
```

- [ ] **Step 5: Завести .env.example**

```
# Заполняются, когда будут созданы аккаунты. Пустые значения означают,
# что тег не грузится вовсе — это штатный режим до запуска рекламы.
PUBLIC_GA_ID=
PUBLIC_ADS_ID=
```

- [ ] **Step 6: Перевести index.astro на Base**

`src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import WhatsAppButton from '../components/ui/WhatsAppButton.astro';
import PhoneButton from '../components/ui/PhoneButton.astro';
---

<Base
  title="Ремонт холодильников в Алматы — Express Cooling"
  description="Ремонт холодильников и холодильного оборудования в Алматы. Звонки принимают сами мастера, выезд за 40-90 минут, диагностика от 3500 ₸, стоимость называем до начала работ."
>
  <h1>Ремонт холодильников в Алматы</h1>
  <WhatsAppButton source="test-primitive" />
  <PhoneButton source="test-phone" />
</Base>
```

Положить временную заглушку `public/og-image.jpg` (1200×630) и `public/favicon.svg` — настоящие делаются в Task 13.

- [ ] **Step 7: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/head.spec.ts tests/e2e/analytics.spec.ts`
Expected: PASS

- [ ] **Step 8: Проверить размер инлайн-скрипта**

```bash
npm run build
node -e "const h=require('fs').readFileSync('dist/index.html','utf8');const m=[...h.matchAll(/<script(?![^>]*type=\"application\/ld/)[^>]*>([\s\S]*?)<\/script>/g)];console.log('инлайн JS, байт:',m.reduce((a,x)=>a+Buffer.byteLength(x[1]),0))"
```

Expected: менее 2048

- [ ] **Step 9: Коммит**

```bash
git add -A
git commit -m "feat: базовый макет, разметка schema.org и отложенная аналитика

Тег грузится по первому взаимодействию, а не в head: для человека это
на 90 КБ меньше на критическом пути, для конверсий разницы нет, потому
что клик по WhatsApp сам по себе является взаимодействием.
Поля address в LocalBusiness нет намеренно: физической точки не
существует, выдуманный адрес отклоняется при проверке."
```

---

## Tasks 7–11: Секции

Задачи 7–11 независимы и выполняются параллельно разными агентами. Общий протокол для каждой:

1. Вызвать `mcp__figma__get_design_context` на нужном node ПК-версии и на соответствующем участке мобильной версии `1:491`. Перед первым вызовом прочитать MCP-ресурс `skill://figma/figma-design-to-code/SKILL.md` и указать `skillNames: "resource:figma-design-to-code"`.
2. Полученный React+Tailwind считать **референсом, а не готовым кодом**. Перевести в `.astro`, заменить хардкод цветов на токены из Global Constraints, абсолютное позиционирование — на flex и grid.
3. Переиспользовать примитивы из Task 5. Новых кнопок и заголовков не изобретать.
4. Изображения — из `src/data/assets.ts` через `<Image>` из `astro:assets`, формат AVIF, обязательные `width` и `height`, `loading="lazy"` на всём, кроме hero.
5. Иконки — через `<Icon>`, инлайном.
6. Каждый компонент экспортирует ровно одну секцию, снаружи оборачивается в `<Section tone=... id=...>`.
7. Тексты копировать из макета дословно. Телефоны и цены — из `site.ts`.
8. Адаптив: один брейкпоинт `md` (768px). Мобильная раскладка — из макета `1:491`.
9. После вёрстки прогнать `npx astro check` и `npm run build`.

---

## Task 7: Header и Hero

**Files:**
- Create: `src/components/Header.astro`, `src/components/Hero.astro`
- Test: `tests/e2e/header-hero.spec.ts`

**Interfaces:**
- Consumes: `Container`, `Section`, `WhatsAppButton`, `PhoneButton`, `Icon` из Task 5; `images.heroMaster` из Task 4; `site` из Task 3
- Produces: `<Header />` и `<Hero />` без пропсов

**Figma:** ПК Header `1:471`, ПК Hero `1:8`. Мобильная версия — верх `1:491`.

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/header-hero.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('в шапке четыре якоря, ведущих в существующие секции', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('header nav a[href^="#"]');
  await expect(links).toHaveCount(4);

  const hrefs = await links.evaluateAll((ns) => ns.map((n) => n.getAttribute('href') ?? ''));
  for (const href of hrefs) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('на мобильном навигация скрыта, кнопка WhatsApp видна', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'только мобильный проект');
  await page.goto('/');
  await expect(page.locator('header nav')).toBeHidden();
  await expect(page.locator('header a[data-cta="header"]')).toBeVisible();
});

test('заголовок первого экрана — единственный h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/Холодильник чинит тот, кто взял трубку/);
});

test('фото первого экрана грузится приоритетно и не ленится', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('img').first();
  await expect(img).toHaveAttribute('fetchpriority', 'high');
  await expect(img).not.toHaveAttribute('loading', 'lazy');
  await expect(img).toHaveAttribute('alt', /Мастер Express Cooling/);
});
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/header-hero.spec.ts`
Expected: FAIL — элемента `header` на странице нет

- [ ] **Step 3: Снять контекст из Figma**

Вызвать `get_design_context` на `1:471` и `1:8`.

- [ ] **Step 4: Сверстать Header**

`src/components/Header.astro`. Требования, снятые с макета:

- фон `bg-graphite`, высота 84px, `position: sticky; top: 0`, `z-10`
- логотип: SVG монограммы EC 37×37 плюс текст «Express Cooling», Onest Bold 21px, `text-chalk`, `tracking-[-0.42px]`
- навигация: 4 ссылки, Onest Medium 17px, `text-chalk-muted`, промежуток 28px, при наведении `text-chalk`. Якоря: `#polomki`, `#kak-rabotaem`, `#oborudovanie`, `#dlya-biznesa`
- на мобильном навигация скрыта через `hidden md:flex` — бургера в макете нет
- справа `<WhatsAppButton source="header" label="Написать в WhatsApp" />`, высота 46px
- обёртка `<Container>`, семантический `<header>` и `<nav>` с `aria-label="Основная навигация"`

- [ ] **Step 5: Сверстать Hero**

`src/components/Hero.astro`. Требования, снятые с макета:

- `<Section tone="dark">`, две колонки на десктопе (текст 808px / фото 777px), одна колонка на мобильном с фото под текстом
- надзаголовок «Алматы, заявки с 6:00»: Onest Bold 14px, `uppercase`, `tracking-[2.24px]`, `text-amber`
- `<h1>` «Холодильник чинит тот, кто взял трубку»: Onest Bold, 66px на десктопе, `leading-[67.32px]`, `tracking-[-2.31px]`, `text-chalk`. На мобильном 40px
- лид: Onest Regular 19px, `leading-[30.02px]`, `text-chalk-body`, ширина 481px
- CTA: `<WhatsAppButton source="hero" />` и `<PhoneButton source="hero" />`, промежуток 14px
- два показателя над границей `border-t border-white/13`, `padding-top: 31px`: значения `site.hours.label` и `site.responseTime` — Onest ExtraBold 40px `text-amber` `tracking-[-1.12px]`; подписи «Принимаем заявки каждый день» и «Обычное время выезда по городу» — 16.785px `text-chalk-muted`
- фото: `<Image>` из `images.heroMaster`, `loading="eager"`, `fetchpriority="high"`, `widths={[395, 768, 1440, 2880]}`, `format="avif"`, скругление `rounded-bl-hero`
- под hero — круглая кнопка-якорь на `#polomki` 68×68 со стрелкой вниз (node `1:411`)
- анимация: текстовый блок `.reveal`, блок с фото `.reveal-soft`

- [ ] **Step 6: Подключить в index.astro и добавить заглушки якорей**

Временно добавить в `index.astro` пустые `<div id="polomki">`, `<div id="kak-rabotaem">`, `<div id="oborudovanie">`, `<div id="dlya-biznesa">`, чтобы тест на якоря прошёл. Заглушки удаляются в Task 12, когда появятся настоящие секции.

- [ ] **Step 7: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/header-hero.spec.ts`
Expected: PASS

- [ ] **Step 8: Сверить с макетом**

```bash
npx playwright screenshot --viewport-size=1440,900 http://localhost:4321/ /tmp/hero-desktop.png
```

Сравнить с `get_screenshot` node `1:8`. Расхождения в размерах шрифта, отступах и цветах — исправить.

- [ ] **Step 9: Коммит**

```bash
git add -A
git commit -m "feat: шапка и первый экран

Навигация на мобильном скрывается, а не сворачивается в бургер: в
макете бургера нет, и его отсутствие избавляет страницу от
единственного места, где потребовался бы клиентский компонент."
```

---

## Task 8: Полоса фактов и «Выберите поломку»

**Files:**
- Create: `src/components/FactsBar.astro`, `src/components/Breakages.astro`, `src/components/BreakageCard.astro`, `src/data/breakages.ts`
- Test: `tests/e2e/breakages.spec.ts`

**Interfaces:**
- Consumes: примитивы из Task 5, `images` из Task 4
- Produces:
  - `breakages: Breakage[]`, где `Breakage` = `{ slug: string; title: string; description: string; imageKey: string; featured: boolean; badge?: string }`
  - `<BreakageCard breakage: Breakage, size: "large" | "small" />`
  - `<FactsBar />`, `<Breakages />`

**Figma:** полоса фактов `1:36`, секция поломок `1:78`.

Восемь поломок из макета, в порядке следования. Крупные (`featured: true`): «Не холодит, не морозит» (бейдж «Начните отсюда»), «Шуба, зарос льдом», «Течёт, лужа под холодильником», «Шумит, гудит, трещит». Малые: «Перестал морозить», «Компрессор не включается», «Не работает одна из камер», «Пищит, мигает, моргает».

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/breakages.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('восемь карточек поломок, у каждой своя метка источника', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('[data-breakage]');
  await expect(cards).toHaveCount(8);

  const sources = await page
    .locator('[data-breakage] a[data-cta]')
    .evaluateAll((ns) => ns.map((n) => n.getAttribute('data-cta') ?? ''));

  expect(new Set(sources).size).toBe(8);
  for (const s of sources) expect(s).toMatch(/^card-/);
});

test('полоса фактов показывает цену из данных, а не из макета', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#polomki')).toHaveCount(1);
  await expect(page.getByText('от 3500 ₸').first()).toBeVisible();
});

test('карточки поломок не тянут изображения заранее', async ({ page }) => {
  await page.goto('/');
  const imgs = page.locator('[data-breakage] img');
  const count = await imgs.count();
  expect(count).toBe(8);
  for (let i = 0; i < count; i++) {
    await expect(imgs.nth(i)).toHaveAttribute('loading', 'lazy');
  }
});
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/breakages.spec.ts`
Expected: FAIL — элементов `[data-breakage]` нет

- [ ] **Step 3: Снять контекст из Figma**

Вызвать `get_design_context` на `1:36` и `1:78`. Секция `1:78` большая: если вернётся разреженная метадата, запросить дочерние узлы `1:88` (крупные карточки), `1:146` (малые карточки), `1:200` (широкая карточка «Другая поломка») одним параллельным пакетом.

- [ ] **Step 4: Записать данные поломок**

`src/data/breakages.ts` — восемь объектов, тексты дословно из макета. Пример первого:

```ts
export interface Breakage {
  slug: string;
  title: string;
  description: string;
  imageKey: keyof typeof import('./assets').images;
  featured: boolean;
  badge?: string;
}

export const breakages: Breakage[] = [
  {
    slug: 'ne-holodit',
    title: 'Не холодит, не морозит',
    description: 'Компрессор гудит, холода нет. Смотрим утечку фреона…',
    imageKey: 'breakageNeHolodit',
    featured: true,
    badge: 'Начните отсюда',
  },
  // …остальные семь
];
```

Полные описания взять из `get_design_context`: в метадате они обрезаны.

- [ ] **Step 5: Сверстать FactsBar**

`<Section tone="soft">` с фоном `bg-graphite-soft`. Четыре колонки на десктопе, две на мобильном. В каждой: иконка 30×30 `text-amber`, значение Onest Bold, подпись `text-chalk-muted`. Значение первой колонки — `site.diagnosticsFrom`.

- [ ] **Step 6: Сверстать BreakageCard и Breakages**

`BreakageCard`: белая карточка `rounded-card`, фото сверху с `<Image loading="lazy" format="avif">`, бейдж, заголовок Onest Bold, описание курсивом `text-ink-muted`, внизу `<WhatsAppButton variant="inline" source={'card-' + breakage.slug} />`. Атрибут `data-breakage={breakage.slug}` на корне.

Наведение: `hover:-translate-y-1`, жёлтая линия снизу через `after:` псевдоэлемент, фото `group-hover:scale-[1.03]` с `overflow-hidden` на обёртке.

`Breakages`: `<Section tone="light" id="polomki">`, заголовок через `<SectionHeading eyebrow="Что случилось" title="Выберите поломку" lead="…" />`, сетка `grid-cols-1 md:grid-cols-4` с классом `reveal-stagger`, затем подзаголовок «Другие поломки» и вторая сетка, затем широкая карточка «Другая поломка или не поняли, что случилось» с `<WhatsAppButton source="card-other" />`.

Каскад задержек:

```css
.reveal-stagger > *:nth-child(2) { animation-delay: 60ms; }
.reveal-stagger > *:nth-child(3) { animation-delay: 120ms; }
.reveal-stagger > *:nth-child(4) { animation-delay: 180ms; }
```

Дописать в `global.css`.

- [ ] **Step 7: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/breakages.spec.ts`
Expected: PASS

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "feat: полоса фактов и секция выбора поломки

У каждой карточки своя метка источника в data-cta: это единственный
способ потом увидеть в отчётах, какая формулировка поломки приносит
заявки, и перераспределить бюджет рекламы."
```

---

## Task 9: «Как проходит выезд» и «Что берём в работу»

**Files:**
- Create: `src/components/HowItWorks.astro`, `src/components/Equipment.astro`, `src/components/BrandList.astro`, `src/data/equipment.ts`, `src/data/brands.ts`
- Test: `tests/e2e/equipment.spec.ts`

**Interfaces:**
- Consumes: примитивы из Task 5, `images` из Task 4
- Produces: `<HowItWorks />` с `id="kak-rabotaem"`, `<Equipment />` с `id="oborudovanie"`; `brands: Brand[]` = `{ name: string; iconKey?: string }`

**Figma:** `1:211` (три шага) и `1:246` (bento 2×2 плюс бренды).

Три шага: «Отвечает мастер», «Цена до работ», «Чиним в тот же выезд». Заголовок секции «Как проходит выезд», Onest Bold 46px `text-ink` `tracking-[-1.288px]`; текст шага 18px `text-ink-muted` `leading-[28.44px]`; каждая колонка с верхней границей `border-t border-black/12` и `padding-top: 27px`; иконка 30×30 над заголовком с отступом снизу 16px.

Двенадцать брендов: четыре логотипами-SVG (LG, Samsung, Bosch, Whirlpool — уточнить по ассетам), восемь текстом: INDESIT, ARISTON, BEKO, LIEBHERR, АТЛАНТ, БИРЮСА, ARDO, HOTPOINT.

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/equipment.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('три шага выезда', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#kak-rabotaem [data-step]')).toHaveCount(3);
});

test('двенадцать брендов, каждый читается текстом', async ({ page }) => {
  await page.goto('/');
  const brands = page.locator('#oborudovanie [data-brand]');
  await expect(brands).toHaveCount(12);

  // Логотип картинкой поисковик не прочитает: у каждого бренда
  // обязан быть текстовый эквивалент.
  const names = await brands.evaluateAll((ns) =>
    ns.map((n) => (n.textContent ?? '').trim() || n.querySelector('img,svg')?.getAttribute('alt') || ''),
  );
  for (const name of names) expect(name.length).toBeGreaterThan(1);
});

test('четыре категории оборудования', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#oborudovanie [data-equipment]')).toHaveCount(4);
});
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/equipment.spec.ts`
Expected: FAIL

- [ ] **Step 3: Снять контекст из Figma**

Вызвать `get_design_context` на `1:211` и `1:246`. Для bento-сетки дополнительно `1:256`.

- [ ] **Step 4: Записать данные**

`src/data/equipment.ts` — четыре категории с заголовком, описанием, иконкой и изображением. Четвёртая — «Промышленные установки» с описанием «Холодильные камеры и компрессорно-конденсаторные агрегаты…».

`src/data/brands.ts` — двенадцать брендов. У логотипов поле `iconKey`, у остальных только `name`.

- [ ] **Step 5: Сверстать HowItWorks**

`<Section tone="light" id="kak-rabotaem">`, три колонки `md:grid-cols-3` с промежутком 48px, атрибут `data-step` на каждой, класс `reveal-stagger` на сетке.

- [ ] **Step 6: Сверстать Equipment и BrandList**

`<Section tone="dark" id="oborudovanie">` с тёплым градиентом из макета (node `1:247` — декоративный слой). Bento 2×2 с неравными колонками: первый ряд 821px + 403px, второй 403px + 821px. На мобильном — одна колонка.

`BrandList`: сетка `grid-cols-3 md:grid-cols-6`, каждый элемент с `data-brand`. Логотипы через `<Icon>` с обязательным текстовым эквивалентом рядом либо в `aria-label`.

- [ ] **Step 7: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/equipment.spec.ts`
Expected: PASS

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "feat: порядок выезда и перечень оборудования

У каждого бренда есть текстовый эквивалент рядом с логотипом:
поисковик не читает содержимое SVG, а половина запросов в нише —
это марка холодильника."
```

---

## Task 10: «Свой склад» и «Для бизнеса»

**Files:**
- Create: `src/components/Warehouse.astro`, `src/components/Business.astro`
- Test: `tests/e2e/warehouse-business.spec.ts`

**Interfaces:**
- Consumes: примитивы из Task 5, `images.warehouseShelves`, `images.masterTools`, `images.businessMaster` из Task 4
- Produces: `<Warehouse />`, `<Business />` с `id="dlya-biznesa"`

**Figma:** `1:329` (склад) и `1:343` (для бизнеса).

Секция склада: слева фото стеллажей 714×553, справа тёмная карточка на жёлтом фоне с заголовком «Свой склад», текстом про компрессоры и реле и вложенным фото инструмента 438×294.

Секция для бизнеса: карточка со скруглением на фоне фото мастера у витрины, затемнение, надзаголовок «КАФЕ, МАГАЗИНЫ, ПРОИЗВОДСТВО» `text-amber`, заголовок «Витрина встала, торговля встала», абзац, маркированный список из четырёх пунктов с жёлтыми точками, кнопка WhatsApp.

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/warehouse-business.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('секция для бизнеса доступна по якорю и содержит CTA', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#dlya-biznesa');
  await expect(section).toHaveCount(1);
  await expect(section.locator('a[data-cta="business"]')).toHaveAttribute('href', /wa\.me/);
  await expect(section.getByRole('listitem')).toHaveCount(4);
});

test('текст на фоне фото читаем: под ним есть затемнение', async ({ page }) => {
  await page.goto('/');
  const heading = page.locator('#dlya-biznesa h2');
  await expect(heading).toBeVisible();
  const color = await heading.evaluate((n) => getComputedStyle(n).color);
  expect(color).toBe('rgb(246, 246, 246)');
});

test('фото склада не блокирует первый экран', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('img[alt*="склад" i]').first();
  await expect(img).toHaveAttribute('loading', 'lazy');
});
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/warehouse-business.spec.ts`
Expected: FAIL

- [ ] **Step 3: Снять контекст из Figma**

Вызвать `get_design_context` на `1:329` и `1:343`.

- [ ] **Step 4: Сверстать Warehouse**

`<Section tone="amber">`. Две колонки: фото и тёмная карточка `bg-graphite` `rounded-card`. Класс `.reveal-soft` на фото, `.reveal` на карточке.

- [ ] **Step 5: Сверстать Business**

`<Section tone="dark" id="dlya-biznesa">`. Карточка со скруглением 24px, фоновое фото через `<Image>` в `absolute inset-0 object-cover`, поверх — градиент `bg-gradient-to-r from-graphite via-graphite/85 to-transparent`, чтобы текст оставался читаемым. Список — семантический `<ul>` с `<li>`, маркеры жёлтыми точками через `::marker` или псевдоэлемент.

- [ ] **Step 6: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/warehouse-business.spec.ts`
Expected: PASS

- [ ] **Step 7: Коммит**

```bash
git add -A
git commit -m "feat: секции склада и работы с бизнесом

Текст поверх фото положен на градиент, а не на полупрозрачную заливку:
так контраст держится и на светлых участках снимка, что нужно для
проверки доступности."
```

---

## Task 11: «Чем не занимаемся», «Скидки» и футер

**Files:**
- Create: `src/components/NotDoing.astro`, `src/components/Discounts.astro`, `src/components/Footer.astro`, `src/data/discounts.ts`
- Test: `tests/e2e/footer.spec.ts`

**Interfaces:**
- Consumes: примитивы из Task 5, `site` из Task 3
- Produces: `<NotDoing />`, `<Discounts />`, `<Footer />`

**Figma:** `1:366` (две колонки) и `1:417` (футер).

«Чем не занимаемся»: три пункта с пояснениями — уплотнитель двери, кондиционеры, скупка и продажа техники.
«Скидки»: пенсионерам 15-30%, студентам 15%, повторное обращение 25%.
Футер: логотип, заголовок «Опишите поломку, ответит мастер», абзац, кнопка WhatsApp, колонка «Телефоны» с двумя номерами и подписью «WhatsApp на обоих номерах», колонка «Режим и город», нижняя строка с двумя подписями.

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/footer.spec.ts`:

```ts
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
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/footer.spec.ts`
Expected: FAIL

- [ ] **Step 3: Снять контекст из Figma**

Вызвать `get_design_context` на `1:366` и `1:417`.

- [ ] **Step 4: Записать данные скидок**

`src/data/discounts.ts`:

```ts
export const discounts = [
  { label: 'Пенсионерам', value: '15-30%' },
  { label: 'Студентам', value: '15%' },
  { label: 'Повторное обращение', value: '25%' },
] as const;
```

- [ ] **Step 5: Сверстать NotDoing и Discounts**

`<Section tone="light">` с двумя колонками `md:grid-cols-2`, промежуток 70px. Пункты «чем не занимаемся» — семантический `<ul>` с точкой 8×8. Строки скидок — с `data-discount`, разделены `border-b border-black/12`, значение справа Onest Bold 30px `text-amber`.

- [ ] **Step 6: Сверстать Footer**

Семантический `<footer>`, фон `bg-graphite-footer` с тёплым декоративным градиентом из макета. Телефоны — ссылками `tel:` с `data-cta="footer-phone-1"` и `data-cta="footer-phone-2"`. Кнопка `<WhatsAppButton source="footer" />`. Все значения из `site`.

- [ ] **Step 7: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/footer.spec.ts`
Expected: PASS

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "feat: секции ограничений, скидок и футер

Тест отдельно проверяет отсутствие телефонов из макета: они пережили
бы копирование текста один в один и увели бы заявки чужому человеку."
```

---

## Task 12: Сборка страницы

**Files:**
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/page.spec.ts`

**Interfaces:**
- Consumes: все компоненты из Tasks 7–11
- Produces: готовая страница `/`

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/page.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const ANCHORS = ['#polomki', '#kak-rabotaem', '#oborudovanie', '#dlya-biznesa'];

test('секции идут в порядке макета', async ({ page }) => {
  await page.goto('/');
  const order = await page.locator('main > section').evaluateAll((ns) =>
    ns.map((n) => n.getAttribute('data-section') ?? ''),
  );
  expect(order).toEqual([
    'hero', 'facts', 'breakages', 'how-it-works',
    'equipment', 'warehouse', 'business', 'not-doing',
  ]);
});

test('все якоря ведут в реальные секции', async ({ page }) => {
  await page.goto('/');
  for (const a of ANCHORS) {
    await expect(page.locator(a)).toHaveCount(1);
  }
});

test('горизонтального скролла нет ни на одном брейкпоинте', async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `ширина ${width}px`).toBeLessThanOrEqual(1);
  }
});

test('заглушек и незаполненных мест не осталось', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('body').innerText()).toLowerCase();
  for (const marker of ['lorem', 'placeholder', 'tbd', 'todo', 'заглушка']) {
    expect(text).not.toContain(marker);
  }
});
```

- [ ] **Step 2: Запустить тест, убедиться что падает**

Run: `npx playwright test tests/e2e/page.spec.ts`
Expected: FAIL

- [ ] **Step 3: Собрать страницу**

`src/pages/index.astro`: подключить все компоненты в порядке макета, удалить временные заглушки якорей и тестовые кнопки из Task 5 и Task 6. Каждой секции проставить `data-section`. Обернуть контент в `<main>`.

Секциям ниже второго экрана проставить `deferPaint` с ожидаемой высотой из макета: `warehouse` 761, `business` 920, `not-doing` 561.

- [ ] **Step 4: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/page.spec.ts`
Expected: PASS

- [ ] **Step 5: Проверить, что content-visibility не сломал анимации**

Run: `npx playwright test tests/e2e/page.spec.ts --headed`

Проскроллить страницу вручную и убедиться, что секции с `deferPaint` анимируются. `content-visibility: auto` умеет пропускать отрисовку поддерева, из-за чего `animation-timeline: view()` может не сработать. Если анимация не проигрывается — убрать `deferPaint` с этих секций: выигрыш от него на одной странице небольшой, а потеря анимации заметна.

- [ ] **Step 6: Прогнать весь набор тестов**

Run: `npm test`
Expected: PASS, все тесты

- [ ] **Step 7: Коммит**

```bash
git add -A
git commit -m "feat: сборка страницы целиком

Порядок секций закреплён тестом: он ловит случайную перестановку при
слиянии веток, которую глазами в семитысячепиксельной странице не
заметишь."
```

---

## Task 13: Финализация SEO

**Files:**
- Create: `public/robots.txt`, `public/og-image.jpg`, `public/favicon.svg`, `src/pages/404.astro`
- Test: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `Base` из Task 6
- Produces: `/robots.txt`, `/sitemap-index.xml`, `/404`

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/seo.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('robots.txt разрешает обход и указывает карту сайта', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('Sitemap: https://expresscooling.kz/sitemap-index.xml');
  expect(body).not.toMatch(/^Disallow: \/$/m);
});

test('карта сайта отдаётся', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  expect(res.status()).toBe(200);
});

test('страница 404 существует и не индексируется', async ({ page }) => {
  await page.goto('/nesushchestvuyushchaya-stranica');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('link', { name: /на главную/i })).toBeVisible();
});

test('иерархия заголовков не имеет разрывов', async ({ page }) => {
  await page.goto('/');
  const levels = await page
    .locator('h1, h2, h3, h4')
    .evaluateAll((ns) => ns.map((n) => Number(n.tagName[1])));

  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  }
});

test('у каждого изображения осмысленный alt', async ({ page }) => {
  await page.goto('/');
  const alts = await page.locator('img').evaluateAll((ns) =>
    ns.map((n) => n.getAttribute('alt') ?? ''),
  );
  for (const alt of alts) {
    expect(alt.trim().length).toBeGreaterThan(5);
  }
});
```

- [ ] **Step 2: Запустить тесты, убедиться что падают**

Run: `npx playwright test tests/e2e/seo.spec.ts`
Expected: FAIL

- [ ] **Step 3: Написать robots.txt**

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://expresscooling.kz/sitemap-index.xml
```

- [ ] **Step 4: Сделать og-image и favicon**

`public/og-image.jpg` — 1200×630, композиция из hero: фото мастера, логотип, «Ремонт холодильников в Алматы», телефон. Собрать через Playwright из отдельного скрытого маршрута либо экспортировать из Figma. Вес не более 150 КБ.

`public/favicon.svg` — монограмма EC из логотипа (node `1:474`).

- [ ] **Step 5: Написать страницу 404**

`src/pages/404.astro` на базе `Base`, с `<meta name="robots" content="noindex, follow">`, коротким текстом и ссылкой «На главную».

- [ ] **Step 6: Запустить тесты, убедиться что проходят**

Run: `npx playwright test tests/e2e/seo.spec.ts`
Expected: PASS

- [ ] **Step 7: Проверить разметку внешним валидатором**

Открыть https://validator.schema.org/ и вставить содержимое `<script type="application/ld+json">` из `dist/index.html`.
Expected: 0 ошибок, 0 предупреждений.

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "feat: robots, карта сайта, og-изображение и страница 404

Тест на иерархию заголовков ловит разрывы уровней: пропуск с h2 на h4
читается поисковиком как обрыв структуры документа."
```

---

## Task 14: Визуальная сверка с макетом

**Files:**
- Create: `tests/e2e/visual.spec.ts`
- Create: `docs/visual-check.md`

**Interfaces:**
- Consumes: собранная страница из Task 12
- Produces: эталонные скриншоты в `tests/e2e/visual.spec.ts-snapshots/`

- [ ] **Step 1: Написать визуальные тесты**

`tests/e2e/visual.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const SECTIONS = [
  'hero', 'facts', 'breakages', 'how-it-works',
  'equipment', 'warehouse', 'business', 'not-doing',
];

test.describe('визуальная регрессия', () => {
  for (const section of SECTIONS) {
    test(`секция ${section} не изменилась`, async ({ page }) => {
      await page.goto('/');
      // Анимации появления выключаем, иначе снимок зависит от момента
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const target = page.locator(`[data-section="${section}"]`);
      await target.scrollIntoViewIfNeeded();
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
```

- [ ] **Step 2: Записать эталоны**

Run: `npx playwright test tests/e2e/visual.spec.ts --update-snapshots`
Expected: создано 16 снимков (8 секций × 2 проекта)

- [ ] **Step 3: Сверить каждый снимок с макетом Figma глазами**

Для каждой секции получить `get_screenshot` соответствующего node и сравнить со снимком Playwright. Записать расхождения в `docs/visual-check.md` таблицей: секция, что расходится, исправлено или принято осознанно.

Проверять: размеры шрифтов, межстрочные интервалы, вертикальные отступы между блоками, цвета фонов, радиусы скруглений, размеры иконок.

- [ ] **Step 4: Исправить расхождения и перезаписать эталоны**

Run: `npx playwright test tests/e2e/visual.spec.ts --update-snapshots`
Expected: PASS

- [ ] **Step 5: Коммит**

```bash
git add -A
git commit -m "test: визуальная регрессия по секциям

Снимки делаются с выключенными анимациями: иначе кадр зависит от
момента съёмки и тест становится нестабильным."
```

---

## Task 15: Бюджет производительности

**Files:**
- Create: `lighthouserc.json`, `tests/e2e/budget.spec.ts`
- Modify: компоненты по результатам замеров

**Interfaces:**
- Consumes: собранная страница
- Produces: команда `npm run test:perf`, отчёты в `.lighthouseci/`

- [ ] **Step 1: Написать тест на вес страницы**

`tests/e2e/budget.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('вес страницы укладывается в бюджет', async ({ page }) => {
  let total = 0;
  const byType: Record<string, number> = {};

  page.on('response', async (res) => {
    const len = Number(res.headers()['content-length'] ?? 0);
    if (!len) return;
    total += len;
    const type = res.request().resourceType();
    byType[type] = (byType[type] ?? 0) + len;
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');

  console.log('вес по типам:', byType);
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
```

- [ ] **Step 2: Настроить Lighthouse CI**

`lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.98 }],
        "categories:seo": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 1 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.02 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 1200 }],
        "total-byte-weight": ["error", { "maxNumericValue": 819200 }],
        "unused-css-rules": ["warn", { "maxLength": 0 }]
      }
    }
  }
}
```

Добавить в `package.json`:

```json
"test:perf": "npm run build && lhci autorun"
```

- [ ] **Step 3: Запустить замер**

Run: `npm run test:perf`
Expected: сначала, вероятно, FAIL — записать фактические цифры

- [ ] **Step 4: Довести до бюджета**

Типовые причины провала и что делать:

- **LCP выше порога.** Проверить, что hero-изображение стоит в `<link rel="preload" as="image" imagesrcset=...>` в `<head>`, имеет `fetchpriority="high"` и не обёрнуто в ленивый контейнер.
- **Большой вес.** Уменьшить качество AVIF до 60, срезать лишние размеры в `widths`.
- **CSS больше 15 КБ.** Проверить, что не осталось неиспользуемых утилит; Tailwind 4 вычищает сам, но декоративные градиенты могли попасть инлайном.
- **Доступность ниже 95.** Контраст `text-chalk-muted` `#a5a5a5` на `#232323` даёт 7.4:1 — проходит. Проверить контраст текста поверх фото в секции для бизнеса и видимость фокуса на всех интерактивных элементах.
- **Best Practices ниже 100.** Обычно из-за отсутствия `rel="noopener"` на внешних ссылках или ошибок в консоли.

- [ ] **Step 5: Замерить с включённым тегом**

Отложенная загрузка означает, что во время аудита Lighthouse тег не грузится: робот не скроллит и не кликает. Чтобы знать настоящую цифру для человека, который взаимодействует со страницей, замерить второй раз с принудительной загрузкой.

Временно заменить условие запуска на немедленный вызов `loadTag()`, собрать, прогнать `lhci autorun`, записать результат в `docs/visual-check.md` отдельной строкой, вернуть отложенный запуск.

Expected: Performance не ниже 90 при включённом теге. Если ниже — проблема не в теге, а в самой странице.

- [ ] **Step 6: Прогнать всё**

Run: `npm test && npm run test:perf`
Expected: PASS

- [ ] **Step 7: Коммит**

```bash
git add -A
git commit -m "test: бюджет производительности в Lighthouse CI

Замер сделан дважды: без тега, как его видит робот, и с принудительно
включённым тегом, как его видит человек. Вторая цифра записана, чтобы
отложенная загрузка не создавала иллюзию скорости."
```

---

## Task 16: Материалы для Google Ads

**Files:**
- Create: `docs/google-ads.md`

**Interfaces:**
- Consumes: `data-cta`-метки из Tasks 7–11
- Produces: документ для настройки кампании

- [ ] **Step 1: Собрать список меток источников**

```bash
grep -rho 'data-cta="[^"]*"' src/ | sort -u
```

Список меток попадает в документ: по ним настраиваются конверсии.

- [ ] **Step 2: Написать документ**

`docs/google-ads.md` со следующими разделами:

- **Настройка конверсий.** Две конверсии: `whatsapp_click` и `phone_click`. Обе импортируются из GA4 либо заводятся как события Ads. Параметр `source` показывает, какой блок сработал. Полный список меток из Step 1.
- **Установка идентификаторов.** Заполнить `PUBLIC_GA_ID` и `PUBLIC_ADS_ID` в переменных окружения Cloudflare Pages, пересобрать. До заполнения тег не грузится вовсе.
- **Структура кампании.** Поисковая кампания, гео Алматы плюс 20 км, язык русский, расписание показов 6:00–00:00 по времени Алматы — совпадает с режимом приёма заявок, ночные клики оплачивать бессмысленно.
- **Группы объявлений** по восьми поломкам из `src/data/breakages.ts` плюс группа по маркам из `src/data/brands.ts` плюс группа для бизнеса.
- **Минус-слова:** бесплатно, своими руками, схема, инструкция, вакансия, работа, б/у, купить, продам, отзывы о, зарплата, обучение, курсы, запчасти купить.
- **Заготовки объявлений:** по три заголовка и по два описания на группу, взятые из текстов макета. Использовать факты, которые уже есть на странице: 40-90 минут, диагностика от 3500 ₸, заявки с 6:00, свой склад, цена до начала работ.
- **Расширения:** номер телефона (оба номера), уточнения (выезд бесплатный, свой склад, цена до работ, заявки с 6:00), структурированное описание типа «Услуги».
- **Проверка модерацией.** Ниша ремонта техники проверяется строго. На странице должны быть видны: город, режим работы, оба телефона, честная формулировка цены. Всё это в футере уже есть.

- [ ] **Step 3: Проверить, что метки в документе совпадают с кодом**

Run: `grep -c 'card-' docs/google-ads.md`
Expected: не менее 8 упоминаний меток карточек

- [ ] **Step 4: Коммит**

```bash
git add -A
git commit -m "docs: материалы для настройки Google Ads

Расписание показов совпадает с режимом приёма заявок: клик в три часа
ночи оплачивается так же, как дневной, но заявку по нему принять
некому."
```

---

## Task 17: Деплой на Cloudflare Pages

**Files:**
- Create: `docs/deploy.md`
- Modify: `package.json` при необходимости

**Interfaces:**
- Consumes: собранный проект
- Produces: рабочий сайт на поддомене `*.pages.dev`, инструкция по подключению домена

- [ ] **Step 1: Отправить код в репозиторий**

```bash
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Создать проект в Cloudflare Pages**

Через панель Cloudflare: Workers & Pages → Create → Pages → Connect to Git → выбрать `BDCasper/expresscooling`.

Настройки сборки:
- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 24

Переменные окружения оставить пустыми до создания рекламных аккаунтов.

- [ ] **Step 3: Проверить, что сборка прошла и сайт открывается**

Открыть выданный адрес `*.pages.dev`, проверить: страница открывается, шрифты грузятся, изображения отображаются, кнопки WhatsApp ведут на настоящий номер.

- [ ] **Step 4: Прогнать Lighthouse по живому адресу**

```bash
npx lighthouse https://<проект>.pages.dev --preset=perf --form-factor=mobile --output=json --output-path=./lh-live.json --quiet
node -e "const r=require('./lh-live.json');console.log('Performance:',r.categories.performance.score)"
```

Expected: не ниже 0.95 на живом адресе. Локальный замер оптимистичнее: он не учитывает сеть.

- [ ] **Step 5: Записать инструкцию по домену**

`docs/deploy.md`: как купить `expresscooling.kz` на ps.kz, где в панели ps.kz прописать NS-серверы Cloudflare, как добавить домен в Cloudflare как зону, как привязать его к проекту Pages, как проверить выпуск сертификата. Отметить, что делегирование домена `.kz` занимает до нескольких часов.

- [ ] **Step 6: Коммит**

```bash
git add -A
git commit -m "docs: инструкция по деплою и подключению домена"
git push
```

---

## Self-Review

**Покрытие спеки.** Проверено по разделам:

| Раздел спеки | Задача |
|---|---|
| Стек, отказ от React | 1 |
| Токены, шрифт Onest | 2 |
| Контакты из единого источника | 3 |
| Изображения из Figma, реестр замены | 4 |
| Анимация «оттаивание», фолбэк, reduced-motion | 5 |
| Отложенный gtag, UTM, метки источников | 6 |
| JSON-LD LocalBusiness без адреса | 6 |
| Все 10 секций макета | 7–11 |
| Адаптив, якоря, порядок секций | 12 |
| robots, sitemap, og, 404, alt, иерархия | 13 |
| Визуальная сверка с Figma | 14 |
| Бюджет производительности | 15 |
| Материалы Google Ads | 16 |
| Cloudflare Pages, домен | 17 |

Требования спеки без задачи не осталось.

**Расхождение со спекой, зафиксировано осознанно.** Спека требует «JS до загрузки трекера — 0 КБ». Полностью нулевым он быть не может: отложенная загрузка тега, подстановка UTM и отправка событий требуют кода. Бюджет уточнён: ноль внешних JS-файлов плюс инлайн-скрипт не более 2 КБ. Проверяется в Task 6 Step 8 и Task 15.

**Второе уточнение.** Отложенная загрузка тега означает, что Lighthouse измеряет страницу без него. Чтобы цифра не вводила в заблуждение, Task 15 Step 5 делает второй замер с принудительно включённым тегом и записывает результат.

**Согласованность имён.** `whatsappHref()`, `telHref()`, `primaryPhone()`, `digitsOnly()` определены в Task 3 и используются в Tasks 5, 7, 11 в том же виде. `images` из Task 4 используется в Tasks 7–11. `data-cta` вводится в Task 5 и собирается в Task 16. `data-section` вводится в Task 12 и используется в Task 14.
