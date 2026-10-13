import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const port = 3100;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server startup timed out')), 10000);
    server.stdout.once('data', () => { clearTimeout(timeout); resolve(); });
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Test server exited: ${code}`)); });
  });
  const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
  browser = await engine.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}), ...(engine === chromium ? { args: ['--no-sandbox'] } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Deterministic drops exercise actual clicks and UI, without changing production code.
  await page.addInitScript(() => { let i = 0; const rolls = [.1, .1, .1, .45, .1, .8]; Math.random = () => rolls[i++ % rolls.length]; });
  await page.goto(base);
  await page.locator('[data-action="pray"].primary').waitFor();
  assert.equal(await page.title(), '一叶问仙 · 山中有清欢');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/iphone-home.png', fullPage: true });
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-action="pray"].primary').click();
    await page.locator('[data-action="equip"]').click();
    await page.locator('dialog').waitFor({ state: 'hidden' });
  }
  assert.equal(await page.locator('#fruit').textContent(), '25');
  await page.locator('[data-action="breakthrough"]').click();
  assert.equal(await page.locator('#realm').textContent(), '炼气');
  await page.locator('[data-tab="character"]').click();
  assert.equal(await page.locator('.equip-row').count(), 3);
  assert.ok((await page.locator('.equip-row').allTextContents()).every(text => !text.includes('尚未结缘')));
  await page.locator('[data-action="tree"]').click();
  assert.match(await page.locator('.card').first().textContent(), /2 阶/);
  await page.locator('[data-tab="adventure"]').click();
  await page.locator('[data-action="battle"]').click();
  await page.locator('[data-action="next-battle"]').waitFor({ timeout: 45000 });
  assert.match(await page.locator('#battle-log').textContent(), /此战告捷/);
  await page.screenshot({ path: 'test-results/iphone-battle.png', fullPage: true });
  await page.locator('[data-tab="quests"]').click();
  await page.locator('[data-claim="first"]').click();
  assert.equal(await page.locator('[data-claim="first"]').isDisabled(), true);
  await page.locator('#settings').click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('[data-action="export"]').click();
  const download = await downloadEvent;
  await download.saveAs('test-results/backup.json');
  await page.locator('[data-action="reset-confirm"]').click();
  await page.locator('[data-action="reset"]').click();
  assert.equal(await page.locator('#realm').textContent(), '凡尘初醒');
  await page.locator('#settings').click();
  await page.locator('#import-file').setInputFiles('test-results/backup.json');
  await page.locator('#confirm-import').click();
  assert.equal(await page.locator('#realm').textContent(), '炼气');
  await page.reload();
  await page.locator('[data-action="pray"].primary').waitFor();
  assert.equal(await page.locator('#realm').textContent(), '炼气');
  // An uncollected item also survives reload and can be resolved exactly once.
  await page.locator('[data-action="pray"].primary').click();
  await page.locator('[data-action="equip"]').waitFor();
  await page.reload();
  await page.locator('[data-action="pray"].primary').click();
  await page.locator('[data-action="sell"]').click();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.locator('[data-action="pray"].primary').click();
  await page.locator('[data-action="equip"]').click();
  assert.equal(await page.locator('#realm').textContent(), '炼气');
  await context.setOffline(false);
  for (const width of [320, 375, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Horizontal overflow at ${width}px`);
    for (const tab of ['adventure', 'character', 'quests', 'home']) {
      await page.locator(`[data-tab="${tab}"]`).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${tab} overflow at ${width}px`);
    }
  }
  await page.screenshot({ path: 'test-results/desktop-home.png', fullPage: true });
  for (const url of ['/.git/config', '/package.json', '/tests/game.test.mjs']) {
    const response = await fetch(base + url); assert.equal(response.status, 404);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: mobile gameplay, equipment, breakthrough, upgrades, battle, quests, export/import, reload, pending drops, offline play, 6 viewport sizes, private-file protection, no page errors.');
} finally {
  await browser?.close(); server.kill();
}
