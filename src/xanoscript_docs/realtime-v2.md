---
applyTo: "realtime_server/**/*.xs, channel/**/*.xs, message/**/*.xs, channel_trigger/**/*.xs, realtime_server_trigger/**/*.xs"
---

# Realtime V2

> **TL;DR:** V2 uses `realtime_server` → `channel` → `message`. Clients join resolved paths over `/ws/<server-canonical>` and invoke a message with `action: "broadcast"`. Xano stacks publish with `realtime.publish`. Legacy `realtime_channel`, `realtime_trigger`, `/rt/`, and `api.realtime_event` target a different system.

## Quick Reference

| Need | V2 syntax or behavior |
|------|-----------------------|
| Create a server | `realtime_server docs_realtime { ... }` |
| Define a channel template | `channel "rooms/{room_id}"` with `realtime_server = "docs_realtime"` and `input { int room_id }` |
| Define a client-invoked handler | `message send` with `realtime_server`, `channel`, `input`, `stack`, `response` |
| Receive everyone’s messages | `deliver_to = "channel"` |
| Reply only to caller | `deliver_to = "sender"` |
| Exclude caller | `deliver_to = "others"` |
| Require a user JWT | `auth = "user"` on the message; `user` must be an auth-enabled table |
| Inspect socket context | `realtime.get_session as $session` |
| Publish from an API/function/task | `realtime.publish { realtime_server = "docs_realtime" ... }`; no `as` binding |
| Veto a channel join | `channel_trigger` with `actions = {join: true}` and `response = {allowed: <boolean>, reason: <text>}` |

**Prerequisite:** the instance must have the V2 WebSocket service and `/ws/` route enabled. A successful XanoScript import or publish API response does not prove socket delivery. If a WebSocket upgrade returns HTML instead of HTTP 101, check instance deployment before changing channel code.

## Server, Channel, and Message

Create one declaration per `.xs` file. The examples below are also in the source repository’s `examples/realtime-v2/` directory. They are not included in the npm package; copy the definitions below into your own files when using the installed MCP.

### Server

```xs
realtime_server docs_realtime {
  canonical = "67Dx5RNL"
  active = true
}
```

Use a unique `canonical` when creating your own server, or omit it once and pull the generated value. **Preserve the pulled canonical on subsequent pushes.** Omitting it on an update can change the connection address and cause existing clients to receive `Unknown connection hash`. The canonical shown here is illustrative; use your own server’s value.

Server references inside XanoScript use the **name**, `docs_realtime`. WebSocket URLs use the **canonical**, not the name.

### Channel

```xs
channel "rooms/{room_id}" {
  realtime_server = "docs_realtime"
  access = {anonymous: true, presence: false}
  publish = {who: "anyone", direct: false}
  delivery = {guarantee: "at_most_once", per_recipient: false}
  input {
    int room_id
  }
}
```

The declaration names the template `rooms/{room_id}`; a client joins a resolved path such as `rooms/42`. Declare each path parameter in the channel's input block. The example permits anonymous clients and client publishing for a test room. These are independent controls:

| Clause | Meaning |
|--------|---------|
| `access.anonymous` | Whether unauthenticated clients may join |
| `access.presence` | Whether clients receive presence information |
| `publish.who` | `nobody`, `anyone`, or `authenticated` may publish |
| `publish.direct` | Whether clients may address other clients directly |
| `delivery.guarantee` | The example uses `at_most_once`; delivery may be lost |

A room path separates subscriptions; knowing a path is not authorization. Use access policy and a join trigger for restricted rooms.

### Message handler

```xs
message send {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  deliver_to = "channel"
  input {
    text author
    text body
  }
  stack {
    var $sent_at { value = now }
  }
  response = {author: $input.author, body: $input.body, sent_at: $sent_at}
}
```

A client invokes `send` with `{author: "Alice", body: "Hello"}`. The server executes the stack and delivers the **response**, including the computed `sent_at`, to subscribed clients. `author` is user-supplied display text in this anonymous demo, not an authenticated identity.

The required parent references are the server name and channel **template**. `input`, `stack`, and `response` are required. Message payloads are validated against the input schema; for example, `int count` rejects `"not-an-integer"` with an error frame to the sender.

### Sender-only response and session context

```xs
message echo {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  deliver_to = "sender"
  input {
    text body
  }
  stack {
    realtime.get_session as $session
  }
  response = {body: $input.body, session: $session}
}
```

`realtime.get_session` exposes `authenticated`, `client_id`, `dbo_id`, `socket_id`, `channel`, `params`, `extras`, and `opened_at`. For an anonymous client in `rooms/42`, the observed session has `authenticated: false`, `client_id: ""`, `dbo_id: 0`, and `channel: "rooms/42"`.

**Path values in the join acknowledgement and `$session.params` were strings** (`{room_id: "42"}`), even though the channel declared `int room_id`. Do not assume these transport/session objects contain already-coerced numbers. Validate or convert them before numeric comparisons or database use.

`deliver_to = "others"` delivers to the other subscribers and excludes the caller. The parser also accepts `explicit`; this guide does not prescribe a recipient-selection API for that mode.

## Publish from an API

Create the `docs_audit` API group shown in the middleware topic, then add:

```xs
query publish verb=POST {
  api_group = "docs_audit"
  input {
    int room_id
    text body
  }
  stack {
    realtime.publish {
      realtime_server = "docs_realtime"
      channel = "rooms/" ~ $input.room_id
      message = "announcement"
      data = {body: $input.body}
    }
  }
  response = {ok: true}
}
```

POST `{ "room_id": 42, "body": "Hello from Xano" }` to `/api:<api-group-canonical>/publish`. Both connected clients in `rooms/42` should receive a frame with `action: "message"`, `type: "announcement"`, and the supplied body in `payload`.

| Attribute | Required | Meaning |
|-----------|----------|---------|
| `realtime_server` | Yes | Server name |
| `channel` | Yes | Resolved channel path |
| `data` | Yes | Payload to deliver |
| `message` | No | Delivered frame's `type`; does not invoke a handler |
| `auth_table`, `auth_id` | No | Identity attribution only; does not authenticate or authorize |

`realtime.publish` has no result binding and does not invoke the message handler named by `message`; the `announcement` type above has no handler. Wait for actual incoming frames to verify delivery. A `200 {ok: true}` response alone only confirms the API execution.

For an application endpoint, authorize the caller and their access to the target resource before publishing. This anonymous endpoint exists to exercise the demo.

## Publish in the visual editor

In a function stack, add **Realtime Publish** from **APIs & Lambdas**, or search for it by name. It is the visual editor equivalent of `realtime.publish`.

| Panel field | XanoScript | What to enter |
| --- | --- | --- |
| **Realtime Server** | `realtime_server` | Server name, such as `docs_realtime`; not its WebSocket canonical |
| **Channel** | `channel` | Resolved path, such as `rooms/42` |
| **Message** (optional) | `message` | Outgoing frame's `type`, such as `announcement` |
| **Data** | `data` | Payload delivered to subscribers |
| **Authentication → Database** (optional) | `auth_table` | Table used for identity attribution |
| **Authentication → Row ID** (optional) | `auth_id` | Attributed record ID; shown after selecting a database |

Realtime Server and Channel accept constants, variables, and expressions. Autocomplete offers workspace server names and channel templates as suggestions; it does not restrict values to that list. Resolve a template such as `rooms/{room_id}` to `rooms/42` before publishing. A channel path belongs to a particular server, so supply both fields. If suggestions fail to load, you can still enter the values directly.

**Message does not invoke a message handler.** Publishing with `message = "send"` delivers your Data as-is with `type: "send"`; it does not run the `send` handler's input validation, function stack, or per-message authentication. Authorize the calling API or stack before publishing. The optional Authentication fields attach identity metadata only; they do not validate credentials or grant access.

### Availability and version choice

**Realtime Publish** requires Realtime V2 support on the instance. In the picker category and search results, it is greyed out with an explanation when V2 is unavailable. An empty autocomplete list is a separate issue and does not mean V2 is disabled.

**Realtime Event (v1)** remains available for legacy connections. Its XanoScript statement is `api.realtime_event`. It cannot reach V2 subscribers and can complete without an error while delivering nothing to them. Do not substitute it when Realtime Publish is unavailable; check V2 availability on the instance instead.

For raw process-stack integrations, V2 is `mvp:realtime_publish` (`EProcessFunctionType.RealtimePublish`); V1 is `mvp:realtime_event`. These internal identifiers are not XanoScript syntax. Existing statements remain editable; adding a statement is not evidence that socket delivery is available.

## Native WebSocket Client

The V2 URL is `wss://<instance-host>/ws/<server-canonical>`. Use the V2 server's canonical, not the workspace's legacy realtime canonical. A user JWT is carried as the WebSocket subprotocol: `new WebSocket(url, [userJwt])`. Do not put a Metadata API access token in frontend code.

The following module is shared verbatim with the live demo and verification script. It waits for the join acknowledgement, retries the specific initial readiness error, sends keepalive pings, and closes timers with the socket.

```javascript
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
```

Save that module as `socket.js`, then use it as follows. The address shape is `wss://{instance-host}/ws/{server-canonical}`; the filled-in example below is illustrative. Replace it with your own server address:

```javascript
import {connectClient} from "./socket.js";

const client = connectClient({
  url: "wss://x8ki-letl-twmt.n7.xano.io/ws/67Dx5RNL",
  channel: "rooms/42",
  onFrame(frame) {
    if (frame.action === "message") {
      console.log(frame.type, frame.payload);
    }
  }
});

try {
  await client.ready;
  client.broadcast("send", {author: "Alice", body: "Hello"});
} catch (error) {
  client.close();
  console.error(error);
}
```

Call `client.close()` when the page or component stops using the connection. The demo does this on `pagehide`. A closed connection must join again after reconnecting.

### Wire frames

| Direction | Example |
|-----------|---------|
| Client → server, join | `{ "action": "join", "channel": "rooms/42" }` |
| Server → client, joined | `{ "action": "join", "channel": "rooms/42", "payload": { "joined": true, "params": { "room_id": "42" } } }` |
| Client → server, invoke | `{ "action": "broadcast", "channel": "rooms/42", "type": "send", "payload": { "author": "Alice", "body": "Hello" } }` |
| Server → client, delivery | `{ "action": "message", "channel": "rooms/42", "type": "send", "payload": { ... } }` |
| Server → client, error | `{ "action": "error", "payload": { "message": "..." } }` |

A `broadcast` receipt is not the delivered message. Render incoming `message` frames, and surface `error` frames separately. The demo never inserts optimistic or simulated deliveries.

## Authentication and Join Authorization

A channel can allow anonymous joins while a particular message requires authentication:

```xs
message protected_echo {
  realtime_server = "docs_realtime"
  channel = "rooms/{room_id}"
  auth = "user"
  deliver_to = "sender"
  input {
    text body
  }
  stack {
    realtime.get_session as $session
  }
  response = {body: $input.body, authenticated: $session.authenticated}
}
```

This assumes an existing auth-enabled `user` table. An anonymous invocation is rejected; a valid user JWT supplied as the socket subprotocol can invoke the handler. The JWT is an application user token, distinct from the CLI's administrative token.

For a channel-wide gate, create the channel:

```xs
channel members {
  realtime_server = "docs_realtime"
  access = {anonymous: true, presence: false}
  publish = {who: "authenticated", direct: false}
  input {
  }
}
```

Then attach a join trigger by its parent references:

```xs
channel_trigger member_gate {
  realtime_server = "docs_realtime"
  channel = "members"

  input {
    enum action {
      values = ["join", "leave", "deliver"]
    }
  
    text channel
    json payload
    object client {
      schema {
        json extras
        object permissions {
          schema {
            int dbo_id
            text row_id
          }
        }
      }
    }
  }

  stack {
    realtime.get_session as $session
  }

  response = {
    allowed: $session.authenticated
    reason : "Sign in to join members"
  }

  actions = {join: true}
}
```

The trigger input schema above is the platform's pulled schema. The server normalizes these system inputs; do not invent application input parameters on the trigger. This gate explicitly admits authenticated sessions and rejects anonymous sessions with a reason. For membership or tenant authorization, replace the simple authentication decision with checks against your application data.

V2 lifecycle scopes are `realtime_server_trigger` for `connect`/`disconnect`, and `channel_trigger` for `join`/`leave`/`deliver`. The executable example here covers `join`. Legacy `realtime_trigger` belongs to V1.

## CLI Workflow and Verification

Authenticate with your Xano account at `https://app.xano.com` and select your instance, workspace, and branch:

```bash
xano auth
```

Use your selected profile, workspace, and branch explicitly. Replace the uppercase placeholders below with your selections. Save the declarations under `examples/realtime-v2/` in your project, or change `--directory` to the directory you used:

```bash
xano workspace push --profile YOUR_PROFILE --workspace YOUR_WORKSPACE --branch YOUR_BRANCH --directory examples/realtime-v2 --dry-run
xano workspace push --profile YOUR_PROFILE --workspace YOUR_WORKSPACE --branch YOUR_BRANCH --directory examples/realtime-v2
xano workspace pull --profile YOUR_PROFILE --workspace YOUR_WORKSPACE --branch YOUR_BRANCH --directory pulled-workspace
```

Validate with `xano_validate_xanoscript` before pushing. Pull back and verify server canonicals, channel settings, message parent references, and trigger inputs. Use a current CLI release with Realtime V2 support. V2 objects pull under `realtime_server/`, `channel/`, `message/`, and `channel_trigger/`. Keep explicit parent clauses: folder names do not replace them.

If working from the source repository, run `node examples/realtime-v2/verify.mjs` with the frontend config pointed at your deployed examples. Set `XANO_TEST_USER_TOKEN` to an application user JWT to include the authenticated positive test. The script reports that test as skipped if the token is absent.

## Common Mistakes

- **Mixing V1 and V2:** `api.realtime_event` and `/rt/` do not target these V2 servers.
- **Using a template in a publish call:** send to `rooms/42`, not `rooms/{room_id}`.
- **Using the server name in a socket URL:** use its preserved canonical.
- **Sending before joining:** wait for a successful join acknowledgement. Socket `open` alone is insufficient.
- **Confusing acknowledgements with delivery:** assert `action: "message"` on each intended recipient.
- **Assuming session path values are numeric:** the observed `$session.params.room_id` is text.
- **Treating a successful import as a realtime test:** connect two clients and verify actual delivered frames.

## Related Topics

| Topic | Description |
|-------|-------------|
| `realtime` | Legacy V1 channels and events |
| `middleware` | API post middleware and response envelopes |
| `apis` | Endpoint definitions |
| `security` | Application authentication and authorization |
