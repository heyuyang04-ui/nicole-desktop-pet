'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'skills/nicole-pet/assets');
const installer = path.join(root, 'skills/nicole-pet/scripts/install.cjs');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nicole-native-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function run(dir, ...args) {
  return spawnSync(process.execPath, [installer, ...args], {
    cwd: dir, env: { ...process.env, CODEX_HOME: dir }, encoding: 'utf8'
  });
}
function ok(result) {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

test('release v2 assets match the self-contained skill', () => {
  for (const name of ['pet.json', 'spritesheet.webp']) {
    assert.deepEqual(fs.readFileSync(path.join(root, 'assets/codex', name)), fs.readFileSync(path.join(assets, name)));
  }
});

test('dry run is read-only; default installation contains the v2 atlas', t => {
  const dir = fixture(t);
  const preview = ok(run(dir, '--dry-run'));
  assert.equal(preview.version, 2);
  assert.deepEqual(preview.size, [1536, 2288]);
  assert.deepEqual(fs.readdirSync(dir), []);
  const installed = ok(run(dir));
  assert.equal(installed.installed, path.join(dir, 'pets/nicole'));
  assert.equal(installed.backup, null);
  assert.equal(installed.sha256, preview.sha256);
  assert.deepEqual(readJson(path.join(installed.installed, 'pet.json')), readJson(path.join(assets, 'pet.json')));
  assert.deepEqual(fs.readFileSync(path.join(installed.installed, 'spritesheet.webp')), fs.readFileSync(path.join(assets, 'spritesheet.webp')));
});

test('legacy fallback and v2 reinstall preserve user files and backup the previous package', t => {
  const dir = fixture(t);
  const initial = ok(run(dir));
  fs.writeFileSync(path.join(initial.installed, 'user-note.txt'), 'keep me');
  const legacy = ok(run(dir, '--legacy'));
  assert.equal(legacy.version, 1);
  assert.equal(readJson(path.join(legacy.installed, 'pet.json')).spriteVersionNumber, 1);
  assert.equal(readJson(path.join(legacy.backup, 'pet.json')).spriteVersionNumber, 2);
  assert.deepEqual(fs.readFileSync(path.join(legacy.installed, 'spritesheet.webp')), fs.readFileSync(path.join(assets, 'spritesheet-v1.webp')));
  assert.equal(fs.readFileSync(path.join(legacy.backup, 'user-note.txt'), 'utf8'), 'keep me');
  assert.deepEqual(ok(run(dir, '--legacy', '--dry-run')).size, [1536, 1872]);
  const restored = ok(run(dir));
  assert.equal(restored.version, 2);
  assert.equal(readJson(path.join(restored.backup, 'pet.json')).spriteVersionNumber, 1);
  assert.equal(fs.readFileSync(path.join(restored.installed, 'user-note.txt'), 'utf8'), 'keep me');
  assert.equal(restored.sha256, initial.sha256);
});

test('installation refuses to replace a different character', t => {
  const dir = fixture(t);
  const dest = path.join(dir, 'pets/another-character');
  fs.mkdirSync(dest, { recursive: true });
  const original = JSON.stringify({ id: 'another-character', displayName: 'Other' });
  fs.writeFileSync(path.join(dest, 'pet.json'), original);
  const result = run(dir, '--dest', dest);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /different pet/);
  assert.equal(fs.readFileSync(path.join(dest, 'pet.json'), 'utf8'), original);
  assert.deepEqual(fs.readdirSync(dest), ['pet.json']);
});
