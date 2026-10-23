'use strict';
const $=s=>document.querySelector(s);let state, timer, working=false;
function notice(text){$('#notice').textContent=text;$('#notice').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('#notice').hidden=true,7000);}
async function call(name,...args){try{return await window.nicole.call(name,...args);}catch(e){notice(e.message);throw e;}}
function hunger(p){$('#hunger').textContent=`饱腹度 ${p.hunger}%${p.hunger<=20?' · 肚子有点饿了':''}`;$('#hunger-bar').value=p.hunger;$('#hunger-number').textContent=`${p.hunger}%`;$('#hunger-description').textContent=p.hunger>70?'吃饱啦，今天也元气满满！':p.hunger>20?'还能陪你一会儿，要不要来点零食？':'肚子咕咕叫啦，想吃一小口～';}
function history(items){const log=$('#messages');if(!items.length)return;log.replaceChildren();for(const m of items){const div=document.createElement('div');div.className=`message ${m.role}`;div.textContent=m.content;log.append(div);}log.scrollTop=log.scrollHeight;}
function setBusy(b){working=b;$('#thinking').hidden=!b;$('#send').disabled=b;$('#analyze').disabled=b||!$('#screenshot').getAttribute('src');}
async function tab(name){$('#card').hidden=false;for(const p of document.querySelectorAll('.page'))p.hidden=p.id!==name;for(const b of document.querySelectorAll('nav button'))b.classList.toggle('active',b.dataset.tab===name);if(name==='screen'){const displays=await call('displays');$('#displays').replaceChildren(...displays.map(d=>new Option(d.name+(d.primary?'（主屏）':''),d.id)));}if(name==='chat')$('#message').focus();}
function settings(s){state=s;hunger(s.pet);history(s.history);setBusy(s.busy);for(const kind of ['chat','vision']){const p=s.profiles[kind];$(`#${kind}-base`).value=p.base;$(`#${kind}-model`).value=p.model;$(`#${kind}-key`).value='';$(`#${kind}-key`).placeholder=p.hasKey?'已保存；留空保持不变':'未保存';$(`#${kind}-clear`).checked=false;}$('#voice').checked=s.voice;$('#destination').textContent=s.profiles.vision.model?`发送至 ${s.profiles.vision.base} · ${s.profiles.vision.model}`:'请先在设置中配置支持图片输入的视觉模型。';}
function discard(){const img=$('#screenshot');img.removeAttribute('src');img.hidden=true;$('#analyze').disabled=true;window.nicole.call('discard-screen').catch(()=>{});}
for(const b of document.querySelectorAll('nav button'))b.addEventListener('click',()=>call('panel',b.dataset.tab).catch(()=>{}));
$('#close-card').onclick=()=>call('hide-panel').catch(()=>{});
document.addEventListener('keydown',e=>{if(e.key==='Escape')call('hide-panel').catch(()=>{});});
$('#feed').onclick=()=>call('feed').then(s=>hunger(s.pet)).catch(()=>{});
$('#chat-form').onsubmit=async e=>{e.preventDefault();const text=$('#message').value.trim();if(!text||working)return;setBusy(true);$('#message').value='';const pending=document.createElement('div');pending.className='message user';pending.textContent=text;$('#messages .welcome')?.remove();$('#messages').append(pending);pending.scrollIntoView();try{await call('chat',text);}catch{$('#message').value=text;pending.remove();}finally{setBusy(false);}};
$('#message').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('#chat-form').requestSubmit();}});
$('#clear').onclick=()=>call('clear-chat').then(()=>$('#messages').replaceChildren()).catch(()=>{});
$('#settings-form').onsubmit=async e=>{e.preventDefault();const data={voice:$('#voice').checked};for(const kind of ['chat','vision'])data[kind]={base:$(`#${kind}-base`).value,model:$(`#${kind}-model`).value,key:$(`#${kind}-key`).value,clearKey:$(`#${kind}-clear`).checked};try{const s=await call('settings',data);settings(s);notice(s.memoryOnly?'设置已保存；系统加密不可用，Key 仅保留到退出应用。':'设置已保存，可以开始聊天啦。');}catch{}};
$('#capture').onclick=async()=>{discard();$('#capture').disabled=true;try{const data=await call('capture',$('#displays').value);$('#screenshot').src=data;$('#screenshot').hidden=false;$('#analyze').disabled=working;}catch{}finally{$('#capture').disabled=false;}};
$('#discard').onclick=discard;
$('#analyze').onclick=async()=>{setBusy(true);try{await call('analyze-screen');await tab('chat');}catch{}finally{discard();setBusy(false);}};
window.nicole.onEvent(e=>{if(e.action==='tab'){tab(e.tab).catch(()=>{});call('state').then(s=>hunger(s.pet)).catch(()=>{});}if(e.action==='close-card'){$('#card').hidden=true;discard();}if(e.action==='state'||e.action==='feed')hunger(e.pet);if(e.action==='busy')setBusy(e.busy);if(e.action==='reply')history(e.history);if(e.action==='history')$('#messages').replaceChildren();if(e.action==='discard-screen')discard();});
call('state').then(settings).catch(()=>{});
