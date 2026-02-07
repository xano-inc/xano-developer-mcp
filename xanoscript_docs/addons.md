---
applyTo: "addons/*.xs, functions/**/*.xs, apis/**/*.xs"
---

# Addons

Reusable subqueries for fetching related data in database queries.

## Quick Reference

```xs
addon "<name>" {
  description = "What this addon fetches"
  input {
    <type> <name>
  }
  stack {
    // Query logic
  }
  response = $result
}
```

---

## Basic Structure

Addons define reusable data fetching logic that can be attached to query results.

```xs
addon "comment_count" {
  description = "Count of comments for a post"
  input {
    int post_id
  }
  stack {
    db.query "comment" {
      where = $db.comment.post_id == $input.post_id
      return = { type: "count" }
    } as $count
  }
  response = $count
}
```

---

## Using Addons in Queries

### In db.query

```xs
db.query "post" {
  where = $db.post.author_id == $auth.id
  addon = [
    {
      name: "comment_count",
      input: { post_id: $output.id },
      as: "items.comment_count"
    }
  ]
} as $posts
```

### Result Structure

```json
{
  "items": [
    {
      "id": 1,
      "title": "My Post",
      "comment_count": 42
    }
  ]
}
```

### Multiple Addons

```xs
db.query "post" {
  where = $db.post.is_published == true
  addon = [
    {
      name: "comment_count",
      input: { post_id: $output.id },
      as: "items.comments"
    },
    {
      name: "like_count",
      input: { post_id: $output.id },
      as: "items.likes"
    },
    {
      name: "author_details",
      input: { user_id: $output.author_id },
      as: "items.author"
    }
  ]
} as $posts
```

---

## Addon Examples

### Related List

```xs
addon "recent_comments" {
  description = "Get recent comments for a post"
  input {
    int post_id
    int limit?=5
  }
  stack {
    db.query "comment" {
      where = $db.comment.post_id == $input.post_id
      sort = { created_at: "desc" }
      return = {
        type: "list",
        paging: { per_page: $input.limit }
      }
    } as $comments
  }
  response = $comments.items
}
```

### Aggregation

```xs
addon "order_stats" {
  description = "Order statistics for a user"
  input {
    int user_id
  }
  stack {
    db.query "order" {
      where = $db.order.user_id == $input.user_id
    } as $orders

    var $stats {
      value = {
        total_orders: $orders|count,
        total_spent: $orders|map:$$.total|sum,
        avg_order: $orders|map:$$.total|avg
      }
    }
  }
  response = $stats
}
```

### Nested Object

```xs
addon "full_address" {
  description = "Get formatted address for a user"
  input {
    int user_id
  }
  stack {
    db.get "address" {
      field_name = "user_id"
      field_value = $input.user_id
    } as $address

    conditional {
      if ($address != null) {
        var $formatted {
          value = {
            street: $address.street,
            city: $address.city,
            state: $address.state,
            zip: $address.zip,
            full: $address.street ~ ", " ~ $address.city ~ ", " ~ $address.state ~ " " ~ $address.zip
          }
        }
      }
      else {
        var $formatted { value = null }
      }
    }
  }
  response = $formatted
}
```

### Boolean Check

```xs
addon "has_premium" {
  description = "Check if user has premium subscription"
  input {
    int user_id
  }
  stack {
    db.query "subscription" {
      where = $db.subscription.user_id == $input.user_id
            && $db.subscription.status == "active"
            && $db.subscription.expires_at > now
      return = { type: "exists" }
    } as $has_premium
  }
  response = $has_premium
}
```

---

## addon.call

Call an addon directly from a function or API.

```xs
addon.call "comment_count" {
  input = { post_id: $input.post_id }
} as $count
```

### Use Cases

```xs
// Get stats for single record
addon.call "order_stats" {
  input = { user_id: $auth.id }
} as $my_stats

// Conditional addon call
conditional {
  if ($input.include_stats) {
    addon.call "detailed_stats" {
      input = { entity_id: $entity.id }
    } as $stats
  }
}
```

---

## Database Addon Attributes

Use `dbAddonAttr` for computed fields in queries.

```xs
db.query "product" {
  eval = {
    discount_price: dbAddonAttr("calculate_discount", { product_id: $db.product.id })
  }
} as $products
```

---

## Organization

### File Structure

```
addons/
├── comment_count.xs
├── like_count.xs
├── author_details.xs
├── order_stats.xs
└── has_premium.xs
```

### Naming Conventions

- Use descriptive names: `comment_count`, not `cc`
- Use verb_noun for actions: `calculate_discount`
- Use has_ prefix for boolean checks: `has_premium`

---

## Best Practices

1. **Keep addons focused** - One purpose per addon
2. **Use input parameters** - Make addons reusable
3. **Handle null cases** - Return sensible defaults
4. **Cache expensive addons** - Use Redis for slow queries
5. **Limit nested queries** - Avoid N+1 query patterns
6. **Document inputs** - Add descriptions to input fields
