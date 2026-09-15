// Native Realtime V2 protocol. Shared by the demo and the live verification.
export function connectClient({url, channel, token, onFrame = () => {}, onState = () => {}}) {
  const socket = token ? new WebSocket(url, [token]) : new WebSocket(url);
  let joined = false, attempts = 0, retry, heartbeat, deadline;
  let resolveReady, rejectReady;
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  const send = frame => {
    if (socket.readyState !== WebSocket.OPEN) throw new Error('Socket is not open');
    socket.send(JSON.stringify(frame));
  };
  const clear = () => { clearTimeout(retry); clearTimeout(deadline); clearInterval(heartbeat); };
  const join = () => {
    if (socket.readyState !== WebSocket.OPEN || joined) return;
    attempts++;
    send({action: 'join', channel});
  };
  deadline = setTimeout(() => {
    rejectReady(new Error('Timed out joining the V2 channel'));
    clear(); socket.close();
  }, 10000);
  socket.addEventListener('open', () => { onState('Joining'); join(); });
  socket.addEventListener('message', event => {
    let frame;
    try { frame = JSON.parse(event.data); } catch { return; }
    onFrame(frame);
    if (!joined && frame.action === 'error') {
      if (frame.payload?.message === 'Connection is not ready' && attempts < 10) {
        clearTimeout(retry); retry = setTimeout(join, 250);
      } else {
        rejectReady(new Error(frame.payload?.message || 'Join refused'));
        clear(); socket.close();
      }
    }
    if (frame.action === 'join' && frame.channel === channel && frame.payload?.joined) {
      joined = true; clearTimeout(retry); clearTimeout(deadline);
      heartbeat = setInterval(() => { if (socket.readyState === WebSocket.OPEN) send({action:'ping'}); }, 20000);
      onState('Joined'); resolveReady(frame);
    }
  });
  socket.addEventListener('error', () => {
    rejectReady(new Error('WebSocket connection failed. Check the V2 /ws/ route and server canonical.'));
  });
  socket.addEventListener('close', event => {
    clear(); joined = false; onState('Offline');
    rejectReady(new Error(`Connection closed (${event.code})`));
  });
  return {
    ready, socket,
    get joined() { return joined; },
    broadcast(type, payload) {
      if (!joined) throw new Error('Join the channel before publishing');
      send({action: 'broadcast', channel, type, payload});
    },
    send,
    close() { clear(); socket.close(); }
  };
}
