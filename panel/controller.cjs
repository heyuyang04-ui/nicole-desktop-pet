'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { interact } = require('../skills/nicole-pet/scripts/care.cjs');

class CarePanel {
  constructor(codexRoot) {
    this.root = codexRoot;
    this.file = path.join(codexRoot, 'pet-state/nicole/panel.json');
    this.preferences = { compact: false, pinned: true, notifications: false, lowNotice: false };
    try {
      const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      for (const key of Object.keys(this.preferences)) {
        if (typeof saved[key] !== 'boolean') throw new Error('Invalid panel preferences; original file preserved.');
      }
      this.preferences = { ...this.preferences, ...saved };
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const temporary = `${this.file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    try {
      fs.writeFileSync(temporary, JSON.stringify(this.preferences, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
      fs.renameSync(temporary, this.file);
    } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  update(action = 'status', now = Date.now()) {
    const result = interact(action, { codexRoot: this.root, now });
    const low = result.fullness <= 30;
    const announce = low && !this.preferences.lowNotice;
    if (this.preferences.lowNotice !== low) {
      this.preferences.lowNotice = low;
      this.save();
    }
    return { ...result, displaySurface: 'Nicole companion panel', low, announce,
      preferences: this.preferences, measuredAt: now };
  }
  setPreference(key, value) {
    if (!['compact', 'pinned', 'notifications'].includes(key) || typeof value !== 'boolean') throw new Error('Invalid panel preference');
    if (key === 'notifications' && value && !this.preferences.notifications) this.preferences.lowNotice = false;
    this.preferences[key] = value; this.save();
  }
  setPosition(x, y) {
    if (!Number.isInteger(x) || !Number.isInteger(y)) return;
    this.preferences.position = { x, y }; this.save();
  }
}

function fitPosition(position, workArea, width, height) {
  const x = Number.isInteger(position?.x) ? position.x : workArea.x + workArea.width - width - 24;
  const y = Number.isInteger(position?.y) ? position.y : workArea.y + workArea.height - height - 36;
  return { x: Math.max(workArea.x, Math.min(x, workArea.x + workArea.width - width)),
    y: Math.max(workArea.y, Math.min(y, workArea.y + workArea.height - height)) };
}
module.exports = { CarePanel, fitPosition };
