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
    assert.deepEqual(fs.readFileSync(path.join(root, 'output/nicole', name)), fs.readFileSync(path.join(assets, name)));
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
  assert.deepEqual(fs.readFileSync(path.join(legacy.installed, readJson(path.join(legacy.installed, 'pet.json')).spritesheetPath)), fs.readFileSync(path.join(assets, 'spritesheet-v1.webp')));
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

test('reinstalling identical assets does not touch pet files or create another backup', t => {
  const dir = fixture(t), initial = ok(run(dir));
  const files = ['pet.json', 'spritesheet.webp'].map(name => path.join(initial.installed, name));
  for (const file of files) fs.utimesSync(file, new Date('2020-01-01'), new Date('2020-01-01'));
  const before = files.map(file => fs.statSync(file).mtimeMs);
  const again = ok(run(dir));
  assert.equal(again.unchanged, true);
  assert.equal(again.backup, null);
  assert.deepEqual(files.map(file => fs.statSync(file).mtimeMs), before);
});

test('a format upgrade keeps both old and new manifests readable at each rename', t => {
  const dir = fixture(t);
  const original = ok(run(dir, '--legacy'));
  const originalBytes = fs.readFileSync(path.join(original.installed, 'spritesheet.webp'));
  const result = spawnSync(process.execPath, ['-e', `
    const fs = require('node:fs');
    const path = require('node:path');
    const { readPackage } = require(path.join(path.dirname(process.argv[1]), 'native.cjs'));
    const dest = path.join(process.env.CODEX_HOME, 'pets/nicole');
    const rename = fs.renameSync;
    fs.renameSync = (...args) => {
      readPackage(dest);
      const result = rename(...args);
      readPackage(dest);
      return result;
    };
    console.log(JSON.stringify(require(process.argv[1]).install([])));
  `, installer], { env: { ...process.env, CODEX_HOME: dir }, cwd: dir, encoding: 'utf8' });
  assert.equal(ok(result).version, 2);
  assert.deepEqual(fs.readFileSync(path.join(original.installed, 'spritesheet.webp')), originalBytes);
});

test('busy install lock is preserved and doctor is read-only', t => {
  const dir = fixture(t), initial = ok(run(dir));
  const { inspect } = require('../skills/nicole-pet/scripts/doctor.cjs');
  const file = path.join(initial.installed, 'spritesheet.webp');
  const before = fs.statSync(file).mtimeMs;
  assert.equal(inspect(dir).matchesBundledArt, true);
  assert.equal(fs.statSync(file).mtimeMs, before);
  const lock = path.join(dir, 'pet-backups/nicole/.install-lock');
  fs.mkdirSync(lock);
  assert.notEqual(run(dir).status, 0);
  assert.ok(fs.existsSync(lock));
  fs.writeFileSync(file, 'broken');
  assert.equal(inspect(dir).validPackage, false);
});
