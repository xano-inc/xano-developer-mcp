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

Configure middleware to run before (pre) and after (post) different construct types. Each entry is an object naming a middleware: `{name: "auth_check"}`. Add `active: false` to keep an entry in place but skip it. A list of plain strings is not accepted.

### Syntax

```xs
branch "production" {
  color = "#22c55e"

  middleware = {
    function: {
      pre: [{name: "auth_check"}, {name: "rate_limit"}],
      post: [{name: "audit_log"}]
    },
    query: {
      pre: [{name: "auth_check"}, {name: "rate_limit"}],
      post: [{name: "audit_log"}, {name: "cache_response", active: false}]
    },
    task: {
      pre: [{name: "task_lock"}],
      post: [{name: "task_cleanup"}]
    },
    tool: {
      pre: [{name: "tool_auth"}],
      post: [{name: "tool_log"}]
    },
    message: {
      pre: [{name: "auth_check"}],
      post: []
    },
    prompt: {
      pre: [{name: "tool_auth"}],
      post: []
    },
    resource: {
      pre: [{name: "tool_auth"}],
      post: []
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
| `tool` | Applies to AI agent and MCP tools |
| `message` | Applies to realtime messages |
| `prompt` | Applies to MCP prompts (optional) |
| `resource` | Applies to MCP resources (optional) |

A pull writes the `prompt` and `resource` lines only when the branch has middleware for them. A missing target means no branch middleware for that type.

### Pre vs Post Middleware

| Type | Execution | Use Cases |
|------|-----------|-----------|
| `pre` | Before main logic | Authentication, rate limiting, validation |
| `post` | After main logic | Logging, caching, response transformation |

### Which Middleware Runs

Pre and post are resolved separately. The first level that sets its own list wins, even if that list is empty:

1. The object's own `middleware` block
2. Its container: the API group for a query; the MCP server a tool, prompt or resource was reached through; the channel, then its realtime server, for a message
3. The branch's list for that type (`query`, `prompt`, ...)
4. The workspace's list, only when the object's branch cannot be resolved

Entries with `active: false` are skipped.

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
    middleware: 10,
    prompt: 100,
    resource: false
  }
}
```

### History Values

| Value | Description |
|-------|-------------|
| `false` | Disable history (no statements recorded) |
| `0` | Record no statements (a pull writes `task: 0` when task history is off) |
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
| `prompt` | Statement limit for MCP prompt traces (optional) |
| `resource` | Statement limit for MCP resource traces (optional) |

`prompt` and `resource` default to `100`. A pull writes them only when they differ from that default. An MCP server whose history settings do not inherit overrides the branch for its tools, prompts and resources.

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
      pre: [{name: "auth_check"}],
      post: [{name: "audit_log"}]
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
      pre: [{name: "auth_check"}, {name: "rate_limit"}],
      post: [{name: "audit_log"}]
    },
    query: {
      pre: [{name: "auth_check"}, {name: "rate_limit"}, {name: "security_check"}],
      post: [{name: "audit_log"}, {name: "cache_response"}]
    },
    task: {
      pre: [{name: "task_lock"}],
      post: [{name: "audit_log"}]
    },
    tool: {
      pre: [{name: "auth_check"}],
      post: [{name: "audit_log"}]
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

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `workspace` | Workspace-level configuration |
| `middleware` | Request/response interceptors |
| `security` | Authentication and rate limiting |
