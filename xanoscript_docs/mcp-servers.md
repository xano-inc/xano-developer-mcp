---
applyTo: "mcp_servers/**/*.xs"
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
| `description` | Internal documentation | No |
| `instructions` | Server-level AI guidance | No |
| `tags` | Organization/categorization | No |
| `tools` | List of exposed tools | Yes |

---

## Tools Block

Reference tools from `tools/` directory by name:

```xs
tools = [
  { name: "get_user_details" },
  { name: "search_products" },
  { name: "create_order" }
]
```

Tool names must exactly match `.xs` file names in `tools/`.

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
mcp_servers/
├── support.xs          # Customer support tools
├── ecommerce.xs        # Store management
├── analytics.xs        # Reporting and metrics
└── admin.xs            # Administrative functions
```

### By Access Level
```
mcp_servers/
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
2. **Memorable canonical IDs** - Use descriptive, stable identifiers
3. **Comprehensive instructions** - Guide AI on server's overall purpose
4. **Logical tool grouping** - Group related tools in one server
5. **Use tags** - Organize servers by category
6. **Keep focused** - One domain per server (support, analytics, etc.)
7. **Document internally** - Use description for team documentation
