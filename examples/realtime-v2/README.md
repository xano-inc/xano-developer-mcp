# Realtime V2 and API post middleware demo

Two independent native WebSocket clients show a real V2 message handler, sender-only echo, and a server-published announcement. The page also calls an API with post middleware. There are no simulated deliveries.

## Run the frontend

From the repository root:

```bash
python3 -m http.server 4174 --bind 127.0.0.1 --directory examples/realtime-v2/frontend
```

Open http://127.0.0.1:4174, click **Connect both clients**, and send a message from Alice or Bob. Both panels should receive it. **Test sender-only echo** reaches only the panel that sent it. **Publish announcement** calls Xano's API and delivers an `announcement` to both panels. **Run check** displays the post middleware result.

The checked-in `frontend/config.json` contains illustrative production-format addresses. Replace the instance URL, server canonical, and API group canonical with your deployment before connecting. No administrative token belongs in this frontend. The demo’s channels and publishing API allow anonymous test traffic; add application authorization before exposing them to your users.

## Deploy the fixtures elsewhere

Prerequisites:

- A V2-enabled Xano instance with the `/ws/` ingress route and direct workspace push enabled.
- An existing auth-enabled `user` table for `protected_echo`. The examples do not redefine it.
- A current Xano CLI and an authenticated profile. Run `xano auth` to sign in at `https://app.xano.com`.

Choose unique server and API group canonicals when deploying to another workspace. Keep the chosen server canonical in `realtime_server/docs_realtime.xs`: omitting it on a later push can regenerate the connection address. Update `frontend/config.json` to match the target instance and both canonicals.

```bash
xano workspace push --profile YOUR_PROFILE --workspace YOUR_WORKSPACE --branch YOUR_BRANCH --directory examples/realtime-v2 --dry-run
xano workspace push --profile YOUR_PROFILE --workspace YOUR_WORKSPACE --branch YOUR_BRANCH --directory examples/realtime-v2
xano workspace pull --profile YOUR_PROFILE --workspace YOUR_WORKSPACE --branch YOUR_BRANCH --directory pulled-workspace
```

Use a scoped push without `--delete`. The supplied fixtures add their own API group, server, channels, messages, middleware, and join trigger. Pull afterwards to verify parent references, system input normalization, and canonicals.

## Verify the live backend

Node 22 or later supplies the native `WebSocket` and `fetch` used here. No additional dependency is required.

```bash
node examples/realtime-v2/verify.mjs
```

For the full authenticated positive case, provide `XANO_TEST_USER_TOKEN` through your environment with a valid application user JWT from this workspace's `user` table. Do not use a Metadata API token. With no token, the verifier explicitly reports that case as skipped.

The verification script shares `frontend/socket.js` with the demo. It opens independent sockets, uses a fresh room each run, calls the live APIs, asserts received frames, and closes sockets in `finally`. It does not create user accounts. See [VALIDATION.md](VALIDATION.md) for the validation coverage and limitations.

## Files

| Directory/file | Purpose |
| --- | --- |
| `realtime_server/`, `channel/`, `message/`, `channel_trigger/` | V2 declarations |
| `middleware/`, `api/` | Merge/replace post middleware and server publishing APIs |
| `frontend/` | Static browser demo and shared socket helper |
| `verify.mjs` | Live network verification; separate from offline unit tests |

Full authoring docs are `src/xanoscript_docs/realtime-v2.md` and `src/xanoscript_docs/middleware.md`. Offline regression tests validate the fixture scripts and ensure the documentation uses those same examples.
