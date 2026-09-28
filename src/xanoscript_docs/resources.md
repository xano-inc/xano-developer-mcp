---
applyTo: "ai/resource/*.xs"
---

# Resources

Data an MCP server shares with clients as context: documents, records, schemas. A client lists them with `resources/list` (and `resources/templates/list`) and reads one with `resources/read`.

> **TL;DR:** A `resource` has a `uri`, a `stack` and a `response`. A literal uri (`docs://readme`) is a static resource with no input. A uri with `{variables}` (`orders://{order_id}`) is a template: every variable must be declared in `input { }`, and nothing else may be. Attach it with `resources = [{ name: "<resource>" }]` on the `mcp_server`.

---

## Quick Reference

```xs
resource "<name>" {
  uri = "<scheme>://<path-with-optional-{variables}>"
  mime_type = "application/json"
  input { ... }
  stack { ... }
  response = $data
}
```

---

## Static Resource

```xs
resource readme {
  uri = "docs://readme"
  mime_type = "text/markdown"

  stack {
  }

  response = "# Readme"
}
```

---

## Template Resource

```xs
// One order in a region
resource regional_order {
  title = "Regional order"
  uri = "orders://{region}/{order_id}"
  mime_type = "application/json"
  annotations = {
    audience     : ["user", "assistant"]
    priority     : 0.5
    last_modified: "2025-01-12T15:00:58Z"
  }

  input {
    // The region
    enum region {
      values = ["us", "eu"]
    }

    // The order id
    int order_id
  }

  stack {
    db.get order {
      field_name = "id"
      field_value = $input.order_id
    } as $order
  }

  response = $order
}
```

Reading `orders://eu/42` binds `region = "eu"` and `order_id = 42`, converted to the declared types before the stack runs. A value that does not convert (for example `orders://eu/abc`) is refused with an invalid-params error.

---

## Key Fields

| Field | Purpose | Required |
|-------|---------|----------|
| `uri` | A literal URI, or a template whose `{variables}` are the input fields | Yes |
| `stack` | Logic that produces the content | Yes |
| `response` | The content to return | No |
| `input` | The template variables. Must be omitted (or empty) for a static resource | No |
| `mime_type` | The content's MIME type, such as `text/markdown` | No |
| `annotations` | `audience`, `priority`, `last_modified` (see below) | No |
| `description` | Sent to the client | No |
| `title` | Human readable display name | No |
| `icons` | Same rules as tool icons (see `tools`) | No |
| `middleware`, `history`, `tags`, `docs`, `guid` | As on a tool | No |

The declaration name (`resource regional_order`) is the resource's name. It is never its uri.

---

## URI Rules

- It starts with a scheme: `docs:`, `orders:`, `file:`.
- It contains no whitespace.
- Only level-1 template variables are allowed: `{name}`. Operators (`{+path}`, `{#x}`, `{/x}`), modifiers (`{x*}`, `{x:3}`) and lists (`{a,b}`) are refused.
- Each variable appears at most once, and two variables may not be adjacent (`{a}{b}`), because a concrete URI could not be split back into them.
- A variable matches one path segment: `file:///{path}` does not match `file:///a/b`.
- Variable names are letters, digits and `_`, and each must be declared in `input` as a single (non-list) `text`, `int`, `decimal`, `bool`, `enum`, `email` or `uuid` field.
- Every `input` field must be a uri variable. A static resource has no input.

---

## Annotations

| Key | Value |
|-----|-------|
| `audience` | A list of `"user"` and/or `"assistant"` |
| `priority` | A number from 0 to 1 |
| `last_modified` | An ISO 8601 date, e.g. `"2025-01-12T15:00:58Z"` |

Any other key is an error.

---

## What `response` May Return

| Response | Content the client receives |
|----------|-----------------------------|
| A UTF-8 string | `text` |
| A string that is not valid UTF-8 (binary bytes) | `blob` (base64) |
| A file resource or file variable | `blob` (base64 of the file bytes) |
| `{text: ...}` or `{blob: ...}` (optionally with `mime_type`, `uri`), or a list of them | Those items as written. A `blob` must already be base64 |
| Any other object or list | JSON `text` |
| A number, bool or null | `text` |

The content's MIME type is, in order: an explicit `{text}`/`{blob}` item's own `mime_type`, then the resource's `mime_type`, then the file's own type, then `text/plain`, `application/json` or `application/octet-stream` by shape.

---

## Argument Completions

For a template resource, an `enum` variable gives the client completions: `completion/complete` answers with the enum `values` that start with what the user typed. No stack runs.

---

## Elicitation and Progress

A resource's stack can use `mcp.elicit` and `mcp.progress`, exactly as a tool can. See `mcp-servers`.

---

## Attaching to a Server

```xs
mcp_server "Orders" {
  canonical = "orders-mcp"
  tools = [{ name: "search_orders" }]
  resources = [
    { name: "readme" },
    { name: "regional_order", auth: "user" }
  ]
}
```

Entry fields are `name` (required), `active` (default `true`) and `auth` (an auth-enabled table name; omitted = public). Two resources attached to one server may not share a uri.

> **Legacy:** before first-class resources, a tool reference could be advertised as a resource with `{ name: "...", type: "resource", resource_uri: "..." }` in the `tools` block. That still works for existing servers, but new work should use a `resource` object. If both exist on one uri, the first-class resource wins.

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `mcp-servers` | Attaching resources, elicitation, progress, protocol versions |
| `prompts` | The other first-class MCP primitive |
| `tools` | Tool metadata and icon rules |
| `types` | Input field types |
