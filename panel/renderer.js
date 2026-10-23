'use strict';
const $ = id => document.getElementById(id);
let status, eatingUntil = 0, busy = false, messageUntil = 0;
const normalArt = '../assets/pet/idle.png';
const hungryArt = '../assets/panel/hungry.png';
const eatingArt = '../skills/nicole-pet/assets/eating.gif';
function message(text, error = false) {
  $('message').textContent = text;
  document.body.classList.toggle('error', error);
  messageUntil = Date.now() + (error ? 30000 : 6000);
}
function render(result) {
  status = result;
  document.body.classList.toggle('compact', result.preferences.compact);
  document.body.classList.toggle('low', result.low);
  document.body.dataset.fullness = String(result.fullness);
  $('compact-value').hidden = !result.preferences.compact;
  $('compact-value').textContent = `${result.fullness}%`;
  $('collapse').textContent = result.preferences.compact ? '+' : '−';
  $('fullness').replaceChildren(document.createTextNode(String(result.fullness)), Object.assign(document.createElement('small'), { textContent: '%' }));
  $('meter').value = result.fullness;
  $('pin').checked = result.preferences.pinned;
  $('notify').checked = result.preferences.notifications;
  $('mood').textContent = result.low ? '肚子咕咕叫' : result.fullness >= 80 ? '元气满满' : '还想来一口';
  $('greeting').textContent = result.low ? '可以给我一点吃的吗？' : '今天也要好好吃饭';
  $('quote').textContent = result.low ? '喵…小肚子在叫你啦。' : result.fullness >= 80 ? '吃饱饱，继续陪着你～' : '忙碌的时候，也别忘了自己。';
  if (result.action === 'feed') {
    if (result.added > 0) {
      eatingUntil = Date.now() + 4200;
      $('portrait').src = eatingArt;
      message(`好吃！${result.beforeFullness}% → ${result.fullness}%`);
    } else message('已经吃饱啦，先陪你待一会儿～');
  }
  tick();
}
function tick() {
  if (!status) return;
  const eating = Date.now() < eatingUntil;
  document.body.classList.toggle('eating', eating);
  $('feed').disabled = busy || eating || status.fullness === 100;
  if (!eating) {
    const art = status.low ? hungryArt : normalArt;
    if ($('portrait').getAttribute('src') !== art) $('portrait').src = art;
  }
  const seconds = status.nextDropInSeconds === null ? null : Math.max(0, status.nextDropInSeconds - Math.floor((Date.now() - status.measuredAt) / 1000));
  $('countdown').textContent = seconds === null ? '已经饿扁啦，等你投喂 · 每次 +30%' : seconds === 0 ? '正在按时钟结算饱腹度…' : `下次消耗 ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} · 每 5 分钟 −1%`;
  if (Date.now() > messageUntil) {
    $('message').textContent = status.low ? '妮可：给我一点好吃的吧～' : '拖动顶部，把小面板放到妮可旁边';
    document.body.classList.remove('error');
  }
}
async function command(name, value) {
  try {
    const result = await window.nicole.command(name, value);
    if (!result.ok) message(result.error, true);
    return result;
  } catch { message('面板连接暂时不可用，请重新打开面板。', true); return { ok: false }; }
}
$('feed').onclick = async () => { if (busy) return; busy = true; $('feed').disabled = true; await command('feed'); busy = false; tick(); };
$('chat').onclick = async () => { if ((await command('chat')).ok) message('已复制陪聊指令，粘贴到 Codex 即可'); };
$('collapse').onclick = () => status && command('compact', !status.preferences.compact);
$('handle').ondblclick = event => { if (event.target.closest('button')) return; if (status) command('compact', !status.preferences.compact); };
$('close').onclick = () => command('close');
$('pin').onchange = () => command('pinned', $('pin').checked);
$('notify').onchange = () => command('notifications', $('notify').checked);
window.nicole.onStatus(render);
window.nicole.onError(error => message(error, true));
command('status');
setInterval(tick, 1000);
