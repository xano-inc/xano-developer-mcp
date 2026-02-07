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

debug.log { value = { step: "validation", data: $input } }
```

### With Labels

```xs
debug.log {
  label = "User Data"
  value = $user
}

debug.log {
  label = "Query Result"
  value = $products
}
```

### Conditional Logging

```xs
conditional {
  if ($env.DEBUG == "true") {
    debug.log {
      label = "Debug Info"
      value = {
        input: $input,
        auth: $auth,
        timestamp: now
      }
    }
  }
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

debug.stop                              // Execution pauses here

// Code below does not run
db.edit "user" { ... }
```

### Conditional Stop

```xs
conditional {
  if ($user == null) {
    debug.log { value = "User not found, stopping" }
    debug.stop
  }
}
```

### With Data Inspection

```xs
debug.log {
  label = "State at stop point"
  value = {
    input: $input,
    user: $user,
    calculated: $total
  }
}
debug.stop
```

---

## Logging Patterns

### Request Tracing

```xs
function "process_order" {
  input { int order_id }
  stack {
    var $trace_id { value = |uuid }

    debug.log {
      label = "TRACE_START"
      value = { trace_id: $trace_id, order_id: $input.order_id }
    }

    // ... processing ...

    debug.log {
      label = "TRACE_END"
      value = { trace_id: $trace_id, status: "success" }
    }
  }
}
```

### Error Context

```xs
try_catch {
  try {
    function.run "risky_operation" { input = $data }
  }
  catch {
    debug.log {
      label = "ERROR"
      value = {
        operation: "risky_operation",
        input: $data,
        error: $error.message,
        stack: $error.stack
      }
    }
    throw { name = $error.name, value = $error.message }
  }
}
```

### Performance Timing

```xs
var $start { value = now|to_ms }

db.query "product" { ... } as $products

var $query_time { value = (now|to_ms) - $start }

debug.log {
  label = "PERF"
  value = {
    operation: "product_query",
    duration_ms: $query_time,
    record_count: $products|count
  }
}
```

### Step-by-Step

```xs
debug.log { value = "Step 1: Validating input" }
// validation code

debug.log { value = "Step 2: Fetching user" }
db.get "user" { ... } as $user

debug.log { value = "Step 3: Processing order" }
// order processing

debug.log { value = "Step 4: Sending notification" }
// notification code

debug.log { value = "Complete" }
```

---

## Inspecting Variables

### Object Inspection

```xs
debug.log {
  label = "User object"
  value = $user
}

// Logs full object structure:
// {
//   id: 123,
//   name: "John",
//   email: "john@example.com",
//   ...
// }
```

### Array Inspection

```xs
debug.log {
  label = "Products"
  value = {
    count: $products|count,
    first: $products|first,
    last: $products|last,
    sample: $products|slice:0:3
  }
}
```

### Expression Evaluation

```xs
debug.log {
  label = "Calculated values"
  value = {
    total: $items|map:$$.price * $$.quantity|sum,
    tax: ($items|map:$$.price * $$.quantity|sum) * 0.08,
    item_count: $items|count
  }
}
```

---

## Environment-Based Debugging

### Development Only

```xs
conditional {
  if ($env.ENVIRONMENT == "development") {
    debug.log { value = "Development mode: verbose logging enabled" }
    debug.log { value = $input }
  }
}
```

### Debug Flag

```xs
// Enable with environment variable DEBUG=true
conditional {
  if ($env.DEBUG|to_bool == true) {
    debug.log {
      label = "Debug"
      value = { step: "after_query", data: $result }
    }
  }
}
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

## Debugging Strategies

### Isolate the Problem

```xs
// Comment out sections to isolate issues
debug.log { value = "Checkpoint 1" }
// potentially problematic code
debug.log { value = "Checkpoint 2" }
```

### Validate Assumptions

```xs
debug.log {
  label = "Assumption check"
  value = {
    user_exists: $user != null,
    has_permission: $user.role == "admin",
    input_valid: $input.amount > 0
  }
}
```

### Compare Expected vs Actual

```xs
var $expected { value = 100 }
var $actual { value = $items|count }

debug.log {
  label = "Comparison"
  value = {
    expected: $expected,
    actual: $actual,
    match: $expected == $actual
  }
}
```

---

## Best Practices

1. **Remove debug.stop in production** - Causes execution to halt
2. **Use labels consistently** - Makes log searching easier
3. **Log at boundaries** - Function entry/exit, external calls
4. **Include context** - IDs, timestamps, relevant state
5. **Don't log sensitive data** - Passwords, tokens, PII
6. **Use environment flags** - Enable verbose logging conditionally
7. **Check request history** - Built-in debugging in dashboard
