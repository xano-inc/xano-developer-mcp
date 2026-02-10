---
applyTo: "apis/**/*.xs"
---

# APIs

HTTP endpoint definitions in XanoScript.

## Quick Reference

```xs
query "endpoint-path" verb=<METHOD> {
  api_group = "<GroupName>"     // Required: API group for organization
  description = "What this endpoint does"
  auth = "<table>"              // Optional: table with auth = true (usually "user")
  input { ... }
  stack { ... }
  response = $result
}
```

### Query Name (Required, Non-Empty)

The query name is **required** and **must be a non-empty string**. Empty names (`query "" verb=...`) are invalid. The name defines the endpoint path after the API group canonical.

**Full URL path structure:**

```
/<api_group canonical>/<query name>
```

The query name can include slashes for nested paths:

- `query "list" verb=GET` → `/<canonical>/list`
- `query "users/{id}" verb=GET` → `/<canonical>/users/{id}`
- `query "admin/reports/daily" verb=GET` → `/<canonical>/admin/reports/daily`

### HTTP Methods

`GET`, `POST`, `PUT`, `PATCH`, `DELETE`

### API Groups (Required)

Every endpoint must belong to an API group. Each group is a folder with an `api_group.xs` file:

```xs
// Minimal definition
api_group "users" {
  canonical = "myapp-users"          // Required: URL path segment (unique at instance level)
  description = "User management"    // Optional
}
```

**Full definition with all options:**

```xs
api_group Authentication {
  active = false                     // Disable group (cannot be externally invoked)
  canonical = "plmgzl-s"            // Required: unique at instance level
  swagger = {token: "cbO83nMTt7BVgq3QcQgKikDfHeo"}  // Protect Swagger docs behind a token (plain text)
  tags = ["auth", "security", "encrypted"]           // Tags for organization
  history = 100                      // Request history: up to 100 statements per request
}
```

| Property      | Type   | Required | Description                                                                 |
| ------------- | ------ | -------- | --------------------------------------------------------------------------- |
| `canonical`   | text   | Yes      | URL path segment, must be unique at the instance level                      |
| `description` | text   | No       | Human-readable description                                                  |
| `active`      | bool   | No       | Whether the group accepts external requests (default: `true`)               |
| `swagger`     | object | No       | Swagger documentation settings. `token` protects access (stored plain text) |
| `tags`        | list   | No       | Tags for organization and filtering                                         |
| `history`     | int    | No       | Max number of statements recorded per request for debugging                 |

**Canonical uniqueness:** A Xano instance can host multiple workspaces. The `canonical` is used to route requests between workspaces and must be **unique at the instance level**, not just within your workspace. Use a descriptive, project-specific prefix to avoid collisions (e.g., `myapp-users` instead of `users`). A generic name like `user` is likely to conflict with another workspace's canonical on the same instance.

### File Structure

```
apis/
├── users/
│   ├── api_group.xs            // Defines group (canonical = "myapp-users")
│   ├── list.xs                 // GET /myapp-users/list
│   └── by-id.xs                // GET/PATCH/DELETE /myapp-users/{id}
└── products/
    ├── api_group.xs            // Defines group (canonical = "myapp-products")
    └── search.xs               // GET /myapp-products/search
```

Full URL: `/<canonical>/<query name>` (e.g., `/myapp-users/profile`)

---

## Basic Structure

```xs
query "products" verb=GET {
  api_group = "Products"
  description = "List all products"
  input {
    int page?=1 filters=min:1
    int per_page?=20 filters=min:1|max:100
  }
  stack {
    db.query "product" {
      return = { type: "list", paging: { page: $input.page, per_page: $input.per_page } }
    } as $products
  }
  response = $products
}
```

---

## Input Block

For complete type and filter reference, use `xanoscript_docs({ topic: "types" })`.

### Empty and Single-Input Blocks

Empty input blocks and single-input blocks can be written as one-liners. When there are two or more inputs, each must be on its own line.

```xs
// OK - empty input
query "health" verb=GET {
  api_group = "System"
  input {}
  stack { ... }
  response = { status: "ok" }
}

// OK - single input as one-liner
input { text query filters=trim }

// WRONG - multiple inputs on one line will cause parsing errors
input { text query filters=trim int limit }
```

---

## Authentication

### Public Endpoint (default)

```xs
query "status" verb=GET {
  api_group = "System"
  stack { }
  response = { status: "ok" }
}
```

### Authenticated Endpoint

The `auth` attribute references a table that has `auth = true` in its definition (see [tables.md](tables.md)). This is typically the `user` table. While multiple auth tables are supported, it's recommended to use a single auth table and control access levels with a role flag or RBAC pattern.

```xs
query "profile" verb=GET {
  api_group = "Users"
  auth = "user"                 // Must reference a table with auth = true
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $auth.id    // User ID from token
    } as $user
  }
  response = $user
}
```

When `auth` is set:

- The referenced table must have `auth = true` in its table definition
- Endpoint requires Bearer token in `Authorization` header
- `$auth.id` contains authenticated user's ID
- Invalid/missing token returns 401

---

## Path Parameters

Use `{param}` in the path and capture its value in the input block:

```xs
query "users/{user_id}" verb=GET {
  api_group = "Authentication"
  auth = "user"

  input {
    int user_id {
      table = "user"
    }
  }

  stack {
    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
    } as $user
  }

  response = $user
}
```

---

## CRUD Examples

### List (GET)

```xs
query "products" verb=GET {
  api_group = "Products"
  input {
    text category? filters=trim|lower
    int page?=1
    int per_page?=20
  }
  stack {
    db.query "product" {
      where = $db.product.category ==? $input.category
      sort = { created_at: "desc" }
      return = { type: "list", paging: { page: $input.page, per_page: $input.per_page } }
    } as $products
  }
  response = $products
}
```

### Create (POST)

```xs
query "products" verb=POST {
  api_group = "Products"
  auth = "user"
  input {
    text name filters=trim
    text description? filters=trim
    decimal price filters=min:0
    int category_id { table = "category" }
  }
  stack {
    db.add "product" {
      data = {
        name: $input.name,
        description: $input.description,
        price: $input.price,
        category_id: $input.category_id,
        created_by: $auth.id
      }
    } as $product
  }
  response = $product
}
```

### Read (GET with ID)

```xs
query "products/{product_id}" verb=GET {
  api_group = "Products"
  input {
    int product_id { table = "product" }
  }
  stack {
    db.get "product" {
      field_name = "id"
      field_value = $input.product_id
    } as $product

    precondition ($product != null) {
      error_type = "notfound"
      error = "Product not found"
    }
  }
  response = $product
}
```

### Update (PATCH)

```xs
query "products/{product_id}" verb=PATCH {
  api_group = "Products"
  auth = "user"
  input {
    int product_id { table = "product" }
    text name? filters=trim
    text description? filters=trim
    decimal price? filters=min:0
  }
  stack {
    var $updates { value = {} }

    conditional {
      if ($input.name != null) {
        var.update $updates.name { value = $input.name }
      }
    }
    conditional {
      if ($input.price != null) {
        var.update $updates.price { value = $input.price }
      }
    }

    precondition (($updates|is_empty) == false) {
      error = "No updates provided"
    }

    db.patch "product" {
      field_name = "id"
      field_value = $input.product_id
      data = $updates
    } as $product
  }
  response = $product
}
```

### Delete (DELETE)

```xs
query "products/{product_id}" verb=DELETE {
  api_group = "Products"
  auth = "user"
  input {
    int product_id { table = "product" }
  }
  stack {
    db.del "product" {
      field_name = "id"
      field_value = $input.product_id
    }
  }
  response = { success: true }
}
```

---

## Response Types

### JSON (default)

```xs
response = $data
```

### HTML

```xs
stack {
  util.set_header {
    value = "Content-Type: text/html; charset=utf-8"
    duplicates = "replace"
  }

  util.template_engine {
    value = """
      <html>
        <body><h1>{{ $var.title }}</h1></body>
      </html>
    """
  } as $html
}
response = $html
```

### Streaming

```xs
stack {
  api.stream { value = $processed_data }
}
response = null
```

---

## Custom Headers

```xs
stack {
  util.set_header {
    value = "X-Custom-Header: value"
    duplicates = "replace"
  }

  util.set_header {
    value = "Set-Cookie: session=abc123; HttpOnly; Secure"
    duplicates = "add"
  }
}
```

---

## Error Handling

For complete error handling reference, use `xanoscript_docs({ topic: "syntax" })`.

| Type           | HTTP Status |
| -------------- | ----------- |
| `inputerror`   | 400         |
| `accessdenied` | 403         |
| `notfound`     | 404         |
| `standard`     | 500         |

---

## Pagination Response Format

When using `return = { type: "list", paging: {...} }`:

```json
{
  "itemsReceived": 20,
  "curPage": 1,
  "nextPage": 2,
  "prevPage": null,
  "offset": 0,
  "perPage": 20,
  "items": [...]
}
```

---

## Best Practices

1. **RESTful design** - Use appropriate HTTP methods for operations
2. **Consistent naming** - Use lowercase, hyphens for multi-word paths
3. **Authenticate writes** - Always require auth for POST/PATCH/DELETE
4. **Paginate lists** - Never return unbounded result sets
5. **Group by resource** - Organize endpoints in logical api groups
6. **Use specific canonicals** - Prefix canonicals to avoid instance-level collisions (e.g., `myapp-users` not `users`)
