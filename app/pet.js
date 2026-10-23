'use strict';
const canvas = document.querySelector('#sprite'), ctx = canvas.getContext('2d');
const button = document.querySelector('#pet'), bubble = document.querySelector('#bubble');
const idle = new Image(), atlas = new Image(), eating = new Image();
idle.src = '../assets/pet/idle.png'; atlas.src = '../assets/pet/spritesheet.webp'; eating.src = '../assets/pet/eating.webp';
let cursor = {x:150,y:180}, gaze = {x:0,y:0}, animation = null, bubbleTimer, clickTimer, lastClick=0;
const rows = { waving:[3,4,170], jumping:[4,5,170], running:[7,6,180] };
function say(text) { bubble.textContent = text; bubble.hidden = false; clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.hidden = true, 9000); }
function animate(name, duration = 2200) { animation = {name, start:performance.now(), duration}; }
function eye(x, y, dx, dy, blink) {
  ctx.save();ctx.beginPath();ctx.ellipse(x,y,5.2,4.1,-.1,0,Math.PI*2);ctx.clip();
  ctx.fillStyle = '#fff5f4'; ctx.fillRect(x-7,y-6,14,12);
  if (blink) { ctx.fillStyle='#f9d8d8';ctx.fillRect(x-7,y-6,14,12);ctx.strokeStyle='#925668';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-5,y);ctx.quadraticCurveTo(x,y+2,x+5,y);ctx.stroke(); }
  else ctx.drawImage(idle,x-4.2,y-4.5,8.4,9,x-4.2+dx,y-4.5+dy,8.4,9);
  ctx.restore();
}
function render(t) {
  ctx.clearRect(0,0,384,416);ctx.save();ctx.scale(2,2);
  if (animation && t-animation.start >= animation.duration) animation = null;
  if (animation && animation.name === 'eating' && eating.complete && eating.naturalWidth) {
    const frame=Math.floor((t-animation.start)/260)%6;ctx.drawImage(eating,frame*192,0,192,208,0,0,192,208);
  } else if (animation && rows[animation.name] && atlas.complete && atlas.naturalWidth) {
    const [row,count,delay]=rows[animation.name],frame=Math.floor((t-animation.start)/delay)%count;
    ctx.drawImage(atlas,frame*192,row*208,192,208,0,0,192,208);
  } else if (idle.complete && idle.naturalWidth) {
    const bob=Math.sin(t/650)*.6;ctx.translate(0,bob);ctx.drawImage(idle,0,0);
    const rect=canvas.getBoundingClientRect();
    const gx=Math.max(-1.7,Math.min(1.7,(cursor.x-rect.x-rect.width/2)/90)),gy=Math.max(-1.2,Math.min(1.2,(cursor.y-rect.y-85)/110));
    gaze.x+=(gx-gaze.x)*.12;gaze.y+=(gy-gaze.y)*.12;
    const blink=t%5200>5030;eye(83,68.5,gaze.x,gaze.y,blink);eye(107.6,66.4,gaze.x,gaze.y,blink);
  }
  ctx.restore();requestAnimationFrame(render);
}
window.nicole.onCursor(p=>{
  cursor=p;
  const rect=canvas.getBoundingClientRect(),x=Math.floor((p.x-rect.x)*384/rect.width),y=Math.floor((p.y-rect.y)*416/rect.height);
  const card=document.querySelector('#card'),cardRect=card.getBoundingClientRect();
  const inCard=!card.hidden&&p.x>=cardRect.left&&p.x<=cardRect.right&&p.y>=cardRect.top&&p.y<=cardRect.bottom;
  const hit=inCard||(x>=0&&x<384&&y>=0&&y<416&&ctx.getImageData(x,y,1,1).data[3]>20);
  window.nicole.setHit(hit);
});
window.nicole.onEvent(event=>{
  if(event.action==='feed'){animate('eating',4680);say(event.text);}
  if(event.action==='animate'){animate(event.name);if(event.text)say(event.text);}
  if(event.action==='busy'){if(event.busy)animate('running',65000);else animation=null;}
  if(event.action==='reply'){
    say(event.text);
    if(event.voice){speechSynthesis.cancel();const line=new SpeechSynthesisUtterance(event.text);line.lang='zh-CN';line.rate=1;const local=speechSynthesis.getVoices().find(v=>v.localService&&v.lang.startsWith('zh'));if(local){line.voice=local;speechSynthesis.speak(line);}else say(event.text+'（未找到本地中文语音）');}
  }
});
button.addEventListener('pointerdown',e=>{if(e.button!==0)return;button.setPointerCapture(e.pointerId);window.nicole.call('drag-start').catch(e=>say(e.message));});
button.addEventListener('pointerup',e=>{if(e.button!==0)return;const stamp=performance.now();window.nicole.call('drag-end').then(({moved})=>{clearTimeout(clickTimer);if(moved){lastClick=0;return;}if(lastClick&&stamp-lastClick<400){lastClick=0;window.nicole.call('panel','status').catch(e=>say(e.message));}else{lastClick=stamp;clickTimer=setTimeout(()=>{lastClick=0;window.nicole.call('panel','chat').catch(e=>say(e.message));},400);}}).catch(e=>say(e.message));});
button.addEventListener('pointercancel',()=>window.nicole.call('drag-cancel').catch(()=>{}));
button.addEventListener('contextmenu',e=>{e.preventDefault();window.nicole.call('menu').catch(e=>say(e.message));});
button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')window.nicole.call('panel','chat');});
requestAnimationFrame(render);
