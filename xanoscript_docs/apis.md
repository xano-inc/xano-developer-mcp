---
applyTo: "apis/**/*.xs"
---

# APIs

HTTP endpoint definitions in XanoScript.

## Quick Reference

```xs
query "<path>" verb=<METHOD> {
  description = "What this endpoint does"
  auth = "<table>"              # Optional: require authentication
  input { ... }
  stack { ... }
  response = $result
}
```

### HTTP Methods
`GET`, `POST`, `PUT`, `PATCH`, `DELETE`

### API Groups (Required)

Every API endpoint **must** belong to an API group. An API group is a folder within `apis/` that organizes related endpoints together.

- API groups appear as top-level folders under `apis/`
- Each group **must** have an `api_group.xs` file that defines the group
- The group contains `.xs` files defining individual endpoints
- The group name becomes part of the endpoint URL path
- You cannot create endpoints directly in the `apis/` root folder

#### Defining an API Group

Create an `api_group.xs` file in the group folder:

```xs
api_group "users" {
  description = "User management endpoints"
}
```

#### API Group Properties

| Property | Description |
|----------|-------------|
| `description` | What this API group contains |
| `canonical` | Optional: custom URL path (overrides folder name) |

```xs
api_group "events" {
  canonical = "events-api"           # URL will use /events-api instead of /events
}
```

### File Structure
```
apis/
├── users/                      # API group folder
│   ├── api_group.xs            # Required: defines the group
│   ├── list.xs                 # GET /users
│   ├── create.xs               # POST /users
│   └── {id}.xs                 # GET/PATCH/DELETE /users/{id}
└── products/                   # Another API group
    ├── api_group.xs            # Required: defines the group
    └── search.xs               # GET /products/search
```

> **Note:** Files placed directly in `apis/` without a group folder are invalid. Each API group folder must contain an `api_group.xs` file.

---

## Basic Structure

```xs
query "products" verb=GET {
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

## Authentication

### Public Endpoint (default)
```xs
query "status" verb=GET {
  stack { }
  response = { status: "ok" }
}
```

### Authenticated Endpoint
```xs
query "profile" verb=GET {
  auth = "user"                 # Requires valid JWT
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $auth.id    # User ID from token
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

### Preconditions
```xs
stack {
  precondition ($input.amount > 0) {
    error_type = "inputerror"
    error = "Amount must be positive"
  }

  precondition ($user != null) {
    error_type = "notfound"
    error = "User not found"
  }

  precondition ($user.id == $auth.id) {
    error_type = "accessdenied"
    error = "Not authorized"
  }
}
```

### Error Types
| Type | HTTP Status |
|------|-------------|
| `inputerror` | 400 Bad Request |
| `accessdenied` | 403 Forbidden |
| `notfound` | 404 Not Found |
| `standard` | 500 Internal Server Error |

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

1. **RESTful design** - Use appropriate HTTP methods
2. **Consistent naming** - Use lowercase, hyphens for multi-word paths
3. **Authenticate sensitive operations** - Always auth for writes
4. **Validate inputs** - Use filters and preconditions
5. **Return appropriate errors** - Use correct error types
6. **Paginate lists** - Never return unbounded lists
7. **Document with description** - Explain what endpoint does
8. **Group related endpoints** - Organize by resource in api groups
