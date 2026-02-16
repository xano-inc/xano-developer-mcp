---
applyTo: "function/**/*.xs, api/**/*.xs, task/**/*.xs"
---

# Redis Integration

> **TL;DR:** `redis.*` for caching, counters, lists, and rate limiting. Key-value storage with TTL support.

## Quick Reference

| Operation | Purpose |
|-----------|---------|
| `redis.set` | Store value with optional TTL |
| `redis.get` | Retrieve value |
| `redis.has` | Check if key exists |
| `redis.del` | Delete key |
| `redis.incr` / `redis.decr` | Increment/decrement counters |
| `redis.push` / `redis.pop` | List operations (end) |
| `redis.unshift` / `redis.shift` | List operations (front) |
| `redis.range` | Get list range |
| `redis.count` | Get list length |
| `redis.ratelimit` | Rate limiting |

---

## Key-Value Operations

```xs
// Set value
redis.set {
  key = "user:123:session"
  data = $session_data
  ttl = 3600                            // Expires in 1 hour
}

// Get value
redis.get { key = "user:123:session" } as $session

// Check exists
redis.has { key = "user:123:session" } as $exists

// Delete
redis.del { key = "user:123:session" }
```

---

## Counters

```xs
# Increment
redis.incr {
  key = "page_views"
  by = 1
} as $new_count

# Decrement
redis.decr {
  key = "inventory:item-123"
  by = 1
} as $new_count
```

---

## Lists

```xs
# Push to end
redis.push {
  key = "queue:tasks"
  value = $task
} as $length

# Push to front
redis.unshift {
  key = "queue:priority"
  value = $urgent_task
}

# Pop from end
redis.pop { key = "queue:tasks" } as $task

# Pop from front
redis.shift { key = "queue:tasks" } as $task

# Get range
redis.range {
  key = "recent:logs"
  start = 0
  stop = 9
} as $logs

# Count
redis.count { key = "queue:tasks" } as $count
```

---

## Rate Limiting

```xs
redis.ratelimit {
  key = "api:" ~ $env.$remote_ip
  max = 100
  ttl = 60
  error = "Rate limit exceeded"
} as $status
```

---

## Common Patterns

### Session Caching

```xs
// Store session
redis.set {
  key = "session:" ~ $token
  data = { user_id: $user.id, role: $user.role }
  ttl = 86400  // 24 hours
}

// Retrieve session
redis.get { key = "session:" ~ $input.token } as $session

precondition ($session != null) {
  error_type = "accessdenied"
  error = "Invalid session"
}
```

### API Response Caching

```xs
// Check cache first
redis.get { key = "cache:products:" ~ $input.category } as $cached

conditional {
  if ($cached != null) {
    var $products { value = $cached }
  }
  else {
    // Fetch from database
    db.query "product" {
      where = $db.product.category == $input.category
    } as $products

    // Cache for 5 minutes
    redis.set {
      key = "cache:products:" ~ $input.category
      data = $products
      ttl = 300
    }
  }
}
```

### Queue Processing

```xs
// Add to queue
redis.push {
  key = "queue:emails"
  value = { to: $user.email, subject: "Welcome", body: $message }
}

// Process queue (in a task)
redis.shift { key = "queue:emails" } as $email

conditional {
  if ($email != null) {
    util.send_email {
      service_provider = "resend"
      api_key = $env.RESEND_API_KEY
      to = $email.to
      from = "noreply@example.com"
      subject = $email.subject
      message = $email.body
    }
  }
}
```

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `performance` | Caching strategies |
| `security` | Rate limiting patterns |
| `integrations` | All integrations index |
