'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { initialState, advance, interact, INTERVAL_MS } = require('../skills/nicole-pet/scripts/care.cjs');
const start = 1800000000000;
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nicole-care-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('first use, exact five-minute boundary, and offline decay to zero', () => {
  const initial = initialState(start);
  assert.equal(advance(initial, start + INTERVAL_MS - 1).fullness, 100);
  assert.equal(advance(initial, start + INTERVAL_MS).fullness, 99);
  const offline = advance(initial, start + 107 * INTERVAL_MS + 1234);
  assert.equal(offline.fullness, 0);
  assert.equal(offline.lastDecayAt, start + 107 * INTERVAL_MS);
  assert.equal(initial.fullness, 100);
});

test('feeding adds 30, caps at 100, and preserves partial decay time', t => {
  const codexRoot = fixture(t);
  const first = interact('init', { codexRoot, now: start });
  assert.equal(first.created, true);
  assert.equal(first.fullness, 100);
  const now = start + 45 * INTERVAL_MS + 1000;
  const fed = interact('feed', { codexRoot, now });
  assert.equal(fed.beforeFullness, 55);
  assert.equal(fed.fullness, 85);
  assert.equal(fed.added, 30);
  assert.equal(fed.nextDropInSeconds, 299);
  const capped = interact('feed', { codexRoot, now });
  assert.equal(capped.fullness, 100);
  assert.equal(capped.added, 15);
  assert.equal(interact('feed', { codexRoot, now }).added, 0);
  assert.equal(interact('status', { codexRoot, now: start + 46 * INTERVAL_MS }).fullness, 99);
});

test('initialization during upgrade never resets an existing state', t => {
  const codexRoot = fixture(t);
  interact('init', { codexRoot, now: start });
  const upgraded = interact('init', { codexRoot, now: start + 23 * INTERVAL_MS });
  assert.equal(upgraded.created, false);
  assert.equal(upgraded.fullness, 77);
  assert.equal(interact('status', { codexRoot, now: start + 23 * INTERVAL_MS }).fullness, 77);
});

test('clock rollback rebases without increasing fullness', () => {
  const state = { schemaVersion: 1, fullness: 40, lastDecayAt: start };
  const rolled = advance(state, start - INTERVAL_MS);
  assert.equal(rolled.fullness, 40);
  assert.equal(rolled.lastDecayAt, start - INTERVAL_MS);
  assert.equal(advance(rolled, start).fullness, 39);
});

test('invalid state is preserved, and failed reads release only their own lock', t => {
  const codexRoot = fixture(t);
  const { stateFile } = interact('init', { codexRoot, now: start });
  for (const content of ['{broken', JSON.stringify({ schemaVersion: 2, fullness: 90, lastDecayAt: start }), JSON.stringify({ schemaVersion: 1, fullness: -1, lastDecayAt: start })]) {
    fs.writeFileSync(stateFile, content);
    assert.throws(() => interact('feed', { codexRoot, now: start }), /preserved/);
    assert.equal(fs.readFileSync(stateFile, 'utf8'), content);
    assert.deepEqual(fs.readdirSync(path.dirname(stateFile)), ['state.json']);
  }
});

test('concurrent command lock prevents lost writes and is not removed by a blocked command', t => {
  const codexRoot = fixture(t);
  const { stateFile } = interact('init', { codexRoot, now: start });
  const content = fs.readFileSync(stateFile, 'utf8');
  const lock = path.join(path.dirname(stateFile), '.lock');
  fs.mkdirSync(lock);
  assert.throws(() => interact('feed', { codexRoot, now: start }), /busy/);
  assert.equal(fs.existsSync(lock), true);
  assert.equal(fs.readFileSync(stateFile, 'utf8'), content);
});

test('bundled skill runs from any working directory without dependencies or a repository', t => {
  const dir = fixture(t);
  const skill = path.join(dir, 'installed-skill');
  fs.cpSync(path.resolve(__dirname, '../skills/nicole-pet'), skill, { recursive: true });
  const codexRoot = path.join(dir, 'codex-data');
  const execute = (...args) => spawnSync(process.execPath, args, { cwd: dir, env: { ...process.env, CODEX_HOME: codexRoot }, encoding: 'utf8' });
  const installed = execute(path.join(skill, 'scripts/install.cjs'));
  assert.equal(installed.status, 0, installed.stderr);
  const installation = JSON.parse(installed.stdout);
  assert.equal(installation.skillVersion, fs.readFileSync(path.join(skill, 'VERSION'), 'utf8').trim());
  assert.equal(installation.care.fullness, 100);
  assert.equal(installation.careError, undefined);
  const state = JSON.parse(fs.readFileSync(installation.care.stateFile, 'utf8'));
  state.fullness = 40;
  fs.writeFileSync(installation.care.stateFile, JSON.stringify(state));
  const upgraded = execute(path.join(skill, 'scripts/install.cjs'));
  assert.equal(upgraded.status, 0, upgraded.stderr);
  assert.equal(JSON.parse(upgraded.stdout).care.fullness, 40);
  const fed = execute(path.join(skill, 'scripts/care.cjs'), 'feed');
  assert.equal(fed.status, 0, fed.stderr);
  assert.equal(JSON.parse(fed.stdout).fullness, 70);
  const status = execute(path.join(skill, 'scripts/care.cjs'), 'status');
  assert.equal(status.status, 0, status.stderr);
  assert.equal(JSON.parse(status.stdout).fullness, 70);
  assert.equal(fs.readFileSync(path.join(skill, 'assets/eating.gif')).subarray(0, 3).toString(), 'GIF');
  const invalid = execute(path.join(skill, 'scripts/care.cjs'), 'reset');
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /Usage/);
});
