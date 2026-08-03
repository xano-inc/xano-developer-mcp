---
applyTo: "ai/mcp_server/*.xs"
---

# MCP Servers

Model Context Protocol servers that expose tools to external AI clients.

## Quick Reference

```xs
mcp_server "<name>" {
  canonical = "<unique-id>"
  description = "Internal documentation"
  instructions = "How to use this server's tools"
  tags = ["category"]
  tools = [{ name: "<tool-name>" }]
}
```

---

## Basic Structure

```xs
mcp_server "Customer Support" {
  canonical = "support-mcp-v1"
  description = "Tools for customer support agents"
  instructions = "Use these tools to help customers with orders and accounts."
  tags = ["support", "customer"]
  tools = [
    { name: "get_order_status" },
    { name: "update_order" },
    { name: "create_ticket" }
  ]
}
```

---

## Key Fields

| Field | Purpose | Required |
|-------|---------|----------|
| `canonical` | Unique identifier | Yes |
| `active` | Whether the server is online (default `true`) | No |
| `description` | Internal documentation | No |
| `instructions` | Server-level AI guidance | No |
| `tags` | Organization/categorization | No |
| `docs` | Internal team notes | No |
| `tools` | List of exposed tools | Yes |

---

## Tools Block

Reference tools from `ai/tool/` directory by name:

```xs
tools = [
  { name: "get_user_details" },
  { name: "search_products" },
  { name: "create_order" }
]
```

Tool names must exactly match `.xs` file names in `ai/tool/`.

### Tool Entry Fields

Each entry is an object. Only `name` is required — the rest configure how this
server exposes that tool. These settings apply to this server only; they do not
change the tool itself or how any other server exposes it.

| Field | Purpose | Default |
|-------|---------|---------|
| `name` | Tool file name in `ai/tool/` | — (required) |
| `active` | Whether connections to this entry are allowed | `true` |
| `auth` | Name of an auth-enabled table required to call it | omitted = no auth |
| `type` | `"tool"` or `"resource"` | `"tool"` |
| `resource_uri` | URI identifying the resource (`type: "resource"` only) | `""` |
| `tool_meta` | MCP `_meta` payload sent with the tool (`type: "tool"` only) | `""` |

```xs
tools = [
  { name: "search_products" },
  { name: "update_order", auth: "user" },
  { name: "legacy_lookup", active: false },
  {
    name        : "product_catalog"
    type        : "resource"
    resource_uri: "file:///catalog.json"
  },
  { name: "delete_order", tool_meta: "{\"audience\":[\"admin\"]}" }
]
```

Reading down that list: `search_products` is public, `update_order` requires a
valid `user` access token, `legacy_lookup` stays configured but offline,
`product_catalog` is advertised as a resource, and `delete_order` carries extra
MCP metadata.

Comments are not allowed inside a `tools` array — put them above the `tools` line.

### `auth`

Set `auth` to the name of a table that has authentication enabled. Only requests
with a valid access token for that table may call the tool. Omit `auth` to leave
the tool public. An unknown table name resolves to no auth rather than an error.

### `type` and `resource_uri`

`type` chooses what MCP object the connected tool is advertised as:

- `"tool"` (default) — a callable tool.
- `"resource"` — data the server shares as context (files, schemas,
  application-specific information). Each resource is identified by a URI, so set
  `resource_uri` alongside it.

`type` accepts only `"tool"` or `"resource"`; any other value is an error.

```xs
tools = [
  { name: "db_schema", type: "resource", resource_uri: "xano://schema/orders" },
  { name: "readme", type: "resource", resource_uri: "file:///docs/readme.md" }
]
```

### `tool_meta`

MCP reserves a `_meta` property so clients and servers can attach additional
metadata to their interactions. `tool_meta` is that payload, written as a string:

```xs
{ name: "process_refund", tool_meta: "{\"audience\":[\"admin\"],\"priority\":1}" }
```

**Pairing rules:** `resource_uri` applies only when `type` is `"resource"`, and
`tool_meta` applies only when `type` is `"tool"`. The parser accepts either field
on either type, but a value on the wrong type is ignored and dropped the next time
the server is exported.

---

## Examples

### Task Management Server
```xs
mcp_server "Task Manager" {
  canonical = "task-mgr-mcp"
  description = "Task management tools for productivity agents"
  instructions = "Manages user tasks. All tools relate to the authenticated user's records."
  tags = ["productivity", "internal"]
  tools = [
    { name: "add_task" },
    { name: "list_tasks" },
    { name: "complete_task" },
    { name: "delete_task" }
  ]
}
```

### E-commerce Server
```xs
mcp_server "Store Operations" {
  canonical = "store-ops-v1"
  instructions = "Tools for managing an e-commerce store. Handle products, orders, and inventory."
  tags = ["ecommerce", "admin"]
  tools = [
    { name: "search_products" },
    { name: "get_product" },
    { name: "update_inventory" },
    { name: "get_order" },
    { name: "update_order_status" },
    { name: "process_refund" }
  ]
}
```

### Analytics Server
```xs
mcp_server "Analytics" {
  canonical = "analytics-mcp"
  description = "Data analysis and reporting tools"
  instructions = "Query and analyze business data. Use for generating reports and insights."
  tags = ["analytics", "reporting"]
  tools = [
    { name: "get_sales_summary" },
    { name: "get_user_metrics" },
    { name: "generate_report" },
    { name: "export_data" }
  ]
}
```

### CRM Server
```xs
mcp_server "CRM" {
  canonical = "crm-mcp-v2"
  instructions = """
    Customer Relationship Management tools.
    - Use contact tools for customer info
    - Use deal tools for sales pipeline
    - Use activity tools for interaction logging
  """
  tags = ["crm", "sales"]
  tools = [
    { name: "search_contacts" },
    { name: "get_contact" },
    { name: "create_contact" },
    { name: "update_contact" },
    { name: "list_deals" },
    { name: "create_deal" },
    { name: "log_activity" }
  ]
}
```

---

## Server Organization

### By Domain
```
ai/mcp_server/
├── support.xs          # Customer support tools
├── ecommerce.xs        # Store management
├── analytics.xs        # Reporting and metrics
└── admin.xs            # Administrative functions
```

### By Access Level
```
ai/mcp_server/
├── public.xs           # Public-facing tools
├── authenticated.xs    # Requires auth
└── admin.xs            # Admin-only tools
```

---

## Connecting to MCP Servers

MCP servers expose a standardized endpoint that AI clients can connect to:

1. Client connects to MCP endpoint
2. Server returns available tools with schemas
3. Client can call tools and receive responses

The MCP protocol handles:
- Tool discovery
- Input validation
- Response formatting
- Error handling

---

## Best Practices

1. **Clear naming** - Server name should indicate its purpose
2. **Comprehensive instructions** - Guide AI on server's overall purpose
3. **Logical tool grouping** - Group related tools in one server; one domain per server

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `tools` | AI tool definitions used by MCP servers |
| `agents` | AI agent configuration |
| `triggers` | MCP server triggers for connection events |
