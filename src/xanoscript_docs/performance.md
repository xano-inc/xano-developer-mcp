---
applyTo: "function/**/*.xs, api/**/*.xs"
---

# Performance Optimization

Best practices for building fast, efficient XanoScript applications.

> **TL;DR:** Index frequently queried fields. Use `select` to fetch only needed columns. Cache expensive reads. Paginate large result sets. Use explicit batch write loops unless a retrieved bulk-operation snippet validates in the current workspace.

---

## Quick Reference

| Area | Key Techniques |
|------|----------------|
| Database | Indexes, query optimization, pagination |
| Caching | Redis, response caching |
| Loops | Bulk operations, efficient iteration |
| Filters | Efficient data transformations |

---

## Database Optimization

### Use Indexes

Ensure frequently queried columns are indexed in your table definitions.

```xs
table "order" {
  int id { primary_key = true }
  int user_id { index = true }
  timestamp created_at { index = true }
  text status { index = true }
  // Compound index for common query pattern
  index = [["user_id", "created_at"]]
}
```

### Query Only What You Need

```xs
// Good: Select specific fields
db.query "user" {
  where = $db.user.is_active == true
  select = ["id", "name", "email"]
} as $users

// Avoid: Selecting all fields when only a few are needed
db.query "user" {
  where = $db.user.is_active == true
} as $users  // Fetches all columns
```

### Use Appropriate Return Types

```xs
// Need count only? Use count return type
db.query "order" {
  where = $db.order.user_id == $auth.id
  return = { type: "count" }
} as $order_count

// Need existence check? Use exists return type
db.query "user" {
  where = $db.user.email == $input.email
  return = { type: "exists" }
} as $exists

// Don't fetch full records just to count them
```

### Pagination for Large Results

```xs
// Always paginate large result sets
db.query "product" {
  where = $db.product.is_active == true
  return = {
    type: "list",
    paging: {
      page: $input.page,
      per_page: 25,
      totals: true
    }
  }
  sort = { created_at: "desc" }
} as $products
```

### Avoid N+1 Queries

```xs
// Bad: Query inside loop (N+1)
foreach ($orders) {
  each as $order {
    db.get "user" {
      field_name = "id"
      field_value = $order.user_id
    } as $user
  }
}

// Good: Use join or batch fetch
db.query "order" {
  join = {
    user: {
      table: "user",
      where: $db.order.user_id == $db.user.id
    }
  }
  eval = {
    user_name: $db.user.name,
    user_email: $db.user.email
  }
} as $orders
```

### Batch Writes

```xs
// Safe fallback: explicit fields inside a loop
foreach ($items) {
  each as $item {
    db.add "order_item" {
      data = {
        order_id: $item.order_id,
        product_id: $item.product_id,
        quantity: $item.quantity
      }
    } as $created
  }
}
```

Bulk operations can be faster, but their syntax is version-sensitive. Do not
guess `db.bulk.*` forms such as `data = $items`; if validation rejects a bulk
argument, use the explicit loop fallback above.

---

## Caching Strategies

> See `xano_xanoscript_docs({ topic: "integrations/redis" })` for full Redis caching patterns (get/set, invalidation, computed value caching).

---

## Efficient Data Transformations

```xs
// Good: Single pass with chained filters
$data|filter:$$.active|map:$$.name|unique

// Filter in database, not in code
db.query "product" {
  where = $db.product.is_active == true && $db.product.price > 0
} as $products
```

---

## Rate Limiting

For basic rate limiting setup, see `xano_xanoscript_docs({ topic: "security" })`. Below are performance-focused patterns.

### Tiered Limits

```xs
// Different limits by user tier
var $limit { value = 100 }

conditional {
  if ($auth.tier == "premium") { 
    var.update $limit { value = 1000 } 
  }
  elseif ($auth.tier == "pro") {
    var.update $limit { value = 500 } 
  }
}

redis.ratelimit {
  key = "api:" ~ $auth.id
  max = $limit
  ttl = 60
}
```

---

## Response Optimization

For large responses, use `return = { type: "stream" }` with `api.stream` to avoid loading into memory. Large JSON responses are automatically compressed when clients support it.

> See `xano_xanoscript_docs({ topic: "streaming" })` for streaming patterns.

---

## Query Analysis

Use `now|to_ms` before and after operations to measure duration, and `debug.log` to log slow queries.

> See `xano_xanoscript_docs({ topic: "debugging" })` for timing and logging patterns.

---

## Best Practices Summary

1. **Index frequently queried columns** - Use `select` for only needed fields; use `count`/`exists` return types
2. **Avoid N+1 reads** - Use joins, `select`, and pagination; use batch write loops unless a retrieved and validated bulk-operation snippet is available
3. **Paginate large results** - Never return unbounded lists; cache expensive computations with Redis

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `database` | Query optimization |
| `integrations/redis` | Caching patterns |
| `streaming` | Large data handling |
| `debugging` | Performance monitoring |
