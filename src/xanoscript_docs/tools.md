---
applyTo: "tools/**/*.xs"
---

# Tools

Functions that AI agents and MCP servers can execute.

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

**Important:** `instructions` and input `description` fields are sent to the AI. Write them clearly.

---

## Input Block

For complete type reference, use `xanoscript_docs({ topic: "types" })`. For tools, input `description` fields are sent to the AI, so write them clearly:

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

## Tool-Specific Statements

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
      where = $db.product.name includes? $input.query
        && $db.product.category ==? $input.category
        && $db.product.is_active == true
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

For complete error handling reference (preconditions, try-catch, throw, error types), see `xanoscript_docs({ topic: "syntax" })`.

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
3. **Use enums for fixed options** - Reduces AI errors
4. **Keep tools focused** - One task per tool
5. **Limit response size** - Don't return huge datasets
