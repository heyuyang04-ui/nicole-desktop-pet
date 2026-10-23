const {test} = require('node:test');
const assert = require('node:assert/strict');
const {DECAY_MS, initialPet, advancePet, feedPet, validateProfile, complete} = require('../app/core.cjs');
test('first load, clock boundaries, offline decay and zero floor',()=>{
  const s=initialPet(1000);assert.equal(s.hunger,100);
  assert.equal(advancePet(s,1000+DECAY_MS-1).hunger,100);
  assert.equal(advancePet(s,1000+DECAY_MS).hunger,99);
  assert.equal(advancePet(s,1000+101*DECAY_MS).hunger,0);
});
test('feeding caps at 100 and preserves partial decay interval',()=>{
  const s={hunger:40,updatedAt:1000};const fed=feedPet(s,1000+2.5*DECAY_MS);
  assert.equal(fed.hunger,68);assert.equal(fed.updatedAt,1000+2*DECAY_MS);
  assert.equal(advancePet(fed,1000+3*DECAY_MS).hunger,67);
  assert.equal(feedPet(initialPet(1000),1000).hunger,100);
});
test('clock rollback cannot grant hunger and corrupt input resets safely',()=>{
  assert.deepEqual(advancePet({hunger:30,updatedAt:2000},1000),{hunger:30,updatedAt:1000});
  assert.equal(advancePet({hunger:NaN},1000).hunger,100);
});
test('credential endpoint requires HTTPS or a loopback host',()=>{
  assert.throws(()=>validateProfile({base:'http://example.com',model:'x'}));
  assert.throws(()=>validateProfile({base:'https://key:pass@example.com',model:'x'}));
  assert.equal(validateProfile({base:'http://localhost:11434/v1/',model:'x'}).base,'http://localhost:11434/v1');
});
test('text and vision requests carry image data with bounded responses',async()=>{
  let captured;
  const mock=async(url,options)=>{captured={url,options};return {ok:true,json:async()=>({choices:[{message:{content:'你好'}}]})};};
  const p={base:'https://api.example.com/v1',model:'vision'};
  const msg=[{role:'user',content:[{type:'image_url',image_url:{url:'data:image/png;base64,TEST'}}]}];
  assert.equal(await complete(p,'test-key',msg,mock),'你好');
  assert.equal(captured.url,'https://api.example.com/v1/chat/completions');
  assert.deepEqual(JSON.parse(captured.options.body).messages,msg);
  assert.equal(captured.options.redirect,'error');
  await assert.rejects(complete(p,'secret',[],async()=>({ok:false,status:401})),/HTTP 401/);
});
