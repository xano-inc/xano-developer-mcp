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
    // Logic here
  }
  response = $result
}

// Function with no inputs - IMPORTANT: braces must be on separate lines
function "<name>" {
  description = "..."
  input {
  }
  stack { ... }
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

For complete type and filter reference, use `xanoscript_docs({ topic: "types" })`.

```xs
input {
  text name filters=trim
  int age? filters=min:0
  email contact filters=lower { sensitive = true }
}
```

### Empty Input Blocks

**CRITICAL:** When a function has no input parameters, the input block braces MUST be on separate lines. This is a syntax requirement.

```xs
// CORRECT - braces on separate lines
function "get_all_users" {
  description = "Returns all users"
  input {
  }
  stack {
    db.query "user" {} as $users
  }
  response = $users
}

// WRONG - will cause parsing errors
function "get_all_users" {
  description = "Returns all users"
  input {}    // <-- ERROR: braces must be on separate lines
  stack {
    db.query "user" {} as $users
  }
  response = $users
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
  // For loop (count-based)
  for (10) {
    each as $i {
      debug.log { value = $i }
    }
  }

  // Foreach (array iteration)
  foreach ($input.items) {
    each as $item {
      debug.log { value = $item.name }
    }
  }

  // While loop
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

For complete error handling reference (preconditions, try-catch, throw, early return), use `xanoscript_docs({ topic: "syntax" })`.

---

## Response Block

Specify what the function returns:

```xs
response = $total                    // Single variable
response = { success: true, data: $result }   // Object literal
response = $items|first              // With filter
response = null                      // No return value
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

## Async Operations

### await

Wait for an asynchronous operation to complete.

```xs
stack {
  api.request {
    url = "https://api.example.com/data"
    method = "GET"
    async = true
  } as $request

  await $request as $result
}
```

### group (Parallel Execution)

Execute multiple operations in parallel and wait for all to complete.

```xs
stack {
  group {
    api.request {
      url = "https://api.example.com/users"
      method = "GET"
    } as $users

    api.request {
      url = "https://api.example.com/products"
      method = "GET"
    } as $products

    api.request {
      url = "https://api.example.com/orders"
      method = "GET"
    } as $orders
  }

  // All three requests complete before continuing
  var $combined {
    value = {
      users: $users.response.result,
      products: $products.response.result,
      orders: $orders.response.result
    }
  }
}
```

### Parallel Database Queries

```xs
stack {
  group {
    db.query "user" {
      where = $db.user.is_active == true
      return = { type: "count" }
    } as $active_users

    db.query "order" {
      where = $db.order.created_at >= $input.start_date
      return = { type: "count" }
    } as $order_count

    db.query "product" {
      where = $db.product.stock == 0
      return = { type: "count" }
    } as $out_of_stock
  }

  response = {
    active_users: $active_users,
    orders: $order_count,
    out_of_stock: $out_of_stock
  }
}
```

---

## Advanced Loop Patterns

### remove (In-Loop Deletion)

Remove the current element during foreach iteration.

```xs
stack {
  var $items { value = $input.items }

  foreach ($items) {
    each as $item {
      conditional {
        if ($item.expired == true) {
          remove
        }
      }
    }
  }

  // $items now excludes expired items
}
```

### as (Variable Aliasing)

Alias loop variables for clearer access.

```xs
foreach ($orders) {
  each as $order {
    // $order available here
    foreach ($order.items) {
      each as $item {
        // Both $order and $item available
        db.add "order_item" {
          data = {
            order_id: $order.id,
            product_id: $item.product_id,
            quantity: $item.quantity
          }
        }
      }
    }
  }
}
```

### Loop Control

```xs
foreach ($items) {
  each as $item {
    conditional {
      if ($item.skip) {
        continue                              // Skip to next iteration
      }
    }

    conditional {
      if ($item.stop) {
        break                                 // Exit loop entirely
      }
    }

    // Process item
  }
}
```

### Loop with Index

```xs
foreach ($items) {
  each as $item, $index {
    db.add "item" {
      data = {
        value: $item,
        position: $index
      }
    }
  }
}
```

---

## Best Practices

1. **Single responsibility** - Each function does one thing well
2. **Descriptive names** - Use verb_noun format: `calculate_total`, `validate_user`
3. **Organize in folders** - Group related functions: `utils/`, `auth/`, `orders/`
4. **Return early** - Use return for guard clauses
5. **Keep stacks shallow** - Avoid deeply nested conditionals
6. **Use group for parallel calls** - Improves performance for independent operations
7. **Use remove sparingly** - Consider filtering arrays instead
