import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { fresh, SAVE_KEY } from '../src/game.js';

const base = 'http://127.0.0.1:3100';
const server = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: '3100' }, stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 10000);
    server.stdout.once('data', () => { clearTimeout(timeout); resolve(); });
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
  });
  const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
  browser = await engine.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}), ...(engine === chromium ? { args: ['--no-sandbox'] } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const now = new Date('2026-10-13T12:00:00+08:00');
  await page.clock.setFixedTime(now);
  await page.addInitScript(() => { let i = 0; const rolls = [.1, .1, .1, .45, .1, .8]; Math.random = () => rolls[i++ % rolls.length]; });
  const nav = tab => page.locator(`.bottom-nav [data-tab="${tab}"]`).click();
  const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE_KEY);
  async function finishFight(trigger) {
    await trigger.click();
    const skip = page.locator('[data-action="skip"]'); await skip.waitFor(); await skip.click();
    await page.locator('#modal [data-action="close"]').waitFor();
    const text = await page.locator('#modal-body').textContent();
    await page.locator('#modal [data-action="close"]').click();
    return text;
  }
  await page.goto(base); await page.locator('[data-action="pray"].primary').waitFor();
  assert.equal(await page.title(), '一叶问仙 · 山中有清欢');
  assert.equal(await page.locator('#fruit').textContent(), '∞'); assert.equal(await page.locator('#coins').textContent(), '∞');
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/iphone-home.png', fullPage: true });
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-action="pray"].primary').click(); await page.locator('[data-action="equip"]').click();
    await page.locator('dialog').waitFor({ state: 'hidden' });
  }
  for (let i = 0; i < 2; i++) await page.locator('[data-action="batch"]').click();
  assert.equal((await saved()).chops, 25);
  assert.equal(await page.locator('#fruit').textContent(), '∞');
  await page.locator('[data-action="breakthrough"]').click(); assert.equal(await page.locator('#realm').textContent(), '炼气');
  await nav('character');
  assert.equal(await page.locator('.equip-row').count(), 3);
  assert.ok((await page.locator('.equip-row').allTextContents()).every(text => !text.includes('尚未结缘')));
  await page.locator('[data-style="sword"]').click(); assert.equal((await saved()).style, 'sword');
  await page.locator('[data-action="tree"]').click(); assert.equal((await saved()).tree, 2);
  await page.locator('[data-action="pet"]').click(); assert.equal((await saved()).pet, 1);
  await page.locator('[data-claim="first"]').click(); assert.equal(await page.locator('[data-claim="first"]').isDisabled(), true);
  await nav('adventure');
  assert.match(await finishFight(page.locator('[data-action="battle"]')), /此战告捷/);
  assert.equal((await saved()).stage, 2);
  await nav('arena'); assert.equal(await page.locator('.rank-row').count(), 9);
  assert.equal(await page.locator('[data-duel]').count(), 8); assert.equal(await page.locator('.bot-label', { hasText: '机器人' }).count(), 8);
  const before = (await saved()).arena;
  await page.reload(); await nav('arena'); assert.deepEqual((await saved()).arena, before);
  for (let i = 0; i < 3; i++) assert.match(await finishFight(page.locator('[data-duel="bamboo"]')), /论道获胜/);
  assert.equal((await saved()).arena.matches, 3); assert.ok((await saved()).arena.rating > 1000);
  await page.screenshot({ path: 'test-results/iphone-ranking.png', fullPage: true });
  await nav('events');
  for (const id of ['login', 'pray', 'duel']) { await page.locator(`[data-daily="${id}"]`).click(); assert.equal(await page.locator(`[data-daily="${id}"]`).isDisabled(), true); }
  assert.match(await finishFight(page.locator('[data-event="tower"]')), /第 1 层告捷/);
  assert.equal((await saved()).weekly.tower, 1);
  assert.match(await finishFight(page.locator('[data-event="boss"]')), /讨伐得分/);
  assert.ok((await saved()).weekly.bossBest > 0);
  await page.screenshot({ path: 'test-results/iphone-events.png', fullPage: true });
  const progress = await saved();
  await page.locator('#settings').click();
  const downloadEvent = page.waitForEvent('download'); await page.locator('[data-action="export"]').click();
  await (await downloadEvent).saveAs('test-results/backup.json');
  await page.locator('[data-action="reset-confirm"]').click(); await page.locator('[data-action="reset"]').click();
  assert.equal(await page.locator('#realm').textContent(), '凡尘初醒');
  await page.locator('#settings').click(); await page.locator('#import-file').setInputFiles('test-results/backup.json');
  await page.locator('#confirm-import').click(); assert.equal(await page.locator('#realm').textContent(), '炼气');
  assert.deepEqual((await saved()).arena, progress.arena); assert.deepEqual((await saved()).weekly, progress.weekly);
  await page.locator('[data-action="pray"].primary').click(); await page.locator('[data-action="equip"]').waitFor();
  await page.reload(); await page.locator('[data-action="pray"].primary').click(); await page.locator('[data-action="sell"]').click();
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true); await page.reload();
  await page.locator('[data-action="batch"]').click();
  await nav('arena'); assert.match(await finishFight(page.locator('[data-duel="bamboo"]')), /论道/);
  await nav('events'); assert.match(await finishFight(page.locator('[data-event="boss"]')), /讨伐得分/);
  await context.setOffline(false);
  // Period changes update the visible page, and claims become available exactly once per new day.
  await page.clock.setFixedTime(new Date('2026-10-14T00:00:01+08:00'));
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).daily.claimed.length === 0, SAVE_KEY);
  assert.equal(await page.locator('[data-daily="login"]').isEnabled(), true); await page.locator('[data-daily="login"]').click();
  assert.equal((await saved()).logins, 2);
  await page.clock.setFixedTime(new Date('2026-10-19T00:00:01+08:00'));
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).arena.matches === 0, SAVE_KEY);
  assert.equal((await saved()).weekly.tower, 0); assert.equal((await saved()).arena.rating, 1000);
  assert.ok((await saved()).lastSeason.matches >= 4);
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const tab of ['adventure', 'character', 'arena', 'events', 'home']) {
      await nav(tab);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${tab} overflow at ${width}px`);
    }
  }
  await page.screenshot({ path: 'test-results/desktop-home.png', fullPage: true });
  // Real v1 migration in a separate browser profile, including raw backup retention.
  const legacyContext = await browser.newContext(), legacyPage = await legacyContext.newPage();
  const legacy = { ...fresh(Date.now()), version: 1, realm: 2, stage: 8, xp: 29, coins: 900, fruit: 42, claimed: ['first'] };
  await legacyContext.addInitScript(({ key, legacy }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(legacy)); }, { key: SAVE_KEY, legacy });
  await legacyPage.goto(base); await legacyPage.locator('[data-action="pray"].primary').waitFor();
  assert.equal(await legacyPage.locator('#realm').textContent(), '筑基'); assert.equal(await legacyPage.locator('#fruit').textContent(), '∞');
  assert.equal(await legacyPage.evaluate(key => JSON.parse(localStorage.getItem(key)).version, SAVE_KEY), 2);
  assert.equal(await legacyPage.evaluate(key => JSON.parse(localStorage.getItem(key + '-v1-backup')).version, SAVE_KEY), 1);
  // A second tab must not silently overwrite a later save.
  const other = await legacyContext.newPage(); await other.goto(base); await other.locator('[data-action="batch"]').click();
  await legacyPage.locator('.conflict-banner').waitFor();
  const shared = await other.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  await legacyPage.locator('[data-action="batch"]').click();
  assert.equal(await other.evaluate(key => localStorage.getItem(key), SAVE_KEY), shared);
  await legacyContext.close();
  const corruptContext = await browser.newContext(), corruptPage = await corruptContext.newPage();
  await corruptContext.addInitScript(key => localStorage.setItem(key, '{broken'), SAVE_KEY);
  await corruptPage.goto(base); await corruptPage.locator('[data-action="pray"].primary').waitFor();
  assert.equal(await corruptPage.evaluate(key => localStorage.getItem(key + '-recovery'), SAVE_KEY), '{broken');
  await corruptContext.close();
  // Exercise an existing installed worker upgrading to the new complete app shell.
  const updateContext = await browser.newContext(), updatePage = await updateContext.newPage();
  const oldWorker = `const CACHE='one-leaf-update-fixture';
    self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.add('/'))));
    self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
    self.addEventListener('fetch',e=>e.respondWith(fetch(e.request)));`;
  await updateContext.route('**/sw.js', route => route.fulfill({ contentType: 'text/javascript', body: oldWorker }));
  await updatePage.goto(base);
  await updatePage.evaluate(() => navigator.serviceWorker.ready);
  await updatePage.waitForFunction(() => navigator.serviceWorker.controller);
  assert.ok((await updatePage.evaluate(() => caches.keys())).includes('one-leaf-update-fixture'));
  await updatePage.locator('[data-action="batch"]').click();
  await updateContext.unroute('**/sw.js');
  await updatePage.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  await updatePage.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting));
  await updatePage.locator('#settings').click();
  await updatePage.locator('[data-action="update"]').click();
  await updatePage.waitForFunction(async () => !(await caches.keys()).includes('one-leaf-update-fixture'));
  await updatePage.locator('[data-action="pray"].primary').waitFor();
  assert.equal(await updatePage.evaluate(key => JSON.parse(localStorage.getItem(key)).chops, SAVE_KEY), 10);
  await updateContext.setOffline(true); await updatePage.reload();
  await updatePage.locator('[data-action="batch"]').click();
  assert.equal(await updatePage.evaluate(key => JSON.parse(localStorage.getItem(key)).chops, SAVE_KEY), 20);
  await updateContext.close();
  for (const url of ['/.git/config', '/package.json', '/tests/game.test.mjs']) assert.equal((await fetch(base + url)).status, 404);
  assert.deepEqual(errors, []);
  console.log('PASS: unlimited resources, growth/styles/batch equipment, adventure, 8 adaptive rivals, ranking persistence, daily claims, tower, boss, export/import, offline activities, day/week rollover, v1 migration, damaged-save backup, cross-tab guard, worker upgrade preserving progress, 6 viewport sizes, no page errors.');
} finally { await browser?.close(); server.kill(); }
