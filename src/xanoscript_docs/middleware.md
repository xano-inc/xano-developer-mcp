---
applyTo: "middleware/*.xs"
---

# Middleware

> **TL;DR:** Define a middleware, then attach it inside the API's `query` declaration with `middleware = {post: [{name: "docs_post"}]}`. Post middleware receives the response envelope in `$input.vars`; the successful endpoint result is `$input.vars.result`.

## Quick Reference

| Need | Syntax |
|------|--------|
| Attach to one API | `middleware = {post: [{name: "docs_post"}]}` alongside `response` |
| Middleware inputs | `json vars` and `enum type { values = ["pre", "post"] }` |
| Current phase | `$input.type` |
| Successful post result | `$input.vars.result` |
| Add response fields | `response_strategy = "merge"` |
| Replace response | `response_strategy = "replace"` |
| Surface middleware errors | `exception_policy = "rethrow"` |

Use an array of `{name: "..."}` objects, not an array of strings. Declare the referenced middleware before attaching it. The name must match exactly.

## Attach Post Middleware to an API

Create each declaration in its own `.xs` file. This example needs no database table.

### 1. Define the middleware

```xs
middleware docs_post {
  exception_policy = "rethrow"
  response_strategy = "merge"
  input {
    json vars
    enum type {
      values = ["pre", "post"]
    }
  }
  stack {
    var $observed { value = $input.vars }
  }
  response = {middleware_phase: $input.type, observed: $observed}
}
```

`input`, `stack`, and `response` are required by the MCP validator. The server supplies the fixed `vars` and `type` inputs. Custom middleware inputs are not a way to pass parameters from an API.

### 2. Create an API group

```xs
api_group docs_audit {
  canonical = "docs-demo"
}
```

Use a unique canonical for a new group. Preserve the existing canonical when editing a group.

### 3. Attach the middleware inside the query

```xs
query check verb=GET {
  api_group = "docs_audit"
  input {
  }
  stack {
    var $result { value = {ok: true} }
  }
  response = $result
  middleware = {post: [{name: "docs_post"}]}
}
```

The middleware block is a sibling of `input`, `stack`, and `response`. Do not put it inside `stack`, and do not add `type = "post"` to the middleware declaration.

Request `GET /api:docs-demo/check` on the instance. The live response is:

```json
{
  "ok": true,
  "middleware_phase": "post",
  "observed": {"status": "ok", "result": {"ok": true}}
}
```

The `ok` field comes from the API. The other fields prove that the middleware ran in the post phase and saw the endpoint's response. Returning an object with `merge` adds its fields to the successful response object. This example deliberately echoes the envelope for inspection; a production middleware should return only the intended public fields.

## Response Envelope and Replacement

For the successful API above, `$input.vars` is `{status: "ok", result: {ok: true}}`. To wrap the endpoint's payload, use `$input.vars.result`, not the whole envelope. Do not assume this successful-response shape describes an error path or the pre phase.

```xs
middleware docs_wrap {
  exception_policy = "rethrow"
  response_strategy = "replace"
  input {
    json vars
    enum type {
      values = ["pre", "post"]
    }
  }
  stack {
    var $payload { value = $input.vars.result }
  }
  response = {success: true, payload: $payload}
}
```

Attach `docs_wrap` as the query's post middleware:

```xs
query wrap verb=GET {
  api_group = "docs_audit"
  input {
  }
  stack {
    var $result { value = {ok: true} }
  }
  response = $result
  middleware = {post: [{name: "docs_wrap"}]}
}
```

Request `GET /api:docs-demo/wrap`. The expected response is:

```json
{"success": true, "payload": {"ok": true}}
```

With `replace`, the middleware's response becomes the endpoint response. With `merge`, the original successful response fields remain alongside middleware fields.

## Validate and Verify

1. Validate every definition with `xano_validate_xanoscript`.
2. Preview the scoped workspace push with `--dry-run`, then push the middleware, group, and API together.
3. Pull the workspace again and inspect the query's `middleware` attachment.
4. Call the real endpoint and assert the final HTTP response. Parsing or a successful push alone does not prove that middleware executed.

The repository's `examples/realtime-v2/verify.mjs` exercises both merge and replace against a live workspace. Its target is configured in `examples/realtime-v2/frontend/config.json`.

## Common Mistakes

- **Defining without attaching:** a middleware declaration alone does not attach it to an API. Put the `middleware` block inside the query.
- **Using string entries:** use `post: [{name: "docs_post"}]`, not `post: ["docs_post"]`.
- **Inventing middleware inputs:** read the server-provided `$input.vars` and `$input.type`.
- **Wrapping the wrong value:** for a successful post response, wrap `$input.vars.result`; `$input.vars` also includes execution status.
- **Trusting validation alone:** check the pulled attachment and execute the endpoint after pushing.

## Related Topics

| Topic | Description |
|-------|-------------|
| `apis` | API declarations and responses |
| `realtime-v2` | Message handlers and live server publishing |
| `security` | Authentication and authorization |
