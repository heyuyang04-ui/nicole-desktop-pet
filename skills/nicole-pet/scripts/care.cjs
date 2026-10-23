#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const INTERVAL_MS = 5 * 60 * 1000;
const VERSION = fs.readFileSync(path.join(__dirname, '../VERSION'), 'utf8').trim();
function initialState(now) {
  return { schemaVersion: 1, fullness: 100, lastDecayAt: now };
}
function validateState(state) {
  if (!state || state.schemaVersion !== 1 || !Number.isInteger(state.fullness) ||
      state.fullness < 0 || state.fullness > 100 ||
      !Number.isSafeInteger(state.lastDecayAt) || state.lastDecayAt < 0) {
    throw new Error('Invalid Nicole state; the existing file was preserved. Inspect it before attempting recovery.');
  }
}
function advance(state, now) {
  validateState(state);
  if (!Number.isSafeInteger(now) || now < 0) throw new Error('Invalid system time');
  // A clock rollback must not grant food or postpone decay until the old future date.
  if (now < state.lastDecayAt) return { ...state, lastDecayAt: now };
  const ticks = Math.floor((now - state.lastDecayAt) / INTERVAL_MS);
  return { ...state, fullness: Math.max(0, state.fullness - ticks), lastDecayAt: state.lastDecayAt + ticks * INTERVAL_MS };
}
function defaultRoot() {
  return process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
}
function interact(action, { codexRoot = defaultRoot(), now = Date.now() } = {}) {
  if (!['init', 'status', 'feed'].includes(action)) throw new Error('Usage: node care.cjs <init|status|feed>');
  if (!path.isAbsolute(codexRoot)) throw new Error('CODEX_HOME must be an absolute directory');
  const directory = path.join(codexRoot, 'pet-state', 'nicole');
  const stateFile = path.join(directory, 'state.json');
  const lock = path.join(directory, '.lock');
  fs.mkdirSync(directory, { recursive: true });
  try {
    fs.mkdirSync(lock);
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('Nicole state is busy. Retry after the other command finishes; if a previous process crashed, inspect the stale .lock directory first.');
    throw error;
  }
  const temporary = path.join(directory, `.state-${process.pid}-${crypto.randomBytes(6).toString('hex')}.tmp`);
  try {
    let state;
    let created = false;
    try {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error('Cannot read Nicole state; the existing file was preserved. Inspect it before attempting recovery.');
      state = initialState(now);
      created = true;
    }
    state = advance(state, now);
    const beforeFullness = state.fullness;
    if (action === 'feed') state.fullness = Math.min(100, state.fullness + 30);
    fs.writeFileSync(temporary, JSON.stringify(state, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, stateFile);
    const cells = Math.round(state.fullness / 10);
    return {
      skillVersion: VERSION, action, created, stateFile,
      fullness: state.fullness, beforeFullness, added: state.fullness - beforeFullness,
      progress: '█'.repeat(cells) + '░'.repeat(10 - cells),
      nextDropInSeconds: state.fullness === 0 ? null : Math.ceil((state.lastDecayAt + INTERVAL_MS - now) / 1000),
      displaySurface: 'Codex conversation',
    };
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    fs.rmdirSync(lock);
  }
}
module.exports = { INTERVAL_MS, advance, initialState, interact };
if (require.main === module) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node care.cjs <init|status|feed>');
    console.log(JSON.stringify(interact(process.argv[2]), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
