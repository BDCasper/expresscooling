import { expect, test } from '@playwright/test';

/**
 * Регресс 1 (найден и исправлен первым): у секции оборудования
 * (#oborudovanie) стоял overflow: hidden ради декоративного градиента (см.
 * комментарий в Equipment.astro). По спецификации CSS Overflow это делает
 * элемент "контейнером прокрутки", даже если сам он никогда не скроллится, —
 * а .reveal/.reveal-soft внутри него используют animation-timeline: view(),
 * которая привязывается к БЛИЖАЙШЕМУ такому контейнеру-предку, а не к
 * странице. Секция не прокручивается, поэтому прогресс анимации замирал на
 * первом вычисленном значении (застревал на 0.68 и 0.896 при живой проверке
 * в браузере) и блок навсегда оставался размытым и приподнятым, даже уехав
 * далеко выше экрана. Исправлено: overflow-hidden -> overflow-clip.
 *
 * Регресс 2 (найден при отладке регресса 1, оказался главным и более
 * серьёзным): минификатор Tailwind v4 (Lightning CSS) на продакшен-сборке
 * сливал раздельные объявления animation/animation-timeline/animation-range
 * одного правила в одно сокращённое значение свойства animation со встроенной
 * шкалой — animation:linear both thaw view(). Спецификация CSS Animations
 * сокращённую запись animation с временной шкалой не описывает вовсе, и
 * реальный браузер (Chromium 151.0.7922.34, бандл этой версии Playwright) её
 * не разбирает: CSS.supports('animation-timeline', 'view()') = true
 * (отдельное свойство поддержано), но CSS.supports('animation', 'linear both
 * thaw view()') = false. Из-за этого на собранной странице анимации
 * появления не играли ВООБЩЕ — не в одной секции, а по всему сайту: правка
 * overflow-hidden -> overflow-clip была верной, но эффект от неё было не
 * увидеть, потому что сами анимации оказались отключены целиком другим
 * дефектом. Исправлено в global.css: animation-timeline/animation-range
 * вынесены в отдельные правила с эквивалентным по специфичности, но
 * текстуально другим селектором ([class~="reveal"] вместо .reveal) — так
 * минификатор не может ни слить объявления внутри одного правила, ни
 * схлопнуть правила с "одинаковым" селектором обратно. Подробный разбор,
 * включая первую (тоже сломанную) попытку через :where(...), — в global.css
 * прямо у этих правил.
 */

test('у элементов с классами появления реально есть анимации, привязанные к прокрутке', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .reveal-soft, .reveal-stagger > *'));
    return els
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const anim = el.getAnimations()[0];
        return {
          selector: el.className,
          // "в кадре или ниже" — ещё не проехавший полностью выше экрана
          // элемент: либо уже частично/полностью виден, либо ещё ниже
          // вьюпорта и появление ему только предстоит. Сразу после
          // goto() (без прокрутки) это почти все reveal-блоки страницы —
          // ровно то, что нужно, чтобы поймать поломку не в одной секции,
          // а по всему сайту.
          inViewOrBelow: rect.bottom > 0,
          hasAnimation: Boolean(anim),
          // getAnimations()[0].timeline === document.timeline означает, что
          // анимация на самом деле подключена к обычным часам страницы, а
          // не к шкале прокрутки — ровно то, что происходило при первой
          // (неудачной) попытке фикса через :where(...): Animation-объект
          // существовал, но был бесполезен (сразу "закончен", проекция не
          // зависела от скролла). Просто "hasAnimation" это не ловит.
          isDocumentTimeline: Boolean(anim) && anim.timeline === document.timeline,
        };
      })
      .filter((r) => r.inViewOrBelow);
  });

  // Если список пуст — тест ничего не проверил (деградация верстки/выборки).
  expect(result.length).toBeGreaterThan(0);

  for (const item of result) {
    expect(item.hasAnimation, `нет ни одной анимации у ${item.selector}`).toBe(true);
    expect(item.isDocumentTimeline, `анимация у ${item.selector} привязана к обычным часам страницы, а не к прокрутке`).toBe(false);
  }
});

test('анимации появления доходят до конца у блоков, уехавших выше экрана', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Смотрим на реальном скролле, а не программном скачке: докручиваем до
  // самого низа документа и даём плавному scroll-behavior и layout устояться.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  const results = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .reveal-soft, .reveal-stagger > *'));
    return els
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const anim = el.getAnimations()[0];
        const timing = anim?.effect?.getComputedTiming();
        const style = getComputedStyle(el);
        return {
          selector: el.className,
          scrolledPastTop: rect.bottom <= 0,
          hasAnimation: Boolean(anim),
          progress: timing?.progress ?? null,
          opacity: style.opacity,
          filter: style.filter,
        };
      })
      .filter((r) => r.scrolledPastTop);
  });

  // Если этот список пуст — тест ничего не проверил (например, если верстка
  // страницы изменится так, что ни один reveal-блок не выше вьюпорта на
  // самом низу прокрутки). Явно требуем непустой список, чтобы такая
  // деградация теста не осталась незамеченной.
  expect(results.length).toBeGreaterThan(0);

  // И явно требуем, чтобы хотя бы часть из них реально имела Animation-объект
  // (то есть шкала действительно активна) — иначе тест мог бы пройти вообще
  // ничего не проверив по существу.
  expect(results.some((r) => r.hasAnimation)).toBe(true);

  for (const item of results) {
    // Элементы, которые уже были в кадре на первой же отрисовке (например,
    // текстовая колонка Hero — она попадает во вьюпорт сразу при загрузке,
    // ещё до первого скролла), в Chromium иногда не получают Animation-
    // объект вовсе: подтверждено отдельно (см. lighthouserc.cjs, эксперимент
    // задачи 15) — opacity:1 и пустой getAnimations() уже на первом кадре.
    // Это не баг — конечное состояние достигнуто, просто без явного
    // Animation-объекта. Поэтому progress проверяем только когда объект
    // есть, а без него требуем напрямую конечное визуальное состояние.
    if (item.hasAnimation) {
      expect(item.progress, `progress у ${item.selector}`).toBe(1);
    }
    expect(item.opacity, `opacity у ${item.selector}`).toBe('1');
    expect(['none', 'blur(0px)'], `filter у ${item.selector} — ${item.filter}`).toContain(item.filter);
  }
});
