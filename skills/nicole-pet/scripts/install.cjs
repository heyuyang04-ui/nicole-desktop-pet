#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { dimensions, digest, assetPath } = require('./native.cjs');

function install(args = process.argv.slice(2)) {
  let destination, legacy = false, dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dest') {
      destination = args[++i];
      if (!destination || !path.isAbsolute(destination)) throw new Error('--dest requires an absolute directory');
    } else if (args[i] === '--legacy') legacy = true;
    else if (args[i] === '--dry-run') dryRun = true;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  const codexRoot = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  if (!path.isAbsolute(codexRoot)) throw new Error('CODEX_HOME must be an absolute directory');
  const dest = path.resolve(destination || path.join(codexRoot, 'pets', 'nicole'));
  if ([path.parse(dest).root, os.homedir(), process.cwd(), codexRoot, path.join(codexRoot, 'pets')].map(p => path.resolve(p)).includes(dest)) throw new Error('Refusing an unsafe installation directory');
  const assets = path.join(__dirname, '../assets');
  const manifest = JSON.parse(fs.readFileSync(path.join(assets, 'pet.json'), 'utf8'));
  manifest.spriteVersionNumber = legacy ? 1 : 2;
  const bytes = fs.readFileSync(path.join(assets, legacy ? 'spritesheet-v1.webp' : 'spritesheet.webp'));
  const size = dimensions(bytes), version = manifest.spriteVersionNumber;
  if (size[0] !== 1536 || size[1] !== (legacy ? 1872 : 2288)) throw new Error('Unexpected atlas geometry');
  const sha256 = digest(bytes);
  if (dryRun) return { destination: dest, version, size, sha256 };

  const backupRoot = path.join(codexRoot, 'pet-backups', 'nicole');
  fs.mkdirSync(backupRoot, { recursive: true });
  const lock = path.join(backupRoot, '.install-lock');
  try { fs.mkdirSync(lock); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Nicole installation is busy; wait for the active installer before retrying.');
    throw error;
  }
  let staging, backup = null, unchanged = false;
  try {
    let old, sameImage = false;
    if (fs.existsSync(dest)) {
      if (fs.lstatSync(dest).isSymbolicLink()) throw new Error('Refusing to update a symlinked pet directory');
      old = JSON.parse(fs.readFileSync(path.join(dest, 'pet.json'), 'utf8'));
      if (old.id !== 'nicole' && old.displayName !== '妮可') throw new Error('Destination contains a different pet; choose another --dest');
      const oldPath = old.spritesheetPath ?? 'spritesheet.webp';
      const oldFile = assetPath(dest, oldPath);
      try { sameImage = fs.readFileSync(oldFile).equals(bytes); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      // On a format change, keep the old atlas valid until the manifest switches.
      manifest.spritesheetPath = (old.spriteVersionNumber ?? 1) === version
        ? oldPath : `spritesheet-v${version}-${sha256.slice(0, 16)}.webp`;
      unchanged = sameImage && Object.entries(manifest).every(([key, value]) => old[key] === value);
    }
    if (!unchanged) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      staging = fs.mkdtempSync(path.join(path.dirname(dest), '.nicole-install-'));
      fs.writeFileSync(path.join(staging, 'atlas.webp'), bytes);
      fs.writeFileSync(path.join(staging, 'pet.json'), JSON.stringify(manifest, null, 2) + '\n');
      if (old) {
        backup = path.join(backupRoot, new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomBytes(3).toString('hex'));
        fs.cpSync(dest, backup, { recursive: true, errorOnExist: true, force: false });
        const target = assetPath(dest, manifest.spritesheetPath);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        if (!sameImage || manifest.spritesheetPath !== (old.spritesheetPath ?? 'spritesheet.webp')) {
          fs.renameSync(path.join(staging, 'atlas.webp'), target);
        }
        fs.renameSync(path.join(staging, 'pet.json'), path.join(dest, 'pet.json'));
      } else {
        fs.renameSync(path.join(staging, 'atlas.webp'), path.join(staging, 'spritesheet.webp'));
        fs.renameSync(staging, dest);
      }
    }
    let care, careError;
    try { care = require('./care.cjs').interact('init', { codexRoot }); }
    catch (error) { careError = error.message; }
    return { installed: dest, backup, unchanged, version, sha256,
      skillVersion: fs.readFileSync(path.join(__dirname, '../VERSION'), 'utf8').trim(), care, careError,
      nextStep: unchanged ? 'Pet files unchanged; no refresh needed for these files.' : 'Fully reopen Codex, refresh Settings > Pets, then select 妮可.' };
  } finally {
    if (staging && fs.existsSync(staging)) {
      for (const name of ['atlas.webp', 'spritesheet.webp', 'pet.json']) {
        const file = path.join(staging, name); if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      fs.rmdirSync(staging);
    }
    fs.rmdirSync(lock);
  }
}
module.exports = { install };
if (require.main === module) {
  try { console.log(JSON.stringify(install(), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
