'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { CarePanel, fitPosition } = require('../panel/controller.cjs');
const { interact, INTERVAL_MS } = require('../skills/nicole-pet/scripts/care.cjs');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nicole-panel-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
test('panel shares hunger with the skill and announces only once per low-hunger period, across restarts', t => {
  const root = fixture(t), start = 1792700000000;
  const panel = new CarePanel(root);
  panel.update('init', start);
  const lowTime = start + 70 * INTERVAL_MS;
  assert.equal(panel.update('status', lowTime).announce, true);
  assert.equal(new CarePanel(root).update('status', lowTime).announce, false);
  panel.setPreference('notifications', true);
  assert.equal(panel.update('status', lowTime).announce, true);
  assert.equal(panel.update('status', lowTime).announce, false);
  assert.equal(panel.update('feed', lowTime).fullness, 60);
  assert.equal(interact('status', { codexRoot: root, now: lowTime }).fullness, 60);
  assert.equal(panel.update('status', lowTime + 30 * INTERVAL_MS).announce, true);
  interact('feed', { codexRoot: root, now: lowTime + 30 * INTERVAL_MS });
  assert.equal(panel.update('status', lowTime + 30 * INTERVAL_MS).low, false);
});
test('panel preserves existing care data and validates preferences without replacing damaged files', t => {
  const root = fixture(t), now = 1792700000000;
  interact('init', { codexRoot: root, now });
  interact('status', { codexRoot: root, now: now + 13 * INTERVAL_MS });
  const panel = new CarePanel(root);
  assert.equal(panel.update('init', now + 13 * INTERVAL_MS).fullness, 87);
  panel.setPreference('compact', true);
  panel.setPreference('notifications', true);
  panel.setPosition(40, 50);
  assert.equal(new CarePanel(root).preferences.compact, true);
  assert.deepEqual(new CarePanel(root).preferences.position, { x: 40, y: 50 });
  assert.throws(() => panel.setPreference('fullness', 100));
  fs.writeFileSync(panel.file, '{broken');
  assert.throws(() => new CarePanel(root));
  assert.equal(fs.readFileSync(panel.file, 'utf8'), '{broken');
});
test('panel reappears within the active display after monitor removal or corrupted position', () => {
  const area = { x: -1440, y: 0, width: 1440, height: 900 };
  assert.deepEqual(fitPosition({ x: 3000, y: -3000 }, area, 352, 376), { x: -352, y: 0 });
  assert.deepEqual(fitPosition({ x: 'bad', y: null }, area, 352, 376), { x: -376, y: 488 });
});
