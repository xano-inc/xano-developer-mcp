import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {connectClient} from './frontend/socket.js';
const config = JSON.parse(await readFile(new URL('./frontend/config.json', import.meta.url)));
const url = config.instance.replace(/^http/, 'ws') + '/ws/' + config.canonical;
const clients = [], results = [];
const delay = ms => new Promise(r => setTimeout(r,ms));
function client(channel, token) {
  const frames = [];
  const c = connectClient({url,channel,token,onFrame:f=>frames.push(f)});
  c.frames = frames; clients.push(c); return c;
}
async function wait(c, predicate, timeout = 6000) {
  const start=Date.now();
  while(Date.now()-start<timeout){const f=c.frames.find(predicate);if(f)return f;await delay(25);}
  throw new Error('Frame not received: '+JSON.stringify(c.frames));
}
async function check(name, fn) { await fn(); results.push(name); console.log('PASS '+name); }
const room = Math.floor(Date.now()/1000), channel='rooms/'+room;
try {
  const a=client(channel), b=client(channel), other=client('rooms/'+(room+1));
  await check('three independent sockets join two resolved channels', async()=>{await Promise.all(clients.map(c=>c.ready));});
  await check('channel handler broadcasts its response to both clients, not another room',async()=>{
    a.broadcast('send',{author:'Alice',body:'live broadcast'});
    for(const c of [a,b]) {const f=await wait(c,f=>f.action==='message'&&f.type==='send');assert.equal(f.payload.body,'live broadcast');assert.equal(typeof f.payload.sent_at,'number');}
    await delay(300);assert(!other.frames.some(f=>f.action==='message'));
  });
  await check('sender-only echo returns the actual session', async()=>{
    a.broadcast('echo',{body:'private echo'});
    const f=await wait(a,f=>f.action==='message'&&f.type==='echo');
    assert.equal(f.payload.session.channel,channel);assert.equal(f.payload.session.authenticated,false);
    assert.equal(f.payload.session.params.room_id,String(room));
    await delay(300);assert(!b.frames.some(f=>f.action==='message'&&f.type==='echo'));
  });
  await check('server publish API delivers an announcement to both sockets', async()=>{
    const r=await fetch(`${config.instance}/api:${config.apiCanonical}/publish`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({room_id:room,body:'server announcement'})});
    assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true});
    for(const c of [a,b]) assert.equal((await wait(c,f=>f.action==='message'&&f.type==='announcement')).payload.body,'server announcement');
  });
  await check('post middleware executes and receives the status/result envelope',async()=>{
    const r=await fetch(`${config.instance}/api:${config.apiCanonical}/check`);
    assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true,middleware_phase:'post',observed:{status:'ok',result:{ok:true}}});
  });
  await check('replace middleware wraps only the successful result', async()=>{
    const r=await fetch(`${config.instance}/api:${config.apiCanonical}/wrap`);
    assert.equal(r.status,200);assert.deepEqual(await r.json(),{success:true,payload:{ok:true}});
  });
  await check('others delivery excludes the sender',async()=>{
    a.broadcast('others',{body:'others only'});
    assert.equal((await wait(b,f=>f.action==='message'&&f.type==='others')).payload.body,'others only');
    await delay(300);assert(!a.frames.some(f=>f.action==='message'&&f.type==='others'));
  });
  await check('typed message input accepts an integer and rejects invalid input',async()=>{
    a.broadcast('strict',{count:7});
    assert.equal((await wait(a,f=>f.action==='message'&&f.type==='strict')).payload.count,7);
    const offset=a.frames.length;
    a.broadcast('strict',{count:'not-an-integer'});
    await wait(a,f=>a.frames.indexOf(f)>=offset&&f.action==='error');
    await delay(300);assert(!a.frames.slice(offset).some(f=>f.action==='message'&&f.type==='strict'));
  });
  await check('join trigger rejects an anonymous session',async()=>{
    const gated=client('members');await assert.rejects(gated.ready,/Sign in to join members/);
  });
  await check('per-message auth rejects anonymous invocation',async()=>{
    const offset=a.frames.length;a.broadcast('protected_echo',{body:'not authorized'});
    await wait(a,f=>a.frames.indexOf(f)>=offset&&f.action==='error');
    await delay(300);assert(!a.frames.slice(offset).some(f=>f.action==='message'&&f.type==='protected_echo'));
  });
  if (process.env.XANO_TEST_USER_TOKEN) {
    await check('JWT subprotocol authenticates; join gate and protected message succeed',async()=>{
      const member=client('members',process.env.XANO_TEST_USER_TOKEN);
      const auth=client(channel,process.env.XANO_TEST_USER_TOKEN);
      await Promise.all([member.ready,auth.ready]);auth.broadcast('protected_echo',{body:'authenticated'});
      const f=await wait(auth,f=>f.action==='message'&&f.type==='protected_echo');
      assert.equal(f.payload.authenticated,true);assert.equal(f.payload.body,'authenticated');
    });
  } else { console.log('SKIP authenticated positive case: set XANO_TEST_USER_TOKEN to a user JWT'); }
  await check('unknown channel is rejected rather than marked joined',async()=>{
    const bad=client('missing-'+room);await assert.rejects(bad.ready);assert.equal(bad.joined,false);
  });
  console.log(JSON.stringify({passed:results.length,checks:results},null,2));
} finally {clients.forEach(c=>c.close());}
