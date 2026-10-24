'use strict';
const DECAY_MS = 5 * 60 * 1000;
function initialPet(now = Date.now()) { return { hunger: 100, updatedAt: now }; }
function advancePet(state, now = Date.now()) {
  if (!state || !Number.isFinite(state.hunger) || !Number.isFinite(state.updatedAt)) return initialPet(now);
  // Clock rollback grants no food; rebase the clock so decay can resume normally.
  const anchor = Math.min(state.updatedAt, now);
  const ticks = Math.floor((now - anchor) / DECAY_MS);
  return { hunger: Math.max(0, Math.min(100, Math.floor(state.hunger)) - ticks), updatedAt: anchor + ticks * DECAY_MS };
}
function feedPet(state, now = Date.now()) {
  const next = advancePet(state, now);
  return { ...next, hunger: Math.min(100, next.hunger + 30) };
}
function validateProfile(value) {
  if (!value || typeof value !== 'object') throw Error('模型设置无效');
  const base = new URL(String(value.base || ''));
  if (base.username || base.password || base.search || base.hash || (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(base.hostname)))) throw Error('API 地址须使用 HTTPS（本地模型可用 HTTP），不能包含密码或查询参数');
  const model = String(value.model || '').trim();
  if (!model || model.length > 160) throw Error('请填写有效模型 ID');
  return { base: base.href.replace(/\/$/, ''), model };
}
function chatURL(profile) { return profile.base.replace(/\/$/, '') + '/chat/completions'; }
async function complete(profile, key, messages, fetcher = fetch) {
  let response;
  try {
    response = await fetcher(chatURL(profile), { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(60000), headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ model: profile.model, messages, stream: false, max_tokens: 600 }) });
  } catch { throw Error('连接失败或超时，请检查网络和 API 地址。'); }
  if (!response.ok) throw Error(`模型请求失败（HTTP ${response.status}），请检查 Key、模型权限和额度。`);
  let data;
  try { data = await response.json(); } catch { throw Error('模型返回了无法读取的内容，请检查 API 地址是否正确。'); }
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw Error('模型没有返回文字，请确认使用兼容聊天接口的模型。');
  return text.slice(0, 8000);
}
module.exports = { DECAY_MS, initialPet, advancePet, feedPet, validateProfile, chatURL, complete };
