import {connectClient} from './socket.js';
const $ = id => document.getElementById(id);
const config = await fetch('./config.json').then(r => { if (!r.ok) throw new Error('Could not load configuration'); return r.json(); });
const names = ['Alice', 'Bob'];
let clients = [], count = 0, generation = 0;
const wsUrl = config.instance.replace(/^http/, 'ws') + '/ws/' + encodeURIComponent(config.canonical);
$('destination').textContent = wsUrl;
function notice(text, error = false) { $('notice').textContent = text; $('notice').classList.toggle('error', error); }
function log(label, data) {
  const row = document.createElement('div'); row.className = 'event';
  const time = document.createElement('time'); time.textContent = new Date().toLocaleTimeString();
  const body = document.createElement('span'); body.textContent = `${label}  ${typeof data === 'string' ? data : JSON.stringify(data)}`;
  row.append(time, body); const box = $('events'); box.querySelector('.muted')?.remove(); box.append(row);
  if (box.children.length > 200) box.firstElementChild.remove(); box.scrollTop = box.scrollHeight;
}
function renderMessage(index, frame) {
  const box = $(`messages-${index}`); box.querySelector('.empty')?.remove();
  const item = document.createElement('div');
  const author = frame.payload?.author || (frame.type === 'announcement' ? 'Xano backend' : 'Private echo');
  item.className = 'bubble' + (author === names[index] ? ' self' : '') + (frame.type === 'announcement' ? ' server' : '');
  const meta = document.createElement('small'); meta.textContent = `${author} · ${frame.type}`;
  const body = document.createElement('p'); body.textContent = String(frame.payload?.body ?? JSON.stringify(frame.payload));
  item.append(meta, body); box.append(item);
  if (box.children.length > 100) box.firstElementChild.remove(); box.scrollTop = box.scrollHeight;
}
function controls() {
  clients.forEach((c,i) => { $(`send-${i}`).disabled = !c.joined; $(`echo-${i}`).disabled = !c.joined; });
  const connected = clients.length === 2 && clients.every(c => c.joined);
  $('publish').disabled = !connected;
  $('overall').textContent = connected ? 'Both clients connected' : 'Disconnected';
  $('overall').classList.toggle('connected', connected);
}
function disconnect() {
  generation++;
  clients.forEach(c => c.close()); clients = [];
  for (let i=0;i<2;i++) { $(`send-${i}`).disabled = true; $(`echo-${i}`).disabled = true; $(`status-${i}`).textContent = 'Offline'; $(`status-${i}`).classList.remove('online'); }
  $('room').disabled = false; $('connect').disabled = false; $('disconnect').disabled = true; controls();
}
$('connect').onclick = async () => {
  if (!$('room').reportValidity()) return;
  disconnect(); const run = generation; const channel = 'rooms/' + $('room').value;
  $('connect').disabled = true; $('room').disabled = true; $('disconnect').disabled = false;
  notice(`Connecting two clients to ${channel}…`);
  names.forEach((_, index) => {
    const empty = document.createElement('div'); empty.className = 'empty';
    empty.textContent = `Waiting for messages in ${channel}.`;
    $(`messages-${index}`).replaceChildren(empty);
  });
  clients = names.map((name, index) => connectClient({url: wsUrl, channel,
    onState(state) {
      if (run !== generation) return;
      $(`status-${index}`).textContent = state; $(`status-${index}`).classList.toggle('online', state === 'Joined');
      log(name, state); controls();
      if (state === 'Offline') { notice('A connection closed. Disconnect and reconnect to rejoin.', true); }
    },
    onFrame(frame) {
      if (run !== generation) return;
      count++; $('frame-count').textContent = `${count} frames`; log(name + ' ←', frame);
      if (frame.action === 'message') renderMessage(index, frame);
      if (frame.action === 'error' && frame.payload?.message !== 'Connection is not ready') notice(frame.payload?.message || 'Server rejected the request', true);
    }
  }));
  try { await Promise.all(clients.map(c=>c.ready)); if(run===generation){ controls(); notice(`Both clients joined ${channel}. Send a message to see live delivery.`); } }
  catch(e) { if(run===generation){ disconnect(); notice(e.message, true); } }
};
$('disconnect').onclick = () => { disconnect(); notice('Disconnected. Reconnect to join the room again.'); };
names.forEach((name,index) => {
  $(`form-${index}`).onsubmit = event => {
    event.preventDefault(); const input = $(`input-${index}`);
    try { clients[index].broadcast('send',{author:name,body:input.value}); log(name + ' →', 'send'); input.value=''; }
    catch(e) { notice(e.message,true); }
  };
  $(`echo-${index}`).onclick = () => {
    try { clients[index].broadcast('echo',{body:`Only ${name} should receive this echo.`}); log(name+' →','echo'); }
    catch(e) { notice(e.message,true); }
  };
});
$('publish-form').onsubmit = async event => {
  event.preventDefault(); $('publish').disabled = true;
  try {
    const response = await fetch(`${config.instance}/api:${config.apiCanonical}/publish`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({room_id:Number($('room').value),body:$('announcement').value})});
    const body = await response.json(); if(!response.ok) throw new Error(JSON.stringify(body));
    log('REST publish',body); notice('Publish API returned successfully. Confirm delivery in both client panels.');
  } catch(e){notice(e.message,true);} finally {controls();}
};
$('check').onclick = async () => {
  $('check').disabled = true;
  try {
    const response = await fetch(`${config.instance}/api:${config.apiCanonical}/check`); const result = await response.json();
    if(!response.ok) throw new Error(JSON.stringify(result));
    $('check-result').textContent = JSON.stringify(result,null,2); log('Post middleware',result);
  } catch(e) { $('check-result').textContent = e.message; } finally { $('check').disabled = false; }
};
$('clear').onclick=()=>{$('events').replaceChildren();count=0;$('frame-count').textContent='0 frames';};
window.addEventListener('pagehide',disconnect);
