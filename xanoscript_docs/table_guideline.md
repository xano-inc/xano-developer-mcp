---
applyTo: "tables/*.xs"
---

# How to Define Tables in XanoScript

A **table** in XanoScript defines the structure of a database table, including its fields, types, relationships, and indexes. Tables are created in the `tables` folder and are essential for organizing and storing data in your application.

## Built-in tables

Most of the time, a `user` table with user name, email, and password (hashed) will already be present in the Xano workspace (`tables/<table_id>_user.xs`), and is already used by the authentication system. You can customize it by adding fields to it, indexes, and relationships as needed.

## Table Structure

A table file consists of:

- The table name (e.g., `order`, `product`)
- A `schema` block listing all fields and their properties
- An `index` block for efficient querying
- Optional `auth`, indicating that this table can be used for authentication by an API endpoint, meaning the `id` contained in the auth token can be matched against the `id` field in this table (usually this is only set for a `user` table)

## Example Table

!!! IMPORTANT !!!
EACH TABLE SHOULD HAVE AN `id` FIELD, THIS IS THE PRIMARY KEY, IT CAN EITHER BE AN INT OR A UUID, IT SHOULD BE NAMED `id` AND IT SHOULD BE THE PRIMARY KEY.
!!! IMPORTANT !!!

The following xanoscript would be stored in `tables/user.xs`

```xs
table "shopping_cart_items" {
  auth = false
  schema {
    int id {
      description = "Unique identifier for the cart item"
    }

    int user_id {
      table = "user"
      description = "ID of the user who owns the cart"
    }

    int product_id {
      table = "product"
      description = "ID of the product added to the cart"
    }

    int quantity filters=min:0 {
      description = "Quantity of the product in the cart (non-negative)"
    }

    decimal unit_price filters=min:0 {
      description = "Unit price of the product (non-negative)"
    }

    timestamp last_updated?=now {
      description = "Timestamp of the last update to the cart item"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree"
      field: [{name: "user_id"}, {name: "product_id"}]
    }
  ]
}
```

## Field Types

Supported types for table columns include:

- `int` (integer)
- `text`
- `email`
- `password`
- `decimal`
- `bool`
- `timestamp`
- `date`
- `uuid`
- `vector`
- `json`
- `image`
- `video`
- `audio`
- `attachment`
- `enum`

## Field Options

Each field can have:

- **Optional status**: Add `?` for optional fields, e.g., `text nickname?`
- **Default value**: Use `?=value`, e.g., `timestamp created_at?=now`
- **Filters**: Process input, e.g., `filters=trim|lower`
- **Metadata**: Add `description` or `sensitive` for documentation and privacy
- **Relationships**: Reference another table with `table`, e.g., `int user_id { table = "user" }`

## Indexes

Indexes improve query performance and enforce uniqueness. Common types:

- `primary`: Main identifier (usually `id`)
- `btree`: Standard index, can be unique
- `gin`: For JSON or array fields
- `unique`: Ensures values are not duplicated

**Example:**

```xs
index = [
  {type: "primary", field: [{name: "id"}]}
  {type: "btree|unique", field: [{name: "email", op: "asc"}]}
]
```

## Best Practices

- Use `description` for every field to document its purpose.
- Mark sensitive fields with `sensitive = true`.
- Use filters to clean and normalize data.
- Define indexes for fields that are searched or must be unique.
- Reference related tables using `table` for foreign keys.

## Summary

- Place tables in the `tables` folder.
- Use the `schema` block for fields and types.
- Add `index` for performance and uniqueness.
- Use metadata and filters for clarity and data integrity.
- Reference other tables for relationships.
- Use `auth = true` for tables used in authentication, for most table use cases, this should be set to `false`.

For more examples, see the documentation or sample tables in your
