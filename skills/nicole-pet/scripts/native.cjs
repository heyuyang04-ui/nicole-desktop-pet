'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function dimensions(bytes) {
  if (bytes.length < 20 || bytes.toString('ascii', 0, 4) !== 'RIFF' ||
      bytes.toString('ascii', 8, 12) !== 'WEBP' || bytes.readUInt32LE(4) + 8 !== bytes.length) {
    throw new Error('Invalid or incomplete WebP');
  }
  for (let i = 12; i + 8 <= bytes.length;) {
    const kind = bytes.toString('ascii', i, i + 4), size = bytes.readUInt32LE(i + 4), p = i + 8;
    if (p + size > bytes.length) throw new Error('Truncated WebP');
    if (kind === 'VP8X' && size >= 10) return [bytes.readUIntLE(p + 4, 3) + 1, bytes.readUIntLE(p + 7, 3) + 1];
    if (kind === 'VP8L' && size >= 5 && bytes[p] === 47) {
      const bits = bytes.readUInt32LE(p + 1);
      return [(bits & 16383) + 1, ((bits >>> 14) & 16383) + 1];
    }
    i = p + size + size % 2;
  }
  throw new Error('Unsupported WebP header');
}
function digest(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function assetPath(directory, name) {
  if (typeof name !== 'string' || !name || name.includes('\\') || path.isAbsolute(name)) throw new Error('Invalid sprite path');
  const file = path.resolve(directory, name);
  if (!file.startsWith(path.resolve(directory) + path.sep)) throw new Error('Sprite path escapes pet directory');
  return file;
}
function readPackage(directory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'pet.json'), 'utf8'));
  if (manifest.id !== 'nicole' && manifest.displayName !== '妮可') throw new Error('Destination contains a different pet');
  const version = manifest.spriteVersionNumber ?? 1;
  if (![1, 2].includes(version)) throw new Error('Unsupported sprite version');
  const spritePath = assetPath(directory, manifest.spritesheetPath ?? 'spritesheet.webp');
  const bytes = fs.readFileSync(spritePath);
  const size = dimensions(bytes);
  if (size[0] !== 1536 || size[1] !== (version === 1 ? 1872 : 2288)) throw new Error('Atlas geometry does not match sprite version');
  return { manifest, version, spritePath, bytes, size, sha256: digest(bytes) };
}
module.exports = { dimensions, digest, assetPath, readPackage };
