# Tool API

Tools are functions that AI agents can call to perform actions. They extend agent capabilities by allowing them to interact with databases, external APIs, and perform computations.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/tool` | List tools |
| GET | `/workspace/{workspace_id}/tool/{tool_id}` | Get tool |
| POST | `/workspace/{workspace_id}/tool` | Create tool |
| PUT | `/workspace/{workspace_id}/tool/{tool_id}` | Update tool |
| DELETE | `/workspace/{workspace_id}/tool/{tool_id}` | Delete tool |
| PUT | `/workspace/{workspace_id}/tool/{tool_id}/security` | Update security |

---

## List Tools

```
GET /workspace/{workspace_id}/tool
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label |
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `search` | text | "" | Search filter |
| `sort` | enum | "created_at" | Sort field |
| `order` | enum | "desc" | Sort order |

---

## Get Tool

```
GET /workspace/{workspace_id}/tool/{tool_id}
```

Returns tool definition including XanoScript.

---

## Create Tool

```
POST /workspace/{workspace_id}/tool
```

**Content-Type:** `text/x-xanoscript`

**Query Parameters:**
- `branch` (text): Target branch label

### XanoScript Tool Syntax

Tools follow the same syntax as functions, with input, stack, and response sections:

```xanoscript
tool foo {
  input {
    int score
  }

  stack {
    var $x1 {
      value = $input.score + 1
    }
  }

  response = $x1
}
```

### Input Section

Define parameters the agent can pass to the tool. Include descriptions for AI understanding:

```xanoscript
input {
  text user_id {
    description = "The user's unique identifier"
  }
  text query {
    description = "Search query string"
  }
}
```

### Stack Section

The logic that executes when the tool is called:

```xanoscript
stack {
  db.query user {
    where = $db.user.id == $input.user_id
    return = {type: "single"}
  }
}
```

### Example: Database Lookup Tool

```xanoscript
tool get_user_orders {
  input {
    int user_id {
      description = "The ID of the user to look up orders for"
    }
    int limit? {
      description = "Maximum number of orders to return"
      default = 10
    }
  }

  stack {
    db.query order {
      where = $db.order.user_id == $input.user_id
      limit = $input.limit
      order = {created_at: "desc"}
      return = {type: "list"}
    }
  }

  response = $order
}
```

### Example: External API Tool

```xanoscript
tool search_products {
  input {
    text query {
      description = "Product search query"
    }
  }

  stack {
    external.api_call {
      url = "https://api.example.com/search"
      method = "GET"
      params = {q: $input.query}
    }
  }

  response = $api_result
}
```

### Example: Data Processing Tool

```xanoscript
tool calculate_statistics {
  input {
    int[] values {
      description = "Array of numbers to analyze"
    }
  }

  stack {
    var $sum { value = sum($input.values) }
    var $count { value = count($input.values) }
    var $avg { value = $sum / $count }
    var $min { value = min($input.values) }
    var $max { value = max($input.values) }
  }

  response = {
    sum: $sum,
    count: $count,
    average: $avg,
    min: $min,
    max: $max
  }
}
```

---

## Update Tool

```
PUT /workspace/{workspace_id}/tool/{tool_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately

**Content-Type:** `text/x-xanoscript`

---

## Delete Tool

```
DELETE /workspace/{workspace_id}/tool/{tool_id}
```

**Warning:** This action cannot be undone. Any agents using this tool will no longer have access to it.

---

## Update Tool Security

```
PUT /workspace/{workspace_id}/tool/{tool_id}/security
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | text | Yes | New security GUID |
