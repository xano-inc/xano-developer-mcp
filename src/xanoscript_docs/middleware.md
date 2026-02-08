---
applyTo: "middleware/**/*.xs"
---

# Middleware

Middleware intercepts and processes requests before and after your functions, queries, tasks, and tools execute.

## Quick Reference

```xs
middleware "<name>" {
  description = "What this middleware does"
  exception_policy = "silent" | "rethrow" | "critical"
  response_strategy = "merge" | "replace"
  input { ... }
  stack { ... }
  response = $result
}
```

### Required Blocks
| Block | Purpose |
|-------|---------|
| `input` | Define parameters passed to middleware |
| `stack` | Processing logic |
| `response` | Output returned to caller |

### Optional Attributes
| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `description` | text | - | Documents middleware purpose |
| `exception_policy` | `silent`, `rethrow`, `critical` | `rethrow` | How to handle errors |
| `response_strategy` | `merge`, `replace` | `merge` | How response combines with original |

---

## Basic Structure

```xs
middleware "log_request" {
  description = "Logs all incoming requests"

  input {
    json request_data
  }

  stack {
    debug.log {
      value = {
        timestamp: now,
        data: $input.request_data
      }
    }
  }

  response = null
}
```

---

## Exception Policies

Control how middleware handles errors:

### silent
Errors are caught and ignored. Execution continues normally.

```xs
middleware "optional_enrichment" {
  exception_policy = "silent"

  input {
    int user_id
  }

  stack {
    // If this fails, request continues without enrichment
    api.call "external_service" {
      url = "https://api.example.com/enrich/" ~ $input.user_id
    } as $enriched
  }

  response = $enriched
}
```

### rethrow (default)
Errors are passed through to the caller. Standard error handling applies.

```xs
middleware "validate_token" {
  exception_policy = "rethrow"

  input {
    text token
  }

  stack {
    precondition ($input.token|strlen > 0) {
      error_type = "accessdenied"
      error = "Token required"
    }
  }

  response = { valid: true }
}
```

### critical
Errors are treated as critical failures. Request is immediately terminated.

```xs
middleware "security_check" {
  exception_policy = "critical"

  input {
    text ip_address
  }

  stack {
    db.query "blocked_ips" {
      where = $db.blocked_ips.ip == $input.ip_address
      return = { type: "exists" }
    } as $is_blocked

    precondition (!$is_blocked) {
      error_type = "accessdenied"
      error = "Access denied"
    }
  }

  response = { allowed: true }
}
```

---

## Response Strategies

Control how middleware response combines with the original response:

### merge (default)
Middleware response is merged with original response.

```xs
middleware "add_metadata" {
  response_strategy = "merge"

  input {
  }

  stack {
    var $meta {
      value = {
        server_time: now,
        version: "1.0.0"
      }
    }
  }

  response = { _meta: $meta }
}
// Original: { data: [...] }
// Result: { data: [...], _meta: { server_time: ..., version: "1.0.0" } }
```

### replace
Middleware response completely replaces original response.

```xs
middleware "transform_response" {
  response_strategy = "replace"

  input {
    json original_response
  }

  stack {
    var $transformed {
      value = {
        success: true,
        payload: $input.original_response
      }
    }
  }

  response = $transformed
}
```

---

## Common Patterns

### Request Logging

```xs
middleware "audit_log" {
  description = "Logs all API requests for audit trail"
  exception_policy = "silent"

  input {
    text endpoint
    text method
    json request_body?
    int user_id?
  }

  stack {
    db.add "audit_log" {
      data = {
        endpoint: $input.endpoint,
        method: $input.method,
        request_body: $input.request_body,
        user_id: $input.user_id,
        ip_address: $env.$remote_ip,
        created_at: now
      }
    }
  }

  response = null
}
```

### Rate Limiting

```xs
middleware "rate_limit" {
  description = "Enforces rate limits per user"
  exception_policy = "rethrow"

  input {
    int user_id
    int max_requests?=100
    int window_seconds?=60
  }

  stack {
    var $key { value = "ratelimit:" ~ $input.user_id }

    redis.incr {
      key = $key
    } as $count

    conditional {
      if ($count == 1) {
        redis.expire {
          key = $key
          seconds = $input.window_seconds
        }
      }
    }

    precondition ($count <= $input.max_requests) {
      error_type = "standard"
      error = "Rate limit exceeded"
    }
  }

  response = { remaining: $input.max_requests - $count }
}
```

### Response Caching

```xs
middleware "cache_response" {
  description = "Caches responses in Redis"
  exception_policy = "silent"

  input {
    text cache_key
    int ttl_seconds?=300
    json response_data
  }

  stack {
    redis.set {
      key = $input.cache_key
      value = $input.response_data|json_encode
      expire = $input.ttl_seconds
    }
  }

  response = null
}
```

---

## Applying Middleware

Middleware is configured at the branch level. See `xanoscript_docs({ topic: "branch" })` for configuration details.

```xs
branch "production" {
  middleware = {
    query: {
      pre: ["validate_token", "rate_limit"],
      post: ["audit_log", "cache_response"]
    },
    function: {
      pre: ["validate_token"],
      post: ["audit_log"]
    }
  }
}
```

---

## Best Practices

1. **Keep middleware focused** - Each middleware should do one thing well
2. **Use appropriate exception policies** - Critical for security, silent for optional enrichment
3. **Consider performance** - Middleware runs on every request
4. **Log failures** - Even silent failures should be logged for debugging
5. **Test independently** - Middleware should be testable in isolation
