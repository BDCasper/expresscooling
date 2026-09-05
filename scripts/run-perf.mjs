#!/usr/bin/env node
/**
 * Обёртка над `lhci autorun`, а не голая команда в package.json. Нужна
 * только на Windows: дочерний процесс, в котором lighthouse запускает
 * chrome-launcher, падает при уборке временного профиля Chrome (см.
 * lhci-windows-chrome-cleanup-shim.cjs — там разобрано, почему). Шим
 * подключается через NODE_OPTIONS=--require, а на других платформах
 * (Linux/macOS в CI) проблемы нет — там rmSync не даёт EPERM в этом месте,
 * и шим, даже если он загрузится, ничего не перехватывает и не меняет
 * поведение.
 *
 * Задавать переменную окружения для одной команды без cross-env — по-разному
 * пишется в cmd.exe/PowerShell/bash, а новый пакет добавлять нельзя
 * (глобальное ограничение проекта). Обычный node-скрипт с
 * child_process.spawnSync — кросс-платформенный способ сделать то же самое
 * без единой новой зависимости.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Прямые слэши даже на Windows: NODE_OPTIONS разбирается собственным
// токенизатором Node, который воспринимает "\" внутри значения как символ
// экранирования — обратные слэши пути на Windows превращались в мусор
// ("D:Codingholodilniki..." вместо "D:\Coding\holodilniki\..."), и require
// внутри шима падал с MODULE_NOT_FOUND. Прямые слэши Node принимает как путь
// файловой системы на любой платформе.
const shimPath = path.join(__dirname, 'lhci-windows-chrome-cleanup-shim.cjs').split(path.sep).join('/');

const nodeOptions = [process.env.NODE_OPTIONS, `--require "${shimPath}"`].filter(Boolean).join(' ');

// Запускаем bin-файл @lhci/cli напрямую через node, а не через `npx`/`npx.cmd`:
// на Windows spawnSync без shell:true не умеет резолвить .cmd-обёртки (EINVAL),
// а shell:true — свой источник проблем с экранированием аргументов. Прямой
// путь к скрипту (require.resolve по полю "bin" из package.json) работает
// одинаково на всех платформах и не зависит от PATH.
const require = createRequire(import.meta.url);
const lhciBin = require.resolve('@lhci/cli/src/cli.js');

const result = spawnSync(process.execPath, [lhciBin, 'autorun'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
