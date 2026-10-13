---
applyTo: "ai/tool/*.xs"
---

# Tools

Functions that AI agents and MCP servers can execute.

> **TL;DR:** Tools are functions for AI. Use `description` for internal docs, `instructions` for AI guidance. Define `input { }` and `stack { }` like regular functions. Attach to agents via `tools = [{ name: "tool_name" }]`.

---

## Quick Reference

```xs
tool "<name>" {
  description = "Internal documentation"
  instructions = "How the AI should use this tool"
  input { ... }
  stack { ... }
  response = $result
}
```

---

## Basic Structure

```xs
tool "get_user_by_email" {
  description = "Look up user by email address"
  instructions = "Use this to find user details when you have their email."

  input {
    email email filters=lower {
      description = "The user's email address"
    }
  }

  stack {
    db.get "user" {
      field_name = "email"
      field_value = $input.email
    } as $user
  }

  response = $user
}
```

---

## Key Fields

| Field | Purpose | Visibility |
|-------|---------|------------|
| `description` | Internal documentation | Not sent to AI |
| `instructions` | How AI should use tool | Sent to AI |
| `input` | Parameters with descriptions | Sent to AI |
| `stack` | Execution logic | Not sent to AI |
| `response` | Return value | Sent to AI |
| `title` | Human readable display name (MCP) | Shown by MCP clients |
| `annotations` | Behavior hints (MCP) | Sent to MCP clients |
| `icons` | Icons a client may show (MCP) | Sent to MCP clients |
| `output` | Output schema; enables structured results (MCP) | Sent to MCP clients |

**Important:** `instructions` and input `description` fields are sent to the AI. Write them clearly.

---

## Input Block

For complete type reference, use `xano_xanoscript_docs({ topic: "types" })`. For tools, input `description` fields are sent to the AI, so write them clearly:

```xs
input {
  int order_id { description = "The unique order ID to look up" }
  enum status {
    description = "New status to set"
    values = ["pending", "processing", "shipped", "delivered"]
  }
}
```

---

## MCP Metadata

When a tool is exposed through an `mcp_server`, these optional fields describe it to MCP clients. Agents ignore them.

```xs
tool lookup_order {
  title = "Look up an order"
  annotations = {
    read_only_hint  : true
    destructive_hint: false
    idempotent_hint : true
    open_world_hint : false
  }

  icons = [
    {
      src  : "https://cdn.example.com/icons/order.webp"
      sizes: ["any"]
      theme: "light"
    }
  ]

  input {
    int order_id
  }

  stack {
    var $order {
      value = {id: $input.order_id, status: "open"}
    }
  }

  response = $order

  output {
    int id
    enum status {
      values = ["open", "closed"]
    }
  }
}
```

### `title`

A human readable name, e.g. `"Look up an order"`. The tool name stays the identifier.

### `annotations`

Hints about the tool's behavior. Clients use them to decide, for example, whether to ask the user before calling it. They are hints only: nothing enforces them.

| Key | Meaning |
|-----|---------|
| `read_only_hint` | The tool does not change anything |
| `destructive_hint` | The tool may delete or overwrite data |
| `idempotent_hint` | Calling it twice with the same input has no extra effect |
| `open_world_hint` | The tool reaches systems outside Xano (external APIs, the web) |

Any other key is an error.

### `icons`

A list of `{ src, mime_type?, sizes?, theme? }`:

- `src` is an `https://` URL (at most 2048 characters) or a base64 `data:` URI of `image/png`, `image/jpeg` or `image/webp` (at most 64 KB decoded). SVG and every other scheme (`http:`, `javascript:`, `file:`) are refused, because an icon must never carry script. Xano never fetches the URL.
- `mime_type` is `image/png`, `image/jpeg` or `image/webp`.
- `sizes` is a list of `"WxH"` strings or `"any"`.
- `theme` is `light` or `dark`.

`prompt` and `resource` accept the same `title` and `icons`.

### `output`

Declares the shape of the tool's result, with the same field syntax as `input`. When it is set, the MCP server returns the response as `structuredContent` (plus the same JSON as text) and validates it first: a response that does not match is returned as a tool error naming the first failing field. Without `output`, the response is returned as one text block, unless the stack returns a complete MCP `CallToolResult` itself (an object with a `content` list, optionally `structuredContent` and `isError`), which is passed through as-is. When `output` is set, the `structuredContent` of such a hand-built result is validated too.

---

## MCP Statements

`mcp.elicit` asks the MCP client a question and waits for the answer; `mcp.progress` reports progress. Both work in tools, prompts and resources. Read the rules in `mcp-servers` before using `mcp.elicit`: **the client retries the whole call with each answer, so put writes after the last elicit, and always handle `cancel`**.

```xs
tool delete_order {
  instructions = "Delete an order after the user confirms."
  input {
    int order_id
  }

  stack {
    mcp.elicit {
      key = "confirm"
      message = "Delete order " ~ $input.order_id ~ "?"
      input {
        bool proceed
      }
    } as $answer

    precondition ($answer.action == "accept" && $answer.content.proceed) {
      error = "Not confirmed"
    }

    db.del order {
      field_name = "id"
      field_value = $input.order_id
    }
  }

  response = {deleted: $input.order_id}
}
```

---

## Tool-Specific Statements

> **Where these belong:** `api.call`, `task.call`, and `tool.call` are for **tools**. Use them to compose a tool from other Xano constructs. Don't reach for them in API endpoints, functions, or tasks. (To call a function from a regular stack, use `function.run`.)

### api.call
Call an API endpoint:

```xs
stack {
  api.call "orders/get" verb=GET {
    api_group = "orders"
    input = { order_id: $input.order_id }
  } as $order
}
```

### task.call
Trigger a background task:

```xs
stack {
  task.call "send_notification" as $result
}
```

### tool.call
Call another tool:

```xs
stack {
  tool.call "get_user_by_id" {
    input = { user_id: $input.user_id }
  } as $user
}
```

---

## Common Patterns

### Database Lookup
```xs
tool "get_order_status" {
  instructions = "Check the current status of an order by its ID."
  input {
    int order_id { description = "Order ID to check" }
  }
  stack {
    db.get "order" {
      field_name = "id"
      field_value = $input.order_id
    } as $order
  }
  response = {
    order_id: $order.id,
    status: $order.status,
    updated_at: $order.updated_at
  }
}
```

### Database Update
```xs
tool "update_order_status" {
  instructions = "Update an order's status. Use when customer requests changes."
  input {
    int order_id { description = "Order ID to update" }
    enum status {
      description = "New status"
      values = ["pending", "processing", "shipped", "cancelled"]
    }
  }
  stack {
    db.edit "order" {
      field_name = "id"
      field_value = $input.order_id
      data = { status: $input.status, updated_at: now }
    } as $order
  }
  response = $order
}
```

### External API Call
```xs
tool "get_weather" {
  instructions = "Get current weather for a city."
  input {
    text city filters=trim { description = "City name" }
  }
  stack {
    api.request {
      url = "https://api.weather.com/current"
      method = "GET"
      params = { q: $input.city, key: $env.WEATHER_API_KEY }
    } as $weather
  }
  response = {
    city: $input.city,
    temperature: $weather.response.result.temp,
    conditions: $weather.response.result.conditions
  }
}
```

### Search Tool
```xs
tool "search_products" {
  instructions = "Search products by name or category."
  input {
    text query? { description = "Search term" }
    text category? { description = "Category filter" }
    int limit?=10 { description = "Max results (default 10)" }
  }
  stack {
    db.query "product" {
      where = $db.product.name includes? $input.query && $db.product.category ==? $input.category && $db.product.is_active == true
      return = { type: "list", paging: { page: 1, per_page: $input.limit } }
    } as $products
  }
  response = $products.items
}
```

### Create Record
```xs
tool "create_ticket" {
  instructions = "Create a support ticket for the customer."
  input {
    text subject filters=trim { description = "Ticket subject" }
    text description filters=trim { description = "Issue description" }
    enum priority?="medium" {
      description = "Ticket priority"
      values = ["low", "medium", "high", "urgent"]
    }
  }
  stack {
    db.add "ticket" {
      data = {
        subject: $input.subject,
        description: $input.description,
        priority: $input.priority,
        status: "open",
        created_at: now
      }
    } as $ticket
  }
  response = { ticket_id: $ticket.id, message: "Ticket created" }
}
```

### Composed Tool
```xs
tool "get_order_with_items" {
  instructions = "Get complete order details including all items."
  input {
    int order_id { description = "Order ID" }
  }
  stack {
    tool.call "get_order_status" {
      input = { order_id: $input.order_id }
    } as $order

    db.query "order_item" {
      where = $db.order_item.order_id == $input.order_id
    } as $items
  }
  response = {
    order: $order,
    items: $items
  }
}
```

---

## Error Handling

For complete error handling reference (preconditions, try-catch, throw, error types), see `xano_xanoscript_docs({ topic: "syntax" })`.

```xs
tool "cancel_order" {
  instructions = "Cancel an order. Only works for pending orders."
  input {
    int order_id { description = "Order to cancel" }
  }
  stack {
    db.get "order" {
      field_name = "id"
      field_value = $input.order_id
    } as $order

    precondition ($order != null) {
      error_type = "notfound"
      error = "Order not found"
    }

    precondition ($order.status == "pending") {
      error_type = "standard"
      error = "Only pending orders can be cancelled"
    }

    db.edit "order" {
      field_name = "id"
      field_value = $input.order_id
      data = { status: "cancelled" }
    } as $updated
  }
  response = { success: true, order_id: $input.order_id }
}
```

---

## Best Practices

1. **Write clear instructions** - This is what the AI reads to understand the tool
2. **Describe all inputs** - Help AI construct valid requests
3. **Use enums for fixed options** - Reduces AI errors; keep tools focused to one task

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `agents` | AI agents that use tools |
| `mcp-servers` | MCP servers that expose tools; elicitation and progress |
| `prompts` | MCP prompts |
| `resources` | MCP resources |
| `functions` | Similar structure to tools |
| `types` | Input type definitions |
