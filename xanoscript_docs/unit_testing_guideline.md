---
applyTo: "functions/**/*.xs,apis/**/*.xs"
---

# Unit Testing in XanoScript

Unit tests in XanoScript are defined using the `test` block inside a `function` or `query`. Each test can use various `expect` methods to assert the correctness of your code. Below are examples for all supported `expect` methods.

## Argument-based expects

These expects require a payload block with a `value` or other parameters.

### `expect.to_equal`

```xs
test "should match email" {
  expect.to_equal ($response.user.email) {
    value = "john@example.com"
  }
}
```

Checks that `$response.user.email` equals `"john@example.com"`.

### `expect.to_not_equal`

```xs
test "should not be error status" {
  expect.to_not_equal ($response.status) {
    value = "error"
  }
}
```

Checks that `$response.status` is not `"error"`.

### `expect.to_start_with`

```xs
test "should start with John" {
  expect.to_start_with ($response.user.name) {
    value = "John"
  }
}
```

Checks that `$response.user.name` starts with `"John"`.

### `expect.to_end_with`

```xs
test "should end with .pdf" {
  expect.to_end_with ($response.file.name) {
    value = ".pdf"
  }
}
```

Checks that `$response.file.name` ends with `".pdf"`.

### `expect.to_be_greater_than`

```xs
test "should be greater than 100" {
  expect.to_be_greater_than ($response.order.total) {
    value = 100
  }
}
```

Checks that `$response.order.total` is greater than `100`.

### `expect.to_be_less_than`

```xs
test "should be less than 10" {
  expect.to_be_less_than ($response.product.stock_quantity) {
    value = 10
  }
}
```

Checks that `$response.product.stock_quantity` is less than `10`.

### `expect.to_match`

```xs
test "should match US phone pattern" {
  expect.to_match ($response.user.phone) {
    value = "^\\+1\\d{10}$"
  }
}
```

Checks that `$response.user.phone` matches the regex pattern for a US phone number.

### `expect.to_contain`

```xs
test "should contain featured tag" {
  expect.to_contain ($response.tags) {
    value = "featured"
  }
}
```

Checks that `"featured"` is present in `$response.tags` array.

## Range expects

### `expect.to_be_within`

```xs
test "should be within range" {
  expect.to_be_within ($response.temperature) {
    min = 20
    max = 30
  }
}
```

Checks that `$response.temperature` is between `20` and `30` (inclusive).

## Argument-less expects

These expects do not require a payload block.

### `expect.to_be_true`

```xs
test "should be true" {
  expect.to_be_true ($response.is_active)
}
```

Checks that `$response.is_active` is `true`.

### `expect.to_be_false`

```xs
test "should be false" {
  expect.to_be_false ($response.is_deleted)
}
```

Checks that `$response.is_deleted` is `false`.

### `expect.to_be_in_the_past`

```xs
test "should be in the past" {
  expect.to_be_in_the_past ($response.created_at)
}
```

Checks that `$response.created_at` is a timestamp in the past.

### `expect.to_be_in_the_future`

```xs
test "should be in the future" {
  expect.to_be_in_the_future ($response.scheduled_at)
}
```

Checks that `$response.scheduled_at` is a timestamp in the future.

### `expect.to_be_defined`

```xs
test "should be defined" {
  expect.to_be_defined ($response.user_id)
}
```

Checks that `$response.user_id` is defined.

### `expect.to_not_be_defined`

```xs
test "should not be defined" {
  expect.to_not_be_defined ($response.optional_field)
}
```

Checks that `$response.optional_field` is not defined.

### `expect.to_be_null`

```xs
test "should be null" {
  expect.to_be_null ($response.deleted_at)
}
```

Checks that `$response.deleted_at` is `null`.

### `expect.to_not_be_null`

```xs
test "should not be null" {
  expect.to_not_be_null ($response.updated_at)
}
```

Checks that `$response.updated_at` is not `null`.

### `expect.to_be_empty`

```xs
test "should be empty" {
  expect.to_be_empty ($response.items)
}
```

Checks that `$response.items` is empty (array, string, etc).

## Exception expects

### `expect.to_throw`

```xs
test "should throw error" {
  expect.to_throw {
    value = "InvalidInputError"
  }
}
```

Checks that an error with value `"InvalidInputError"` was thrown.

```xs
test "should throw any error" {
  expect.to_throw
}
```

Checks that any error was thrown.

## Mocking

You can use the `mock` block inside your function or query to simulate external API responses or other data sources during unit testing. The mock will only be applied if its name matches the test name. This allows you to test your logic without making real network requests or depending on external systems.

Mocks can be placed on any statement with a return value, such as API requests (`...} as $foo`), variable declarations (`var $x`), or variable updates (`var.update $x`). This gives you flexibility to mock data at any point in your logic.

**Example with multiple tests and mocks:**

```xs
function get_weather {
  input {
    text city
  }

  stack {
    api.request {
      url = "https://api.weather.com/v1/current"
      method = "GET"
      params = {city: $input.city}
      mock = {
        "should return sunny weather": {response: {weather: "sunny"}}
        "should return rainy weather": {response: {weather: "rainy"}}
      }
    } as $weather_response

    var $weather_message {
      value = "Today's weather is " ~ $weather_response.response.weather
      mock = {
        "should return sunny weather": "Today's weather is sunny"
        "should return rainy weather": "Today's weather is rainy"
      }
    }
  }

  response = $weather_message

  test "should return sunny weather" {
    input = {city: "Paris"}

    expect.to_equal ($response) {
      value = "Today's weather is sunny"
    }
  }

  test "should return rainy weather" {
    input = {city: "London"}

    expect.to_equal ($response) {
      value = "Today's weather is rainy"
    }
  }
}
```

** Example without mocks **

```xs
query "add_number" verb=GET {
  input {
    int a
    int b
  }

  stack {
    var $sum {
      value = $input.a + $input.b
    }
  }

  response = $sum

  test "should add two numbers" {
    input = {a: 5, b: 10}
    expect.to_equal ($response) {
      value = 15
    }
  }
}

**How mocking works:**

- The `mock` block provides a fixed response for the statement it is attached to.
- The mock is only used if its name matches the test name.
- You can define multiple mocks for different test scenarios.
- Mocks can be placed on API requests, variable declarations, or updates—any statement with a return value.
- This ensures your tests run reliably and quickly, even when external services are unavailable.

Use mocks to isolate your code from external dependencies and focus on your business logic.
```
