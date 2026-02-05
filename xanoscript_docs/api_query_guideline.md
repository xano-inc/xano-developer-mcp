---
applyTo: "apis/**/*.xs"
---

# How to Define API Queries in XanoScript

An **API query** in XanoScript defines an endpoint for handling HTTP requests (GET, POST, etc.). Queries are created in the `apis/<api-group>/` folder, where `<api-group>` is the name of your API group. Queries cannot have subfolders; each query belongs to its API group.

## Query Structure

A query file consists of:

- The query name and HTTP verb (e.g., `products verb=GET`)
- An optional `description` field
- An `input` block for request parameters
- A `stack` block for processing logic
- A `response` block for returned data

## Authentication

By default a query will be public. To require authentication, add an `auth` field with the name of the table to use for authentication (this would usually be a `user` table). When `auth` is set, the variable `$auth.id` will contain the authenticated user's ID. Xano offers built-in JWT authentication endpoint to signup, login and retrieve your user information. Endpoints requiring authentication expect the JWT token to be sent in the `Authorization` header as a Bearer token.

## Example Query

The following script would be stored in `apis/product/products.xs`, which means its API group would be `product`. It requires authentication and returns a list of products filtered by category.

```xs
query "products" verb=GET {
  description = "Returns a list of products filtered by category, requires user authentication"
  auth = "user"

  input {
    text category filters=trim {
      description = "Product category to filter by"
    }
  }
  stack {
    var $category_filter {
      value = $input.category
    }
    conditional {
      if (($category_filter|strlen) > 0) {
        db.query "product" {
          where = ($db.product.category|to_lower) == ($category_filter|to_lower)
        } as $filtered_products
      }
      else {
        db.query "product" {
        } as $filtered_products
      }
    }
  }
  response = $filtered_products
}
```

## Input Block

Defines the parameters accepted by the API endpoint. You can specify:

- Data types (`int`, `text`, `decimal`, etc.)
- Optional fields (add `?`)
- Filters (e.g., `trim`, `lower`)
- Metadata (`description`, `sensitive`)

**Example:**

```xs
input {
  int page?=1 {
    description = "Page number for pagination"
  }
  int per_page?=10 {
    description = "Items per page"
  }
}
```

## Stack Block

Contains the logic for processing the request, such as:

- Variable declarations (`var`)
- Control flow (`conditional`, `for`, `foreach`)
- Database operations (`db.query`, `db.add`)
- Function calls (`function.run`)
- Logging (`debug.log`)
- Error handling (`throw`, `try_catch`)

## Response Content Type

By default the response type is "application/json", to return a web page set the response type to "text/html" using the `util.set_header` statement:

```xs
  util.set_header {
    value = "Content-Type: text/html; charset=utf-8"
    duplicates = "replace"
  }
```

## Response Block

Specifies the data returned by the API. The value can be a variable, object, or expression.

**Example:**

```xs
response = $filtered_products
```

## Best Practices

- Use `description` for documentation.
- Validate inputs with filters and `precondition` blocks.
- Place all logic inside the `stack` block.
- Always define a `response` block for output.
- Use pagination and sorting for large datasets.

## Summary

- Always place a query in under an API group folder.
- To create a new API group, just create a folder under `apis/`.
- Place queries in the `apis/<api-group>/` folder.
- Use `input` for request parameters.
- Use `stack` for processing logic.
- Use `response` for returned data.
- Document your query with `description` fields.

For more examples, see the documentation or sample queries in your
