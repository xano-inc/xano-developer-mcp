---
applyTo: "functions/**/*.xs, apis/**/*.xs"
---

# Performance Optimization

Best practices for building fast, efficient XanoScript applications.

## Quick Reference

| Area | Key Techniques |
|------|----------------|
| Database | Indexes, query optimization, pagination |
| Caching | Redis, response caching |
| Loops | Bulk operations, parallel execution |
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

### Use Bulk Operations

```xs
// Bad: Individual inserts in loop
foreach ($items) {
  each as $item {
    db.add "order_item" { data = $item }
  }
}

// Good: Bulk insert
db.bulk.add "order_item" {
  data = $items
}
```

---

## Caching Strategies

### Redis Caching

```xs
// Check cache first
redis.get { key = "user:" ~ $input.user_id } as $cached

conditional {
  if ($cached != null) {
    var $user { value = $cached }
  }
  else {
    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    // Cache for 5 minutes
    redis.set {
      key = "user:" ~ $input.user_id
      data = $user
      ttl = 300
    }
  }
}
```

### Cache Invalidation

```xs
function "update_user" {
  input { int user_id, object data }
  stack {
    db.patch "user" {
      field_name = "id"
      field_value = $input.user_id
      data = $input.data
    } as $user

    // Invalidate cache
    redis.del { key = "user:" ~ $input.user_id }
  }
  response = $user
}
```

### Computed Value Caching

```xs
// Cache expensive computations
redis.get { key = "stats:daily:" ~ now|format_timestamp:"Y-m-d" } as $cached_stats

conditional {
  if ($cached_stats == null) {
    // Expensive aggregation
    db.query "order" {
      where = $db.order.created_at >= now|transform_timestamp:"start of day"
    } as $orders

    var $stats {
      value = {
        count: $orders|count,
        total: $orders|map:$$.total|sum,
        avg: $orders|map:$$.total|avg
      }
    }

    redis.set {
      key = "stats:daily:" ~ now|format_timestamp:"Y-m-d"
      data = $stats
      ttl = 300
    }

    var $cached_stats { value = $stats }
  }
}
```

---

## Parallel Execution

### Use Group for Independent Operations

```xs
// Execute in parallel
group {
  db.query "user" { return = { type: "count" } } as $user_count
  db.query "order" { return = { type: "count" } } as $order_count
  db.query "product" { return = { type: "count" } } as $product_count
}

// All counts available after group completes
response = {
  users: $user_count,
  orders: $order_count,
  products: $product_count
}
```

### Parallel API Calls

```xs
group {
  api.request { url = "https://api1.example.com/data" } as $data1
  api.request { url = "https://api2.example.com/data" } as $data2
  api.request { url = "https://api3.example.com/data" } as $data3
}
```

---

## Efficient Data Transformations

### Use Filter Chains Wisely

```xs
// Good: Single pass with chained filters
$data|filter:$$.active|map:$$.name|unique

// Avoid: Multiple passes over data
var $active { value = $data|filter:$$.active }
var $names { value = $active|map:$$.name }
var $unique { value = $names|unique }
```

### Early Filtering

```xs
// Filter in database, not in code
db.query "product" {
  where = $db.product.is_active == true && $db.product.price > 0
} as $products

// Not: Fetch all then filter
db.query "product" as $all_products
var $products { value = $all_products|filter:$$.is_active && $$.price > 0 }
```

### Limit Data Transfer

```xs
// Only fetch needed fields from external API
api.request {
  url = "https://api.example.com/users"
  params = { fields: "id,name,email" }
} as $result
```

---

## Rate Limiting

### Protect Endpoints

```xs
redis.ratelimit {
  key = "api:" ~ $auth.id
  max = 100
  ttl = 60
  error = "Rate limit exceeded. Try again in 1 minute."
}
```

### Tiered Limits

```xs
// Different limits by user tier
var $limit {
  value = conditional {
    if ($auth.tier == "premium") { 1000 }
    elseif ($auth.tier == "pro") { 500 }
    else { 100 }
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

### Stream Large Responses

```xs
// Stream instead of loading into memory
db.query "log" {
  where = $db.log.created_at >= $input.start
  return = { type: "stream" }
} as $logs

api.stream {
  format = "jsonl"
  value = $logs
}
```

### Compress Responses

Large JSON responses are automatically compressed when clients support it.

### Paginate API Responses

```xs
query "list_products" {
  input {
    int page?=1
    int per_page?=25 filters=max:100
  }
  stack {
    db.query "product" {
      return = {
        type: "list",
        paging: {
          page: $input.page,
          per_page: $input.per_page,
          totals: true
        }
      }
    } as $products
  }
  response = $products
}
```

---

## Query Analysis

### Log Slow Queries

```xs
var $start { value = now|to_ms }

db.query "product" {
  where = $db.product.category == $input.category
} as $products

var $duration { value = (now|to_ms) - $start }

conditional {
  if ($duration > 100) {
    debug.log {
      label = "SLOW_QUERY"
      value = {
        query: "product by category",
        duration_ms: $duration,
        result_count: $products|count
      }
    }
  }
}
```

---

## Best Practices Summary

1. **Index frequently queried columns** - Check query patterns
2. **Use appropriate return types** - count, exists, single
3. **Paginate large results** - Never return unbounded lists
4. **Avoid N+1 queries** - Use joins or batch fetching
5. **Use bulk operations** - For batch inserts/updates
6. **Cache expensive operations** - Redis with appropriate TTL
7. **Execute in parallel** - Group independent operations
8. **Filter early** - In database, not application code
9. **Stream large responses** - Don't load into memory
10. **Monitor performance** - Log slow operations
