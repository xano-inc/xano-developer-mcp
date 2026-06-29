---
applyTo: "static/**/*"
---

# Frontend

Build a static frontend (any framework that emits static output, or plain
HTML/CSS/JS) that calls your Xano APIs directly, then deploy it to **Xano static
hosting** (paid plans). There's no server tier — only static files; all dynamic
data comes from your APIs.

Keep frontend source in a **`static/`** directory at the project root, beside the
backend code.

## Get the API spec first

Before wiring calls, get the OpenAPI/Swagger spec for the API group you'll
consume: the `xano_get_openapi_spec` tool (if exposed), the Meta API `/openapi`
endpoint (see `xano_meta_api_docs`), or the API group's `…/swagger.json` URL.
It also drives typed-client codegen in the starter below.

## Two starting points

- **Opinionated starter (recommended for apps)** — clone
  [`xano-labs/static_template`](https://github.com/xano-inc/static_template.git) into
  `static/`: a Vite + React + TS SPA with auth and typed API hooks (generated from
  your Swagger) already wired. Point it at your instance (`VITE_XANO_API_BASE` +
  `VITE_XANO_SWAGGER_URL`) and build. It ships its own docs — follow those.

- **Plain static (no build)** — hand-write files into `static/`. Centralize calls
  in one client module that prefixes a base URL and attaches the auth token:

  ```javascript
  const API_BASE = "https://your-instance.xano.io/api:group";

  async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }
  ```

  Auth follows the same pattern: `POST /auth/login` (or `/auth/signup`) returns an
  `authToken`; store it in `localStorage`, send it as `Authorization: Bearer`, and
  remove it to log out.

## Deploy

Deploy with the **`xano` CLI** (`npm i -g @xano/cli`, then `xano auth`). A
**build** is an uploaded snapshot; a **deploy** points an environment (`dev` or
`prod`, each its own URL) at a build.

```bash
xano static_host create my-app                              # one-time
xano static_host build push my-app -d ./static -n "v1.0.0"  # push snapshot
xano static_host deploy my-app --build_id <id> --env dev    # then --env prod
```

When `static/` has a `package.json`, **Xano runs your `build` script
server-side** on push. Changes aren't auto-synced — push a new build to publish.
Full reference (flags, `build pull`, rollback, git integration):
`xano_cli_docs(topic='static_host')`.

**After deploy:** the environment URL can 404 briefly until the build
propagates — allow a few seconds before treating a deploy as failed. Assets are
cached by filename, so redeploys can serve stale files to returning visitors;
version asset URLs (e.g. `app.js?v=2`) when an update must take effect immediately.

## Best practices

- **Never ship secrets** — the bundle is world-readable. The only credential is
  the user's own auth token in `localStorage`. No API keys or DB credentials in
  client code, including any `VITE_*` variable (inlined into the bundle).

## Related Topics

| Topic       | Description             |
| ----------- | ----------------------- |
| `apis`      | Backend API endpoints   |
| `workspace` | Workspace configuration |
| `security`  | CORS and authentication |
