---
applyTo: "workflow_test/**/*.xs"
---

# Workflow Tests

End-to-end workflow tests that call Xano constructs (APIs, functions, tasks, etc.) and validate results with assertions. The `stack` block supports all standard XanoScript statements (variables, conditionals, loops, database operations, etc.) in addition to the call functions and assertions documented below.

## Quick Reference

```xs
workflow_test "<name>" {
  datasource = "live"
  stack { ... }
  tags = ["tag1", "tag2"]
}
```

| Property     | Required | Default | Description                                      |
| ------------ | -------- | ------- | ------------------------------------------------ |
| `datasource` | No       | (empty) | Data source to run against: custom name or `"live"` (not recommended — clones entire datasource) |
| `stack`      | Yes      | —       | Test execution logic using call functions and assertions |
| `tags`       | No       | `[]`    | Tags for organizing and filtering workflow tests  |

---

## Call Functions

Call functions invoke Xano constructs and capture their results. Each returns a result that can be stored with `as $variable`.

| Call Function     | Description                    | Required Properties                  |
| ----------------- | ------------------------------ | ------------------------------------ |
| `api.call`        | Call an API endpoint           | `api_group`, `verb` (on call), optional `headers` |
| `addon.call`      | Call an addon                  | —                                    |
| `function.call`   | Call a function                | optional `input`                     |
| `middleware.call`  | Call a middleware               | `input` with `vars` and `type`       |
| `task.call`       | Call a task                    | —                                    |
| `tool.call`       | Call a tool                    | —                                    |
| `trigger.call`    | Call a trigger                 | `input` with `new`, `old`, `action`, `datasource` |

### api.call

```xs
api.call "<endpoint_name>" verb=GET {
  api_group = "<group_name>"
  headers = '["Content-Type: application/json"]'
} as $result
```

### addon.call

```xs
addon.call "<addon_name>" as $result
```

### function.call

> **Important:** Always use `function.call` in workflow tests, not `function.run`. `function.call` handles errors internally, which is required for `expect` assertions (such as `expect.to_throw`) to work correctly. `function.run` is for calling functions from other primitives (APIs, functions, tasks, etc.) outside of workflow tests.

```xs
function.call "<function_name>" {
  input = { key: "value" }
} as $result
```

### middleware.call

```xs
middleware.call "<middleware_name>" {
  input = {vars: {}, type: "pre"}
} as $result
```

### task.call

```xs
task.call "<task_name>" as $result
```

### tool.call

```xs
tool.call "<tool_name>" as $result
```

### trigger.call

```xs
trigger.call "<trigger_name>" {
  input = {new: {}, old: {}, action: "", datasource: ""}
} as $result
```

---

## Assertions

Assertions validate results within the workflow test stack. Each takes a variable reference as the target.

### Quick Reference

| Assertion                  | Purpose                 | Properties          |
| -------------------------- | ----------------------- | ------------------- |
| `expect.to_be_defined`     | Value is defined        | —                   |
| `expect.to_not_be_defined` | Value is not defined    | —                   |
| `expect.to_be_empty`       | Value is empty          | —                   |
| `expect.to_be_true`        | Value is true           | —                   |
| `expect.to_be_false`       | Value is false          | —                   |
| `expect.to_be_null`        | Value is null           | —                   |
| `expect.to_not_be_null`    | Value is not null       | —                   |
| `expect.to_be_in_the_past` | Timestamp is in the past| —                   |
| `expect.to_be_in_the_future`| Timestamp is in the future| —               |
| `expect.to_equal`          | Exact match             | `value`             |
| `expect.to_not_equal`      | Not equal               | `value`             |
| `expect.to_be_greater_than`| Greater than            | `value`             |
| `expect.to_be_less_than`   | Less than               | `value`             |
| `expect.to_be_within`      | Within range            | `min`, `max`        |
| `expect.to_contain`        | Contains value          | `value`             |
| `expect.to_start_with`     | Starts with string      | `value`             |
| `expect.to_end_with`       | Ends with string        | `value`             |
| `expect.to_match`          | Regex match             | `value` (pattern)   |
| `expect.to_throw`          | Stack throws error      | `stack`, `exception` |

### No-Property Assertions

These take only the target variable:

```xs
expect.to_be_defined ($var)
expect.to_not_be_defined ($var)
expect.to_be_empty ($var)
expect.to_be_true ($var)
expect.to_be_false ($var)
expect.to_be_null ($var)
expect.to_not_be_null ($var)
expect.to_be_in_the_past ($var)
expect.to_be_in_the_future ($var)
```

### Value Assertions

These take a `value` property for comparison. The value can be a literal or a variable reference:

```xs
expect.to_equal ($var) { value = "expected" }
expect.to_not_equal ($var) { value = $other_var }
expect.to_be_greater_than ($var) { value = 3 }
expect.to_be_less_than ($var) { value = $other_var }
expect.to_contain ($var) { value = "substring" }
expect.to_start_with ($var) { value = "prefix" }
expect.to_end_with ($var) { value = "suffix" }

// Regex pattern
expect.to_match ($var) { value = "^\\d+$" }
```

### Range Assertion

```xs
expect.to_be_within ($var) {
  min = 1
  max = 100
}
```

### Error Assertion

`expect.to_throw` wraps a `stack` block and checks that it throws a matching exception:

```xs
expect.to_throw {
  stack {
    security.create_uuid as $x1
  }

  exception = "error"
}
```

---

## Data Sources

The `datasource` property controls which data source the test runs against.

**Avoid using `datasource = "live"`.** When a workflow test runs, the entire datasource is cloned so that real data is not modified. This cloning step can be slow, especially for large datasources. Prefer running without a datasource or using a smaller custom datasource instead.

### Default (No Data Source) — Recommended

```xs
workflow_test "basic_check" {
  stack {
    function.call "health_check" as $result
    expect.to_be_defined ($result)
  }
}
```

### Custom Data Source

```xs
workflow_test "staging_data_check" {
  datasource = "staging"
  stack {
    function.call "get_products" as $products
    expect.to_be_defined ($products)
  }
}
```

### Live Data Source (Not Recommended)

Using `datasource = "live"` clones the entire live datasource before running the test. Only use this when you specifically need to validate against production data.

```xs
workflow_test "live_data_check" {
  datasource = "live"
  stack {
    function.call "get_active_users" as $users
    expect.to_be_defined ($users)
  }
}
```

---

## Tags

Use tags to organize and filter workflow tests:

```xs
workflow_test "checkout_flow" {
  tags = ["checkout", "critical", "e2e"]
  stack {
    function.call "create_cart" as $cart
    expect.to_be_defined ($cart)
  }
}
```

---

## Complete Example

This example demonstrates all call functions and all assertion types:

```xs
workflow_test "comprehensive_test" {
  datasource = "live"

  stack {
    // Call functions
    api.call "test" verb=GET {
      api_group = "test"
      headers = '["Content-Type: application/json"]'
    } as $endpoint1

    addon.call "my_addon" as $addon1
    function.call "my_function" {
      input = {name: "Justin"}
    } as $function1

    middleware.call "my_middleware" {
      input = {vars: {}, type: "pre"}
    } as $middleware1

    task.call "my_task" as $task1
    tool.call "my_tool" as $tool1
    trigger.call "my_trigger" {
      input = {new: {}, old: {}, action: "", datasource: ""}
    } as $trigger1

    // No-property assertions
    expect.to_be_defined ($endpoint1)
    expect.to_be_empty ($addon1)
    expect.to_be_false ($endpoint1)
    expect.to_be_true ($addon1)
    expect.to_be_null ($middleware1)
    expect.to_not_be_null ($endpoint1)
    expect.to_not_be_defined ($function1)
    expect.to_be_in_the_past ($endpoint1)
    expect.to_be_in_the_future ($endpoint1)

    // Value assertions
    expect.to_equal ($endpoint1) { value = $endpoint1 }
    expect.to_not_equal ($endpoint1) { value = $addon1 }
    expect.to_be_greater_than ($endpoint1) { value = 3 }
    expect.to_be_less_than ($addon1) { value = $task1 }
    expect.to_contain ($endpoint1) { value = "asdf" }
    expect.to_start_with ($addon1) { value = "f" }
    expect.to_end_with ($addon1) { value = "asdf" }

    // Regex pattern
    expect.to_match ($endpoint1) { value = ".*" }

    // Range assertion
    expect.to_be_within ($endpoint1) {
      min = 1
      max = 4
    }

    // Error assertion
    expect.to_throw {
      stack {
        security.create_uuid as $x1
      }

      exception = "error"
    }
  }

  tags = ["a", "b"]
}
```

---

## Best Practices

1. **Use descriptive names** — Name tests after the workflow being tested: `user_signup_flow`, `checkout_process`
2. **Tag for filtering** — Use tags like `critical`, `e2e`, `smoke` to organize test suites
3. **Avoid `datasource = "live"`** — The entire datasource is cloned before each test run, which can be slow. Use no datasource or a smaller custom datasource instead
4. **Keep tests independent** — Each workflow test should be self-contained and not depend on other tests
5. **Use `function.call`, not `function.run`** — `function.call` handles errors so that `expect` assertions work correctly. `function.run` is for calling functions outside of workflow tests
6. **Use assertions over preconditions** — Prefer `expect.*` assertions for clearer test intent
7. **Don't test required fields with empty strings** — Required inputs reject both `null` and `""` at the platform level before your stack runs. If you send `""` to a required `text` field, you'll always get a platform validation error — never your custom logic. To test the empty/blank case, the input must be declared optional (`text name?`). See `xanoscript_docs({ topic: "types" })` for the full breakdown.

---

## Related Topics

| Topic          | Description                                |
| -------------- | ------------------------------------------ |
| `unit-testing` | Unit tests and assertions within functions |
| `functions`    | Reusable function stacks called in tests   |
| `database`     | Database operations used in test stacks    |
| `debugging`    | Logging and debugging test execution       |
