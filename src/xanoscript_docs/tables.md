---
applyTo: "tables/*.xs"
---

# Tables

Database table definitions in XanoScript.

## Quick Reference

```xs
table "<name>" {
  auth = false                    // true if used for authentication
  schema {
    int id                        // Primary key (required)
    text name filters=trim
    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
}
```

### Field Types

`int`, `text`, `email`, `password`, `decimal`, `bool`, `timestamp`, `date`, `uuid`, `vector`, `json`, `image`, `video`, `audio`, `attachment`, `enum`

### Index Types

`primary`, `btree`, `btree|unique`, `gin`

---

## Basic Structure

Every table requires an `id` field as the primary key:

```xs
table "user" {
  auth = true
  schema {
    int id
    text name filters=trim
    email email filters=trim|lower {
      sensitive = true
    }
    password password
    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "email"}]}
  ]
}
```

---

## Schema Fields

### Basic Fields

```xs
schema {
  int id
  text name
  decimal price
  bool is_active
  timestamp created_at
  date birth_date
}
```

### Optional & Defaults

```xs
schema {
  text nickname?                   // Optional, no default
  timestamp created_at?=now        // Optional, defaults to current time
  bool is_active?=true             // Optional, defaults to true
  int status?=0                    // Optional, defaults to 0
}
```

### With Filters

```xs
schema {
  text name filters=trim
  email email filters=trim|lower
  int quantity filters=min:0
  text category filters=trim|lower
}
```

### With Metadata

```xs
schema {
  text ssn {
    description = "Social Security Number"
    sensitive = true
  }
  email email filters=lower {
    description = "Primary contact email"
    sensitive = true
  }
}
```

### Foreign Keys

```xs
schema {
  int user_id {
    table = "user"
    description = "Reference to user table"
  }
  uuid order_id {
    table = "order"
  }
}
```

### Enum Fields

```xs
schema {
  enum status {
    values = ["pending", "active", "completed", "cancelled"]
  }
  enum priority?="medium" {
    values = ["low", "medium", "high"]
  }
}
```

### JSON Fields

```xs
schema {
  json metadata
  json settings?={}
}
```

### Vector Fields

```xs
schema {
  vector embedding              // Required vector field
  vector? embeddings? {         // Optional vector field with explicit size
    size = 768
  }
}
```

The `size` parameter specifies the vector dimensions (must match your embedding model's output). Pair with a vector index for similarity search (see [Vector Index](#vector-index) below).

---

## Indexes

### Primary Key

```xs
index = [
  {type: "primary", field: [{name: "id"}]}
]
```

### B-tree Index

```xs
index = [
  {type: "btree", field: [{name: "email", op: "asc"}]}
  {type: "btree", field: [{name: "created_at", op: "desc"}]}
]
```

### Unique Index

```xs
index = [
  {type: "btree|unique", field: [{name: "email"}]}
  {type: "btree|unique", field: [{name: "username"}]}
]
```

### Composite Index

```xs
index = [
  {type: "btree", field: [{name: "user_id"}, {name: "created_at", op: "desc"}]}
]
```

### GIN Index (for JSON/arrays)

```xs
index = [
  {type: "gin", field: [{name: "tags", op: "jsonb_path_op"}]}
  {type: "gin", field: [{name: "metadata", op: "jsonb_path_op"}]}
]
```

### Full-Text Search Index

```xs
index = [
  {
    name : "search_content"
    lang : "english"
    type : "search"
    field: [{name: "searchable_content", op: "A"}]
  }
]
```

### Vector Index

```xs
index = [
  {type: "vector", field: [{name: "embeddings", op: "vector_cosine_ops"}]}
]
```

Required for vector similarity searches via `cosine_distance` in `db.query`. PostgreSQL vector indexes only support ascending scans, so queries must sort by distance `asc` to use the index. Sorting `desc` will bypass the index and trigger a full table scan. See [database.md](database.md) for query usage.

---

## Complete Examples

### User Table (with auth)

```xs
table "user" {
  auth = true
  schema {
    int id
    text name filters=trim
    email email filters=trim|lower { sensitive = true }
    password password { sensitive = true }
    enum role?="user" { values = ["user", "admin", "moderator"] }
    bool is_active?=true
    timestamp created_at?=now
    timestamp updated_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "email"}]}
    {type: "btree", field: [{name: "role"}]}
  ]
}
```

### Product Table

```xs
table "product" {
  auth = false
  schema {
    int id
    text name filters=trim
    text description?
    decimal price filters=min:0
    int stock_quantity?=0 filters=min:0
    int category_id { table = "category" }
    json metadata?
    bool is_published?=false
    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "category_id"}]}
    {type: "btree", field: [{name: "is_published"}]}
  ]
}
```

### Order with Foreign Keys

```xs
table "order" {
  auth = false
  schema {
    int id
    int user_id { table = "user" }
    decimal total filters=min:0
    enum status?="pending" { values = ["pending", "processing", "shipped", "delivered", "cancelled"] }
    json shipping_address
    timestamp created_at?=now
    timestamp updated_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
```

---

## Best Practices

1. **Always define `id`** - Every table needs a primary key named `id`
2. **Use `auth = true`** only for authentication tables (typically just `user`)
3. **Add indexes** for fields used in WHERE clauses and JOINs
4. **Use appropriate types** - `email` for emails, `password` for credentials
5. **Default timestamps** - Use `?=now` for created_at fields
