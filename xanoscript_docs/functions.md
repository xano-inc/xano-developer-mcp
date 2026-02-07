---
applyTo: "functions/**/*.xs"
---

# Functions

Reusable logic blocks in XanoScript.

## Quick Reference

```xs
function "<name>" {
  description = "What this function does"
  input {
    <type> <name> [filters=...] { description = "..." }
  }
  stack {
    # Logic here
  }
  response = $result
}
```

### Calling Functions
```xs
function.run "<name>" {
  input = { key: value }
} as $result
```

---

## Basic Structure

```xs
function "calculate_total" {
  input {
    int quantity filters=min:0
    decimal price filters=min:0
  }
  stack {
    var $total { value = $input.quantity * $input.price }
  }
  response = $total
}
```

### With Subfolders
Functions can be organized in subfolders:
```
functions/
├── math/
│   ├── add.xs
│   └── multiply.xs
├── utils/
│   └── format.xs
└── validate.xs
```

Reference with path: `function.run "math/add" { ... }`

---

## Input Block

See [types.md](types.md) for complete type reference.

```xs
input {
  text name filters=trim
  int age? filters=min:0
  email contact filters=lower { sensitive = true }
  object address? {
    schema {
      text street
      text city
      text zip
    }
  }
}
```

---

## Stack Block

Contains the function logic using control flow, variables, and operations.

### Variables
```xs
stack {
  var $counter { value = 0 }
  var $data { value = { name: "test", items: [] } }

  var.update $counter { value = $counter + 1 }
  var.update $data.name { value = "updated" }
}
```

### Conditionals
```xs
stack {
  conditional {
    if ($input.age >= 18) {
      var $status { value = "adult" }
    }
    elseif ($input.age >= 13) {
      var $status { value = "teen" }
    }
    else {
      var $status { value = "child" }
    }
  }
}
```

### Loops
```xs
stack {
  # For loop (count-based)
  for (10) {
    each as $i {
      debug.log { value = $i }
    }
  }

  # Foreach (array iteration)
  foreach ($input.items) {
    each as $item {
      debug.log { value = $item.name }
    }
  }

  # While loop
  while ($counter < 5) {
    each {
      math.add $counter { value = 1 }
    }
  }
}
```

### Switch
```xs
stack {
  switch ($input.status) {
    case ("active") {
      var $message { value = "User is active" }
    } break
    case ("pending") {
      var $message { value = "User is pending" }
    } break
    default {
      var $message { value = "Unknown status" }
    }
  }
}
```

### Error Handling
```xs
stack {
  try_catch {
    try {
      function.run "risky_operation" { input = {} } as $result
    }
    catch {
      debug.log { value = "Operation failed" }
      var $result { value = null }
    }
    finally {
      debug.log { value = "Cleanup complete" }
    }
  }
}
```

### Throwing Errors
```xs
stack {
  precondition ($input.amount > 0) {
    error_type = "inputerror"
    error = "Amount must be positive"
  }

  throw {
    name = "ValidationError"
    value = "Custom error message"
  }
}
```

### Early Return
```xs
stack {
  conditional {
    if ($input.skip) {
      return { value = null }
    }
  }
  # Continue processing...
}
```

---

## Response Block

Specify what the function returns:

```xs
response = $total                    # Single variable
response = { success: true, data: $result }   # Object literal
response = $items|first              # With filter
response = null                      # No return value
```

---

## Calling Functions

### Basic Call
```xs
function.run "calculate_total" {
  input = { quantity: 5, price: 10.50 }
} as $total
```

### With Variables
```xs
function.run "process_order" {
  input = {
    user_id: $auth.id,
    items: $input.cart_items,
    shipping: $input.address
  }
} as $order
```

### Nested Calls
```xs
stack {
  function.run "validate_user" {
    input = { user_id: $input.user_id }
  } as $user

  function.run "calculate_discount" {
    input = { user: $user, amount: $input.total }
  } as $discount

  var $final_total { value = $input.total - $discount }
}
```

---

## Complete Examples

### Utility Function
```xs
function "utils/format_currency" {
  description = "Format number as currency string"
  input {
    decimal amount
    text currency?="USD"
  }
  stack {
    var $formatted {
      value = $input.amount|number_format:2:".":","
    }
    var $result {
      value = $input.currency ~ " " ~ $formatted
    }
  }
  response = $result
}
```

### Data Processing
```xs
function "process_order" {
  input {
    int user_id { table = "user" }
    object[] items {
      schema {
        int product_id
        int quantity
      }
    }
  }
  stack {
    var $total { value = 0 }

    foreach ($input.items) {
      each as $item {
        db.get "product" {
          field_name = "id"
          field_value = $item.product_id
        } as $product

        math.add $total {
          value = $product.price * $item.quantity
        }
      }
    }

    db.add "order" {
      data = {
        user_id: $input.user_id,
        total: $total,
        status: "pending"
      }
    } as $order
  }
  response = $order
}
```

### Validation Function
```xs
function "validate_email_unique" {
  input {
    email email filters=lower
    int exclude_id?
  }
  stack {
    db.query "user" {
      where = $db.user.email == $input.email && $db.user.id != $input.exclude_id
      return = { type: "exists" }
    } as $exists

    precondition (!$exists) {
      error_type = "inputerror"
      error = "Email already in use"
    }
  }
  response = true
}
```

---

## Best Practices

1. **Single responsibility** - Each function does one thing well
2. **Descriptive names** - Use verb_noun format: `calculate_total`, `validate_user`
3. **Organize in folders** - Group related functions: `utils/`, `auth/`, `orders/`
4. **Validate inputs** - Use filters and preconditions
5. **Handle errors** - Use try_catch for external calls
6. **Document purpose** - Add description field
7. **Return early** - Use return for guard clauses
8. **Keep stacks shallow** - Avoid deeply nested conditionals
