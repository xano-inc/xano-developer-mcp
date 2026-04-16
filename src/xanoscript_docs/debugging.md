---
applyTo: "**/*.xs"
---

# Debugging

Tools for logging, inspecting, and debugging XanoScript execution.

## Quick Reference

| Operation | Purpose |
|-----------|---------|
| `debug.log` | Log message to console |
| `debug.stop` | Stop execution at point |
| Request history | View past executions |

---

## debug.log

Log messages and values for debugging.

```xs
debug.log { value = "Starting process" }

debug.log { value = $user }

debug.log {
  value = $user
}
```

---

## debug.stop

Halt execution at a specific point for inspection.

```xs
debug.log { value = "Before database call" }

db.query "user" {
  where = $db.user.id == $input.user_id
} as $user

debug.stop {
  value = "Execution pauses here"
}

// Code below does not run
db.edit "user" { ... }
```

---

## Request History

View past request executions in the Xano dashboard:

1. Navigate to API endpoint or function
2. Click "Request History"
3. View inputs, outputs, and debug logs
4. Inspect step-by-step execution

### What's Captured

- Input parameters
- Output response
- All debug.log messages
- Execution time per step
- Database queries executed
- External API calls made
- Errors and stack traces

---

## Best Practices

1. **Remove debug.stop in production** - Causes execution to halt
2. **Don't log sensitive data** - Passwords, tokens, PII

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `performance` | Performance profiling and optimization |
| `unit-testing` | Unit testing functions |
| `workflow-tests` | End-to-end workflow testing |
