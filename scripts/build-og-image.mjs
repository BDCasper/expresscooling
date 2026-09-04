// Пересобирает public/og-image.jpg — картинку для соцсетей (og:image,
// twitter:card) — из тех же исходников, что и сам сайт: телефон живёт в
// src/data/site.ts, фото мастера и монограмма — в src/assets/images.
// Ничего не подставляется руками, поэтому файл не устаревает молча.
//
// Запускать: `npm run og:build`.
//
// Когда обязательно перезапускать:
//   - сменился телефон в src/data/site.ts (первый номер site.phones —
//     тот, что попадает на картинку);
//   - заменили фото первого экрана (src/assets/images/hero-master.jpg) —
//     план прямо предполагает, что временное фото сменится на настоящее
//     с выезда;
//   - поменяли заголовок ниже (`HEADLINE`) или логотип-монограмму
//     (src/assets/images/logo-ec-monogram.png).
//
// Результат — public/og-image.jpg — остаётся закоммиченным: сайт при
// каждой сборке отдаёт готовый файл, не гоняя headless-браузер в
// проде ради статичной картинки. Требует локально установленный Chromium
// для Playwright (`npx playwright install chromium`, обычно уже стоит —
// им пользуются e2e-тесты).

import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { site } from '../src/data/site.ts';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const HEADLINE = 'Ремонт холодильников в Алматы';
const MAX_BYTES = 150 * 1024;

const phone = site.phones[0].display;

const heroUrl = pathToFileURL(path.join(ROOT, 'src/assets/images/hero-master.jpg')).href;
const monogramUrl = pathToFileURL(path.join(ROOT, 'src/assets/images/logo-ec-monogram.png')).href;
const fontCyrillicUrl = pathToFileURL(path.join(ROOT, 'public/fonts/onest-cyrillic.woff2')).href;
const fontLatinUrl = pathToFileURL(path.join(ROOT, 'public/fonts/onest-latin.woff2')).href;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Onest";
    font-weight: 400 800;
    src: url("${fontCyrillicUrl}") format("woff2");
    unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
  }
  @font-face {
    font-family: "Onest";
    font-weight: 400 800;
    src: url("${fontLatinUrl}") format("woff2");
    unicode-range: U+0000-00FF, U+2000-206F, U+20AC, U+2122;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: "Onest", sans-serif;
    display: flex;
  }
  .panel {
    width: 560px;
    height: 630px;
    background: #232323;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 56px;
    position: relative;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 40px;
  }
  .brand img {
    width: 52px;
    height: 52.4px;
    border-radius: 9px;
    display: block;
  }
  .brand span {
    font-size: 26px;
    font-weight: 700;
    color: #f6f6f6;
    letter-spacing: -0.5px;
  }
  h1 {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -1.6px;
    color: #f6f6f6;
    max-width: 460px;
  }
  .phone {
    margin-top: 40px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .phone .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #efb726;
  }
  .phone span {
    font-size: 34px;
    font-weight: 700;
    color: #efb726;
    letter-spacing: -0.5px;
  }
  .photo {
    width: 640px;
    height: 630px;
    overflow: hidden;
    position: relative;
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 78% 50%;
    display: block;
  }
  .seam {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 90px;
    background: linear-gradient(to right, rgba(35,35,35,0.55), rgba(35,35,35,0));
  }
</style>
</head>
<body>
  <div class="panel">
    <div class="brand">
      <img src="${monogramUrl}" alt="" />
      <span>Express Cooling</span>
    </div>
    <h1>${HEADLINE}</h1>
    <div class="phone">
      <span class="dot"></span>
      <span>${phone}</span>
    </div>
  </div>
  <div class="photo">
    <div class="seam"></div>
    <img src="${heroUrl}" alt="" />
  </div>
</body>
</html>`;

const tmpHtmlPath = path.join(ROOT, 'og-image-source.tmp.html');
fs.writeFileSync(tmpHtmlPath, html, 'utf8');

let pngBuffer;
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(tmpHtmlPath).href);
  await page.evaluate(() => document.fonts.ready);
  pngBuffer = await page.screenshot({ type: 'png' });
} finally {
  await browser.close();
  fs.rmSync(tmpHtmlPath, { force: true });
}

const outPath = path.join(ROOT, 'public/og-image.jpg');
let quality = 88;
let buf = await sharp(pngBuffer).jpeg({ quality, mozjpeg: true }).toBuffer();
while (buf.length > MAX_BYTES && quality > 40) {
  quality -= 6;
  buf = await sharp(pngBuffer).jpeg({ quality, mozjpeg: true }).toBuffer();
}

if (buf.length > MAX_BYTES) {
  throw new Error(`og-image.jpg весит ${buf.length} байт даже при quality=${quality} — уложить в ${MAX_BYTES} байт не удалось`);
}

fs.writeFileSync(outPath, buf);
console.log(`Телефон на картинке: ${phone}`);
console.log(`public/og-image.jpg: quality=${quality}, ${buf.length} байт (${(buf.length / 1024).toFixed(1)} КБ)`);
