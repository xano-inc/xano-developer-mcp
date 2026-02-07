---
applyTo: "functions/**/*.xs, apis/**/*.xs, tasks/*.xs, tools/**/*.xs"
---

# Database Operations

Complete reference for XanoScript database operations.

## Quick Reference

| Operation | Purpose | Returns |
|-----------|---------|---------|
| `db.query` | Query multiple records | List/single/count/exists |
| `db.get` | Get single record by field | Record or null |
| `db.has` | Check if record exists | Boolean |
| `db.add` | Insert new record | Created record |
| `db.edit` | Update record (inline data) | Updated record |
| `db.patch` | Update record (variable data) | Updated record |
| `db.add_or_edit` | Upsert record | Record |
| `db.del` | Delete record | None |
| `db.truncate` | Delete all records | None |

---

## db.query

Query multiple records with filters, sorting, and pagination.

### Basic Query
```xs
db.query "product" {
  where = $db.product.is_active == true
} as $products
```

### Where Operators
```xs
// Comparison
$db.product.price == 100
$db.product.price != 0
$db.product.price > 50
$db.product.price >= 50
$db.product.price < 100
$db.product.price <= 100

// Null-safe (ignore if value is null)
$db.product.category ==? $input.category
$db.product.price >=? $input.min_price

// String matching
$db.product.name includes "phone"       // Contains substring
$db.product.tags contains "featured"    // Array contains value
$db.product.tags not contains "hidden"

// Array overlap
$db.product.tags overlaps ["a", "b"]
$db.product.tags not overlaps ["x", "y"]

// Combining conditions
$db.product.is_active == true && $db.product.price > 0
$db.product.category == "electronics" || $db.product.featured == true
```

### Return Types
```xs
// List (default)
db.query "product" {
  return = { type: "list" }
} as $products

// With pagination
db.query "product" {
  return = {
    type: "list",
    paging: { page: $input.page, per_page: 25, totals: true }
  }
} as $products

// Single record
db.query "product" {
  where = $db.product.sku == $input.sku
  return = { type: "single" }
} as $product

// Count
db.query "product" {
  where = $db.product.is_active == true
  return = { type: "count" }
} as $count

// Exists
db.query "product" {
  where = $db.product.email == $input.email
  return = { type: "exists" }
} as $exists
```

### Sorting
```xs
db.query "product" {
  sort = { created_at: "desc" }         // Descending
  sort = { name: "asc" }                // Ascending
  sort = { id: "rand" }                 // Random
} as $products
```

### Joins
```xs
db.query "comment" {
  join = {
    post: {
      table: "post",
      type: "inner",                    // inner, left, right
      where: $db.comment.post_id == $db.post.id
    }
  }
  where = $db.post.author_id == $auth.id
} as $comments
```

### Eval (Computed Fields)
```xs
db.query "order" {
  join = {
    user: { table: "user", where: $db.order.user_id == $db.user.id }
  }
  eval = {
    user_name: $db.user.name,
    user_email: $db.user.email
  }
} as $orders
```

### Addons (Related Data)
```xs
db.query "post" {
  where = $db.post.author_id == $auth.id
  addon = [
    { name: "comment_count", input: { post_id: $output.id }, as: "items.comments" }
  ]
} as $posts
```

---

## db.get

Get a single record by field value.

```xs
db.get "user" {
  field_name = "id"
  field_value = $input.user_id
} as $user

db.get "user" {
  field_name = "email"
  field_value = $input.email
} as $user
```

---

## db.has

Check if a record exists.

```xs
db.has "user" {
  field_name = "email"
  field_value = $input.email
} as $exists

conditional {
  if ($exists) {
    throw { name = "DuplicateError", value = "Email already registered" }
  }
}
```

---

## db.add

Insert a new record.

```xs
db.add "product" {
  data = {
    name: $input.name,
    price: $input.price,
    category_id: $input.category_id,
    created_at: now
  }
} as $product
```

---

## db.edit

Update a record with inline data object.

```xs
db.edit "product" {
  field_name = "id"
  field_value = $input.product_id
  data = {
    name: $input.name,
    price: $input.price,
    updated_at: now
  }
} as $product
```

---

## db.patch

Update a record with a variable data object. Preferred for dynamic updates.

```xs
var $updates { value = { updated_at: now } }

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
```

---

## db.add_or_edit

Upsert: insert if not exists, update if exists.

```xs
db.add_or_edit "setting" {
  field_name = "key"
  field_value = $input.key
  data = {
    key: $input.key,
    value: $input.value,
    updated_at: now
  }
} as $setting
```

---

## db.del

Delete a record.

```xs
db.del "product" {
  field_name = "id"
  field_value = $input.product_id
}
```

---

## db.truncate

Delete all records from a table.

```xs
db.truncate "temp_data" {
  reset = true                          // Reset auto-increment
}
```

---

## db.direct_query

Execute raw SQL (use sparingly).

```xs
db.direct_query {
  sql = "SELECT * FROM users WHERE email = ? AND status = ?"
  arg = [$input.email, "active"]
  response_type = "list"                // list or single
} as $results
```

---

## db.transaction

Execute operations atomically.

```xs
db.transaction {
  stack {
    db.add "order" {
      data = { user_id: $auth.id, total: $total }
    } as $order

    foreach ($input.items) {
      each as $item {
        db.add "order_item" {
          data = {
            order_id: $order.id,
            product_id: $item.product_id,
            quantity: $item.quantity
          }
        }
      }
    }

    db.edit "user" {
      field_name = "id"
      field_value = $auth.id
      data = { last_order_at: now }
    }
  }
}
```

---

## Query Filters

Filters for use in `where` clauses:

### String/Text
```xs
$db.name|to_lower                       // Case conversion
$db.name|concat:" "                     // Concatenation
$db.text|substr:0:100                   // Substring
```

### Numeric
```xs
$db.price|round:2
$db.price|floor
$db.price|ceil
$db.price|add:10
$db.price|mul:1.1
```

### Timestamp
```xs
$db.created_at|timestamp_year
$db.created_at|timestamp_month
$db.created_at|timestamp_add_days:7
$db.created_at|timestamp_subtract_hours:24
```

### Geographic
```xs
$db.location|distance:$input.point      // Distance in meters
$db.location|within:$input.point:1000   // Within radius
```

### Vector (AI/ML)
```xs
$db.embedding|cosine_similarity:$input.vector
$db.embedding|l2_distance_euclidean:$input.vector
```

### Full-Text Search
```xs
$db.content|search_rank:$input.query
```

---

## External Databases

Connect to external databases:

```xs
// PostgreSQL
db.external.postgres.direct_query {
  connection_string = $env.EXTERNAL_PG_URL
  sql = "SELECT * FROM users WHERE id = ?"
  arg = [$input.user_id]
  response_type = "single"
} as $user

// MySQL
db.external.mysql.direct_query { ... }

// MS SQL
db.external.mssql.direct_query { ... }

// Oracle
db.external.oracle.direct_query { ... }
```

---

## Bulk Operations

Perform batch operations on multiple records efficiently.

### db.bulk.add

Insert multiple records in a single operation.

```xs
db.bulk.add "product" {
  data = [
    { name: "Product A", price: 10.00, sku: "SKU-A" },
    { name: "Product B", price: 20.00, sku: "SKU-B" },
    { name: "Product C", price: 30.00, sku: "SKU-C" }
  ]
} as $inserted
```

### db.bulk.update

Update multiple records matching conditions.

```xs
db.bulk.update "product" {
  where = $db.product.category_id == $input.category_id
  data = {
    is_featured: true,
    updated_at: now
  }
} as $count
```

### db.bulk.patch

Patch multiple records with variable data.

```xs
var $updates { value = { updated_at: now } }

conditional {
  if ($input.discount != null) {
    var.update $updates { value = $updates|set:"discount":$input.discount }
  }
}

db.bulk.patch "product" {
  where = $db.product.category_id == $input.category_id
  data = $updates
} as $count
```

### db.bulk.delete

Delete multiple records matching conditions.

```xs
db.bulk.delete "temp_session" {
  where = $db.temp_session.expires_at < now
} as $deleted_count
```

### Bulk with Transaction

```xs
db.transaction {
  stack {
    db.bulk.delete "order_item" {
      where = $db.order_item.order_id == $input.order_id
    }

    db.bulk.add "order_item" {
      data = $input.items|map:{
        order_id: $input.order_id,
        product_id: $$.product_id,
        quantity: $$.quantity
      }
    }
  }
}
```

---

## Advanced Features

### db.set_datasource

Switch to a different data source within a function.

```xs
db.set_datasource {
  name = "analytics_db"
}

db.query "metrics" {
  where = $db.metrics.date >= $input.start_date
} as $metrics

db.set_datasource {
  name = "default"
}
```

### db.schema

Get schema information for a table.

```xs
db.schema {
  table = "user"
} as $schema

// $schema contains:
// - columns: array of column definitions
// - indexes: array of index definitions
// - constraints: array of constraints
```

### Transaction Isolation Levels

```xs
db.transaction {
  isolation = "serializable"      // serializable, repeatable_read, read_committed
  stack {
    // Operations run with specified isolation
  }
}
```

### Deadlock Handling

```xs
try_catch {
  try {
    db.transaction {
      stack {
        db.edit "inventory" { ... }
        db.edit "order" { ... }
      }
    }
  }
  catch {
    conditional {
      if ($error.name == "DeadlockError") {
        // Retry logic
        util.sleep { value = 100 }
        function.run "retry_transaction" { input = $input }
      }
      else {
        throw { name = $error.name, value = $error.message }
      }
    }
  }
}
```

---

## Best Practices

1. **Use db.query for searches** - Flexible filtering and pagination
2. **Use db.get for single lookups** - Simpler than db.query with single return
3. **Use db.patch for dynamic updates** - Accepts variable data
4. **Use transactions for atomicity** - Ensure all-or-nothing operations
5. **Use null-safe operators** - `==?` for optional filters
6. **Use bulk operations for batch processing** - More efficient than loops
7. **Handle deadlocks gracefully** - Implement retry logic for concurrent writes
