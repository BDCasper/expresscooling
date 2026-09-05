'use strict';

/**
 * На Windows дочерний процесс `lighthouse` (его запускает `@lhci/cli` из
 * node-runner.js) иногда падает не на самом аудите, а на уборке за собой:
 * chrome-launcher (транзитивная зависимость lighthouse) после каждого
 * прогона удаляет временный профиль Chrome в os.tmpdir() и получает EPERM —
 * файл ещё на долю секунды занят закрывающимся процессом Chrome или
 * антивирусом, который сканирует свежесозданные файлы. К этому моменту
 * аудит уже полностью завершён и JSON-отчёт уже сформирован (см.
 * node_modules/lighthouse/cli/run.js: launchedChrome.kill() вызывается
 * ПОСЛЕ saveResults()) — падает именно очистка, а не измерение.
 *
 * У @lhci/cli уже есть прощение похожего случая — если процесс упал с кодом
 * 1, но похож на валидный LHR и в stderr есть "Chrome could not be killed"
 * (node_modules/@lhci/cli/src/collect/node-runner.js). Наш случай не
 * попадает под эту проверку: ошибка бросается из chrome-launcher.js
 * destroyTmp() → rmSync(), а не из try/catch вокруг taskkill, поэтому
 * сообщение другое и код всё равно завершается с ошибкой, из-за чего lhci
 * считает валидный прогон неудачным и не сохраняет отчёт.
 *
 * Патчим fs.rmSync только для путей, которые совпадают с тем, что создаёт
 * и удаляет сам chrome-launcher (os.tmpdir()/lighthouse.*, см.
 * node_modules/chrome-launcher/dist/chrome-launcher.js, makeTmpDir/
 * destroyTmp) — никакое другое поведение fs в проекте не затрагивается.
 * Не оставленная папка не влияет на корректность замера: это только
 * временный профиль браузера, а не часть результата.
 *
 * Подключается через NODE_OPTIONS=--require, а не правкой node_modules —
 * npm install должен оставаться воспроизводимым без ручных патчей. См.
 * scripts/run-perf.mjs, который выставляет эту переменную только для
 * дочернего процесса `lhci autorun`.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const tmpRoot = path.resolve(os.tmpdir());

function isChromeLauncherTmpDir(target) {
  if (typeof target !== 'string') return false;
  const rel = path.relative(tmpRoot, path.resolve(target));
  return rel.startsWith('lighthouse.') && !rel.startsWith('..');
}

const originalRmSync = fs.rmSync.bind(fs);
fs.rmSync = function patchedRmSync(target, options) {
  try {
    return originalRmSync(target, options);
  } catch (err) {
    if (isChromeLauncherTmpDir(target) && (err.code === 'EPERM' || err.code === 'EBUSY')) {
      return undefined;
    }
    throw err;
  }
};
