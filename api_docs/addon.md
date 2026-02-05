# Addon API

Addons are reusable query components that can be attached to API responses to transform or enrich data. They're commonly used for joining related data or formatting output.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/addon` | List addons |
| GET | `/workspace/{workspace_id}/addon/{addon_id}` | Get addon |
| POST | `/workspace/{workspace_id}/addon` | Create addon |
| PUT | `/workspace/{workspace_id}/addon/{addon_id}` | Update addon |
| DELETE | `/workspace/{workspace_id}/addon/{addon_id}` | Delete addon |
| PUT | `/workspace/{workspace_id}/addon/{addon_id}/security` | Update security |

---

## List Addons

```
GET /workspace/{workspace_id}/addon
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

## Get Addon

```
GET /workspace/{workspace_id}/addon/{addon_id}
```

Returns addon definition including XanoScript.

---

## Create Addon

```
POST /workspace/{workspace_id}/addon
```

**Content-Type:** `text/x-xanoscript`

**Query Parameters:**
- `branch` (text): Target branch label

### XanoScript Addon Syntax

```xanoscript
addon foo {
  input {
    int foo_id {
      dbtable = "foo"
    }
  }

  stack {
    db.query foo {
      where = $db.foo.id == $input.foo_id
      return = {type: "single"}
    }
  }
}
```

### Input Section

Define input parameters that link to database fields:

```xanoscript
input {
  int user_id {
    dbtable = "user"  // Links to user table
  }
}
```

The `dbtable` property specifies which table field to join on.

### Stack Section

Query logic to fetch related data:

```xanoscript
stack {
  db.query user {
    where = $db.user.id == $input.user_id
    return = {type: "single"}
  }
}
```

### Use Cases

- Join related data (e.g., fetch author for a post)
- Computed fields
- Data aggregation
- Response transformation

### Example: Author Addon

```xanoscript
addon author_info {
  input {
    int author_id {
      dbtable = "user"
    }
  }

  stack {
    db.query user {
      select = ["id", "name", "avatar"]
      where = $db.user.id == $input.author_id
      return = {type: "single"}
    }
  }
}
```

### Example: Order Summary Addon

```xanoscript
addon order_summary {
  input {
    int order_id {
      dbtable = "order"
    }
  }

  stack {
    // Get order items
    db.query order_item {
      where = $db.order_item.order_id == $input.order_id
      return = {type: "list"}
    }

    // Calculate totals
    var $item_count {
      value = count($order_item)
    }

    var $total {
      value = sum($order_item, "price")
    }
  }
}
```

---

## Update Addon

```
PUT /workspace/{workspace_id}/addon/{addon_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately

**Content-Type:** `text/x-xanoscript`

---

## Delete Addon

```
DELETE /workspace/{workspace_id}/addon/{addon_id}
```

**Warning:** This action cannot be undone.

---

## Update Addon Security

```
PUT /workspace/{workspace_id}/addon/{addon_id}/security
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | text | Yes | New security GUID |
