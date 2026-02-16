---
applyTo: "addon/**/*.xs, function/**/*.xs, api/**/*.xs"
---

# Addons

Reusable subqueries for fetching related data in database queries.

## Quick Reference

```xs
addon <name> {
  input {
    <type> <name>
  }

  stack {
    db.query <tableName> {
      return = {type: "<return_type>"}
    }
  }
}
```

---

## Basic Structure

Addons define reusable data fetching logic that can be attached to query results. The stack can only contain a `db.query` block.

```xs
addon comment_count {
  input {
    int post_id
  }

  stack {
    db.query comment {
      where = $db.comment.post_id == $input.post_id
      return = {type: "count"}
    }
  }
}
```

---

## Using Addons in Queries

### In db.query

```xs
db.query post {
  where = $db.post.author_id == $auth.id
  addon = [
    {
      name: "comment_count",
      input: {post_id: $output.id},
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
db.query post {
  where = $db.post.is_published == true
  addon = [
    {
      name: "comment_count",
      input: {post_id: $output.id},
      as: "items.comments"
    },
    {
      name: "like_count",
      input: {post_id: $output.id},
      as: "items.likes"
    },
    {
      name: "author_details",
      input: {user_id: $output.author_id},
      as: "items.author"
    }
  ]
} as $posts
```

---

## Addon Examples

### Related List

```xs
addon recent_comments {
  input {
    int post_id
    int limit?=5
  }

  stack {
    db.query comment {
      where = $db.comment.post_id == $input.post_id
      sort = {created_at: "desc"}
      return = {
        type: "list",
        paging: {per_page: $input.limit}
      }
    }
  }
}
```

### Count

```xs
addon order_count {
  input {
    int user_id
  }

  stack {
    db.query order {
      where = $db.order.user_id == $input.user_id
      return = {type: "count"}
    }
  }
}
```

### Boolean Check (Exists)

```xs
addon has_premium {
  input {
    int user_id
  }

  stack {
    db.query subscription {
      where = $db.subscription.user_id == $input.user_id
            && $db.subscription.status == "active"
            && $db.subscription.expires_at > now
      return = {type: "exists"}
    }
  }
}
```

### Single Record

```xs
addon author_details {
  input {
    int user_id
  }

  stack {
    db.query user {
      where = $db.user.id == $input.user_id
      return = {type: "single"}
    }
  }
}
```

---

## addon.call

Call an addon directly from a function or API.

```xs
addon.call comment_count {
  input = {post_id: $input.post_id}
} as $count
```

### Use Cases

```xs
// Get stats for single record
addon.call order_count {
  input = {user_id: $auth.id}
} as $my_order_count

// Conditional addon call
conditional {
  if ($input.include_stats) {
    addon.call order_count {
      input = {user_id: $entity.id}
    } as $count
  }
}
```

---

## Database Addon Attributes

Use `dbAddonAttr` for computed fields in queries.

```xs
db.query product {
  eval = {
    discount_price: dbAddonAttr("calculate_discount", {product_id: $db.product.id})
  }
} as $products
```

---

## Organization

### File Structure

```
addon/
├── comment_count.xs
├── like_count.xs
├── author_details.xs
├── order_count.xs
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
3. **Use appropriate return types** - `list`, `single`, `count`, `exists`
4. **Limit nested queries** - Avoid N+1 query patterns
5. **Document inputs** - Add descriptions to input fields

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `database` | db.query with addon usage |
| `apis` | Using addons in API responses |
| `functions` | Calling addons from functions |
