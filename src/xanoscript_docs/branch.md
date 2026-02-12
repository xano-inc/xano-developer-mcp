---
applyTo: "branch.xs"
---

# Branch Configuration

Configure branch-level settings including middleware, history retention, and visual styling.

## Quick Reference

```xs
branch "<name>" {
  color = "#hex"
  description = "Branch description"
  middleware = { ... }
  history = { ... }
}
```

### Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `color` | text | Yes | Hex color code for branch identification |
| `description` | text | No | Human-readable branch description |
| `middleware` | object | No | Pre/post middleware configuration |
| `history` | object | No | Request history retention settings |

---

## Basic Structure

```xs
branch "production" {
  color = "#22c55e"
  description = "Production environment"
}
```

---

## Middleware Configuration

Configure middleware to run before (pre) and after (post) different construct types.

### Syntax

```xs
branch "production" {
  color = "#22c55e"

  middleware = {
    function: {
      pre: ["auth_check", "rate_limit"],
      post: ["audit_log"]
    },
    query: {
      pre: ["auth_check", "rate_limit"],
      post: ["audit_log", "cache_response"]
    },
    task: {
      pre: ["task_lock"],
      post: ["task_cleanup"]
    },
    tool: {
      pre: ["tool_auth"],
      post: ["tool_log"]
    }
  }
}
```

### Middleware Targets

| Target | Description |
|--------|-------------|
| `function` | Applies to all function calls |
| `query` | Applies to all API endpoints |
| `task` | Applies to scheduled tasks |
| `tool` | Applies to AI agent tools |

### Pre vs Post Middleware

| Type | Execution | Use Cases |
|------|-----------|-----------|
| `pre` | Before main logic | Authentication, rate limiting, validation |
| `post` | After main logic | Logging, caching, response transformation |

---

## History Configuration

Control how many statements from the execution trace are retained per request. Execution traces are kept for 24 hours; this setting limits how many stack statements are recorded in each trace.

### Syntax

```xs
branch "production" {
  color = "#22c55e"

  history = {
    function: 100,
    query: 1000,
    task: 100,
    tool: 100,
    trigger: 100,
    middleware: 10
  }
}
```

### History Values

| Value | Description |
|-------|-------------|
| `false` | Disable history (no statements recorded) |
| `10` | Record up to 10 statements per trace |
| `100` | Record up to 100 statements per trace |
| `1000` | Record up to 1000 statements per trace |
| `10000` | Record up to 10000 statements per trace |
| `"all"` | Record all statements (use with caution) |

### History Targets

| Target | Description |
|--------|-------------|
| `function` | Statement limit for function traces |
| `query` | Statement limit for API endpoint traces |
| `task` | Statement limit for scheduled task traces |
| `tool` | Statement limit for AI tool traces |
| `trigger` | Statement limit for trigger traces |
| `middleware` | Statement limit for middleware traces |

---

## Common Patterns

### Development Branch

```xs
branch "development" {
  color = "#3b82f6"
  description = "Development environment with full debugging"

  history = {
    function: "all",
    query: "all",
    task: "all",
    tool: "all",
    trigger: "all",
    middleware: "all"
  }
}
```

### Staging Branch

```xs
branch "staging" {
  color = "#f59e0b"
  description = "Staging environment for testing"

  middleware = {
    query: {
      pre: ["auth_check"],
      post: ["audit_log"]
    }
  }

  history = {
    function: 1000,
    query: 1000,
    task: 100,
    tool: 100,
    trigger: 100,
    middleware: 100
  }
}
```

### Production Branch

```xs
branch "production" {
  color = "#22c55e"
  description = "Production environment"

  middleware = {
    function: {
      pre: ["auth_check", "rate_limit"],
      post: ["audit_log"]
    },
    query: {
      pre: ["auth_check", "rate_limit", "security_check"],
      post: ["audit_log", "cache_response"]
    },
    task: {
      pre: ["task_lock"],
      post: ["audit_log"]
    },
    tool: {
      pre: ["auth_check"],
      post: ["audit_log"]
    }
  }

  history = {
    function: 100,
    query: 100,
    task: 100,
    tool: 100,
    trigger: 100,
    middleware: false
  }
}
```

---

## File Location

Branch configuration files are typically named `branch.xs` and placed at the workspace root or in a dedicated configuration directory.

```
project/
├── branch.xs              # Branch configuration
├── workspace/
├── table/
├── function/
└── api/
```

---

## Best Practices

1. **Use descriptive colors** - Green for production, blue for development, yellow for staging
2. **Limit production history** - Excessive history impacts performance and storage
3. **Apply security middleware in production** - Rate limiting, auth checks, audit logging
4. **Disable middleware history in production** - Reduces noise and storage
5. **Enable full history in development** - Aids debugging and testing
