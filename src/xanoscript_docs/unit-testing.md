---
applyTo: "function/**/*.xs, api/**/*.xs, middleware/**/*.xs"
---

# Unit Testing

Unit tests, mocks, and assertions defined inline within functions, API endpoints, and middleware. Unit tests validate individual construct behavior in isolation — for end-to-end workflow testing across multiple constructs, see `workflow-tests`.

## Quick Reference

```xs
function "<name>" {
  input { ... }
  stack { ... }
  response = $result

  test "<test name>" {
    input = { key: value }
    expect.<assertion> ($response) { value = expected }
  }
}
```

### Assertions
| Assertion | Purpose |
|-----------|---------|
| `expect.to_equal` | Exact match |
| `expect.to_not_equal` | Not equal |
| `expect.to_be_true` | Is true |
| `expect.to_be_false` | Is false |
| `expect.to_be_null` | Is null |
| `expect.to_contain` | Array contains |
| `expect.to_match` | Regex match |
| `expect.to_throw` | Throws error |

---

## Scope Limitations

> **Unit tests can only access `$response`** — the value declared in the construct's `response = ...` field. Tests do **not** have access to intermediate stack variables.

```xs
function "calculate" {
  input { int x }
  stack {
    var $doubled { value = $input.x * 2 }    // NOT accessible in tests
    var $result  { value = $doubled + 1 }    // NOT accessible in tests
  }
  response = $result                          // This becomes $response in tests

  test "doubles and adds one" {
    input = { x: 5 }
    // ✅ Can access $response (the declared response)
    expect.to_equal ($response) { value = 11 }

    // ❌ Stack variables are not in scope — this will fail
    // expect.to_equal ($doubled) { value = 10 }
  }
}
```

To assert on intermediate values, expose them through the response:

```xs
response = { result: $result, doubled: $doubled }

test "intermediate values" {
  input = { x: 5 }
  expect.to_equal ($response.doubled) { value = 10 }
  expect.to_equal ($response.result) { value = 11 }
}
```

> **Note:** Function stack variables (variables defined in other functions called via `function.run`) are also not accessible — tests are fully isolated to the construct's own declared response.

---

## Basic Test

```xs
function "add" {
  input {
    int a
    int b
  }
  stack {
    var $sum { value = $input.a + $input.b }
  }
  response = $sum

  test "adds two numbers" {
    input = { a: 5, b: 3 }
    expect.to_equal ($response) { value = 8 }
  }

  test "handles negative numbers" {
    input = { a: -5, b: 3 }
    expect.to_equal ($response) { value = -2 }
  }
}
```

---

## Assertions

### Value Assertions

```xs
// Equality
expect.to_equal ($response.status) { value = "active" }
expect.to_not_equal ($response.status) { value = "deleted" }

// Boolean
expect.to_be_true ($response.is_active)
expect.to_be_false ($response.is_deleted)

// Null
expect.to_be_null ($response.deleted_at)
expect.to_not_be_null ($response.created_at)

// Defined
expect.to_be_defined ($response.id)
expect.to_not_be_defined ($response.optional_field)

// Empty
expect.to_be_empty ($response.errors)
```

### Comparison Assertions

```xs
// Numeric comparisons
expect.to_be_greater_than ($response.total) { value = 100 }
expect.to_be_less_than ($response.stock) { value = 10 }

// Range
expect.to_be_within ($response.temperature) {
  min = 20
  max = 30
}
```

### String Assertions

```xs
// Starts/ends with
expect.to_start_with ($response.name) { value = "John" }
expect.to_end_with ($response.file) { value = ".pdf" }

// Contains
expect.to_contain ($response.tags) { value = "featured" }

// Regex match
expect.to_match ($response.phone) { value = "^\\+1\\d{10}$" }
```

### Time Assertions

```xs
expect.to_be_in_the_past ($response.created_at)
expect.to_be_in_the_future ($response.expires_at)
```

### Error Assertions

```xs
// Expects any error
test "throws on invalid input" {
  input = { amount: -1 }
  expect.to_throw
}

// Expects specific error
test "throws validation error" {
  input = { amount: -1 }
  expect.to_throw { value = "InvalidInputError" }
}
```

---

## Mocking

Mock external calls to isolate tests:

```xs
function "get_weather" {
  input { text city }
  stack {
    api.request {
      url = "https://api.weather.com/current"
      params = { city: $input.city }
      mock = {
        "returns sunny for Paris": { response: { weather: "sunny", temp: 22 } },
        "returns rainy for London": { response: { weather: "rainy", temp: 15 } }
      }
    } as $weather
  }
  response = $weather.response

  test "returns sunny for Paris" {
    input = { city: "Paris" }
    expect.to_equal ($response.weather) { value = "sunny" }
  }

  test "returns rainy for London" {
    input = { city: "London" }
    expect.to_equal ($response.weather) { value = "rainy" }
  }
}
```

### Mock Matching

Mocks activate when their key matches the test name:

```xs
stack {
  api.request {
    url = "https://api.example.com/data"
    mock = {
      "test name here": { response: { ... } },
      "another test": { response: { ... } }
    }
  } as $result
}
```

### Mocking Variables

```xs
stack {
  var $message {
    value = "Hello " ~ $input.name
    mock = {
      "custom greeting": "Custom greeting!"
    }
  }
}
```

---

## Testing API Endpoints

```xs
query "products/{id}" verb=GET {
  input {
    int id { table = "product" }
  }
  stack {
    db.get "product" {
      field_name = "id"
      field_value = $input.id
      mock = {
        "returns product": { id: 1, name: "Widget", price: 29.99 },
        "handles not found": null
      }
    } as $product
  }
  response = $product

  test "returns product" {
    input = { id: 1 }
    expect.to_equal ($response.name) { value = "Widget" }
  }

  test "handles not found" {
    input = { id: 999 }
    expect.to_be_null ($response)
  }
}
```

---

## Testing Error Cases

```xs
function "validate_age" {
  input { int age }
  stack {
    precondition ($input.age >= 0) {
      error_type = "inputerror"
      error = "Age cannot be negative"
    }
    precondition ($input.age <= 150) {
      error_type = "inputerror"
      error = "Age is unrealistic"
    }
  }
  response = { valid: true }

  test "accepts valid age" {
    input = { age: 25 }
    expect.to_equal ($response.valid) { value = true }
  }

  test "rejects negative age" {
    input = { age: -5 }
    expect.to_throw { value = "Age cannot be negative" }
  }

  test "rejects unrealistic age" {
    input = { age: 200 }
    expect.to_throw { value = "Age is unrealistic" }
  }
}
```

---

## Common Mistakes

### Testing Required Fields with Empty Strings

A required input field (no `?` after the name) rejects both `null` and empty strings at the platform level — **before your stack runs**. Writing a test that sends `""` to a required field will always get a validation error, never your custom precondition or error logic.

❌ **Wrong — will always throw a validation error, not your custom error:**
```xs
function "create_user" {
  input { text name }  // required: rejects null AND ""
  stack {
    precondition ($input.name != "") {
      error_type = "inputerror"
      error = "Name cannot be blank"
    }
  }
  response = { ok: true }

  // This test gets a validation error from the input layer, not "Name cannot be blank"
  test "rejects empty name" {
    input = { name: "" }
    expect.to_throw { value = "Name cannot be blank" }
  }
}
```

✅ **Correct — use an optional field if you need to test the empty/omitted case:**
```xs
function "create_user" {
  input { text name? }  // optional: accepts "", null, or omission
  stack {
    precondition ($input.name != null && $input.name != "") {
      error_type = "inputerror"
      error = "Name cannot be blank"
    }
  }
  response = { ok: true }

  test "rejects empty name" {
    input = { name: "" }
    expect.to_throw { value = "Name cannot be blank" }
  }

  test "rejects null name" {
    input = { name: null }
    expect.to_throw { value = "Name cannot be blank" }
  }

  test "accepts valid name" {
    input = { name: "Alice" }
    expect.to_equal ($response.ok) { value = true }
  }
}
```

For a full breakdown of what each required/optional/nullable combination accepts, see `xanoscript_docs({ topic: "types" })`.

---

## Complete Example

```xs
function "calculate_discount" {
  input {
    decimal subtotal filters=min:0
    enum customer_type { values = ["regular", "premium", "vip"] }
    text coupon?
  }
  stack {
    var $discount_rate { value = 0 }

    switch ($input.customer_type) {
      case ("premium") { var.update $discount_rate { value = 0.1 } } break
      case ("vip") { var.update $discount_rate { value = 0.2 } } break
      default { var.update $discount_rate { value = 0 } }
    }

    conditional {
      if ($input.coupon == "SAVE10") {
        math.add $discount_rate { value = 0.1 }
      }
    }

    var $discount { value = $input.subtotal * $discount_rate }
  }
  response = { discount: $discount, rate: $discount_rate }

  test "no discount for regular customer" {
    input = { subtotal: 100, customer_type: "regular" }
    expect.to_equal ($response.discount) { value = 0 }
  }

  test "10% discount for premium" {
    input = { subtotal: 100, customer_type: "premium" }
    expect.to_equal ($response.discount) { value = 10 }
  }

  test "20% discount for VIP" {
    input = { subtotal: 100, customer_type: "vip" }
    expect.to_equal ($response.discount) { value = 20 }
  }

  test "coupon stacks with VIP discount" {
    input = { subtotal: 100, customer_type: "vip", coupon: "SAVE10" }
    expect.to_equal ($response.rate) { value = 0.3 }
  }
}
```

---

## Best Practices

1. **Test happy paths, edge cases, and errors** - Cover expected, boundary, and failure scenarios
2. **Use mocks** - Isolate from external dependencies
3. **Descriptive test names** - Explain what's being tested
4. **One assertion focus** - Each test verifies one behavior
5. **Keep tests independent** - No shared state between tests

---

## Related Topics

| Topic             | Description                                        |
| ----------------- | -------------------------------------------------- |
| `workflow-tests`  | End-to-end workflow tests across multiple constructs |
| `functions`       | Reusable function stacks (where unit tests live)   |
| `apis`            | API endpoints (where unit tests live)              |
| `middleware`      | Request/response interceptors (where unit tests live) |
| `debugging`       | Logging and debugging test execution               |
