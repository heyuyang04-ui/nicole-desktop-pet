'use strict';
const { _electron: electron } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { interact } = require('../skills/nicole-pet/scripts/care.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nicole-panel-smoke-'));
  const output = path.join(root, 'test-results/panel'); fs.mkdirSync(output, { recursive: true });
  // Start a simulated hunger episode without touching the user's real state.
  interact('init', { codexRoot: directory, now: Date.now() - 70 * 300000 });
  const env = { ...process.env, CODEX_HOME: directory }; delete env.ELECTRON_RUN_AS_NODE;
  let application;
  try {
    const executablePath = process.env.NICOLE_PANEL_EXECUTABLE;
    application = await electron.launch({ ...(executablePath ? { executablePath, args: [] } : { args: [root] }), env });
    const page = await application.firstWindow();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.waitForSelector('body[data-fullness="30"]');
    await page.locator('#portrait').evaluate(img => img.decode());
    await page.screenshot({ path: path.join(output, 'hungry.png') });
    assert.equal(await page.locator('#greeting').textContent(), '可以给我一点吃的吗？');
    assert.equal(await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length), 1);
    await page.locator('#feed').click();
    await page.waitForSelector('body[data-fullness="60"].eating');
    await page.locator('#portrait').evaluate(img => img.decode());
    await page.screenshot({ path: path.join(output, 'eating.png') });
    assert.equal(interact('status', { codexRoot: directory }).fullness, 60);
    const rapid = await page.evaluate(() => window.nicole.command('feed'));
    assert.equal(rapid.ok, false);
    await page.locator('#collapse').click();
    await page.waitForSelector('body.compact');
    assert.deepEqual(await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getSize()), [272, 64]);
    await page.screenshot({ path: path.join(output, 'compact.png') });
    await page.locator('#collapse').click();
    await page.waitForSelector('body:not(.compact)');
    await page.locator('#pin').uncheck();
    assert.equal(await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isAlwaysOnTop()), false);
    // A concurrent Codex skill feeding command is reflected without resetting anything.
    interact('feed', { codexRoot: directory });
    await page.evaluate(() => window.nicole.command('status'));
    await page.waitForSelector('body[data-fullness="90"]');
    assert.equal((await page.evaluate(() => window.nicole.command('fullness', 100))).ok, false);
    assert.equal(await page.evaluate(() => typeof window.require), 'undefined');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, windowCount: 1, fullness: 90, checked: ['shared state', 'feeding animation', 'rapid-click guard', 'compact resize', 'pin toggle', 'renderer isolation'], screenshots: output }));
  } finally {
    if (application) await application.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
