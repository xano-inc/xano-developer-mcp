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
  auth = "<table>"              // Optional: require authentication
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
api_group "users" {
  canonical = "users"                // Required: URL path segment
  description = "User management"    // Optional
}
```

### File Structure
```
apis/
├── users/
│   ├── api_group.xs            // Defines group (canonical = "users")
│   ├── list.xs                 // GET /users/list
│   └── by-id.xs                // GET/PATCH/DELETE /users/{id}
└── products/
    ├── api_group.xs            // Defines group (canonical = "products")
    └── search.xs               // GET /products/search
```

Full URL: `/<canonical>/<query name>` (e.g., `/users/profile`)

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

For complete type and filter reference, use `xanoscript_docs({ keyword: "input" })`.

### Empty Input Blocks

**CRITICAL:** When an endpoint has no input parameters, the input block braces MUST be on separate lines. `input {}` on a single line will cause parsing errors.

```xs
// CORRECT - braces on separate lines
query "health" verb=GET {
  api_group = "System"
  input {
  }
  stack { ... }
  response = { status: "ok" }
}

// WRONG - causes parsing errors
input {}
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
```xs
query "profile" verb=GET {
  api_group = "Users"
  auth = "user"                 // Requires valid JWT
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
- Endpoint requires Bearer token in `Authorization` header
- `$auth.id` contains authenticated user's ID
- Invalid/missing token returns 401

---

## Path Parameters

Use `{param}` in the path:

```xs
query "users/{user_id}" verb=GET {
  api_group = "Users"
  auth = "user"
  input {
    int user_id { table = "user" }
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
        var.update $updates { value = $updates|set:"name":$input.name }
      }
    }
    conditional {
      if ($input.price != null) {
        var.update $updates { value = $updates|set:"price":$input.price }
      }
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

For complete error handling reference, use `xanoscript_docs({ keyword: "syntax" })`.

| Type | HTTP Status |
|------|-------------|
| `inputerror` | 400 | `accessdenied` | 403 | `notfound` | 404 | `standard` | 500 |

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
