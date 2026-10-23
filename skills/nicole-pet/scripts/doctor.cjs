#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { readPackage, digest } = require('./native.cjs');

function inspect(codexRoot = process.env.CODEX_HOME || path.join(os.homedir(), '.codex')) {
  const directory = path.join(codexRoot, 'pets', 'nicole');
  const report = { directory, checks: [], limitations: 'File checks cannot confirm Codex window visibility or a switching fix.' };
  try {
    const pet = readPackage(directory);
    const bundled = path.join(__dirname, '../assets', pet.version === 2 ? 'spritesheet.webp' : 'spritesheet-v1.webp');
    Object.assign(report, { validPackage: true, version: pet.version, size: pet.size, sha256: pet.sha256,
      matchesBundledArt: digest(fs.readFileSync(bundled)) === pet.sha256,
      checks: ['manifest readable', 'sprite path contained in pet directory', 'WebP length/header valid', 'dimensions match sprite version'] });
  } catch (error) { report.validPackage = false; report.error = error.message; }
  try {
    const global = JSON.parse(fs.readFileSync(path.join(codexRoot, '.codex-global-state.json'), 'utf8'));
    if (typeof global['electron-avatar-overlay-open'] === 'boolean') report.savedOverlayOpen = global['electron-avatar-overlay-open'];
  } catch { /* Optional read-only hint; never edit application preferences. */ }
  report.nextSteps = report.validPackage
    ? ['Settings > Pets > Refresh; select 妮可.', 'Use the configured Show pet shortcut (default macOS Option+Space).', 'If the whole overlay still disappears, fully reopen the app and record client version and reproduction steps. Do not regenerate or downgrade a valid atlas as a presumed fix.']
    : ['Inspect the reported path/error, then restore the pet using the installer after backing up your custom files.'];
  return report;
}
module.exports = { inspect };
if (require.main === module) {
  const result = inspect(); console.log(JSON.stringify(result, null, 2));
  if (!result.validPackage) process.exitCode = 1;
}
