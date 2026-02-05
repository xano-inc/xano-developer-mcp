# Function API

Functions are reusable code blocks that can be called from API endpoints, tasks, triggers, and other functions. They are defined using XanoScript.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/function` | List functions |
| GET | `/workspace/{workspace_id}/function/{function_id}` | Get function |
| POST | `/workspace/{workspace_id}/function` | Create function |
| PUT | `/workspace/{workspace_id}/function/{function_id}` | Update function |
| DELETE | `/workspace/{workspace_id}/function/{function_id}` | Delete function |
| PUT | `/workspace/{workspace_id}/function/{function_id}/security` | Update security |

---

## List Functions

```
GET /workspace/{workspace_id}/function
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label |
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `search` | text | "" | Search filter |
| `sort` | enum | "created_at" | Sort: "created_at", "updated_at", "name" |
| `order` | enum | "desc" | Sort order |

---

## Get Function

```
GET /workspace/{workspace_id}/function/{function_id}
```

Returns function definition including XanoScript.

---

## Create Function

```
POST /workspace/{workspace_id}/function
```

**Content-Type:** `text/x-xanoscript`

**Query Parameters:**
- `branch` (text): Target branch label

### XanoScript Function Syntax

```xanoscript
function foo {
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

Define input parameters:

```xanoscript
input {
  int required_param
  text optional_param?
  bool param_with_default? default = true
}
```

| Modifier | Syntax | Description |
|----------|--------|-------------|
| Required | `type name` | Parameter is required |
| Optional | `type name?` | Parameter is nullable |
| Default | `default = value` | Provides default value |

### Stack Section

The function logic using XanoScript statements:

```xanoscript
stack {
  // Variable assignment
  var $result {
    value = $input.score * 2
  }

  // Database queries
  db.query user {
    where = $db.user.id == $input.user_id
    return = {type: "single"}
  }

  // Conditional logic
  if $input.score > 10 {
    var $bonus {
      value = 100
    }
  }

  // Loops
  foreach $items as $item {
    // Process each item
  }
}
```

### Response

Define what the function returns:

```xanoscript
response = $result
```

### Complete Example

```xanoscript
function calculate_discount {
  input {
    float price
    int quantity
    text coupon_code?
  }

  stack {
    var $base_discount {
      value = 0
    }

    // Volume discount
    if $input.quantity > 10 {
      var $base_discount {
        value = 0.1
      }
    }

    // Coupon lookup
    if $input.coupon_code != null {
      db.query coupon {
        where = $db.coupon.code == $input.coupon_code
        return = {type: "single"}
      }

      if $coupon != null {
        var $base_discount {
          value = $base_discount + $coupon.discount
        }
      }
    }

    var $final_price {
      value = $input.price * $input.quantity * (1 - $base_discount)
    }
  }

  response = {
    original: $input.price * $input.quantity,
    discount: $base_discount,
    final: $final_price
  }
}
```

---

## Update Function

```
PUT /workspace/{workspace_id}/function/{function_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately

**Content-Type:** `text/x-xanoscript`

Send complete function definition.

---

## Delete Function

```
DELETE /workspace/{workspace_id}/function/{function_id}
```

**Warning:** This action cannot be undone. Any code calling this function will fail.

---

## Update Function Security

```
PUT /workspace/{workspace_id}/function/{function_id}/security
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | text | Yes | New security GUID |
