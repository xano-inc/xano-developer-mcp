---
applyTo: "functions/**/*.xs"
---

# How to Define Functions in XanoScript

A **function** in XanoScript is a reusable block of logic that can be called from other scripts, queries, or tasks. Functions are created in the `functions` folder and can be organized into subfolders for better structure.

## Function Structure

A function file consists of:

- The function name (e.g., `calculate_total`, `utilities/parse_email`)
- An optional `description` field
- An `input` block defining parameters
- A `stack` block containing the logic to execute
- A `response` block specifying the output

## Example Function

```xs
function "maths/calculate_total" {
  description = "Calculate the total cost based on quantity and price per item"

  input {
    int quantity filters=min:0 {
      description = "Number of items"
    }

    decimal price_per_item filters=min:0.01 {
      description = "Price for each item"
    }
  }

  stack {
    var $total {
      value = 0
      description = "Initialize total"
    }

    math.add $total {
      value = $input.quantity * $input.price_per_item
      description = "Calculate total"
    }
  }

  response = $total
}
```

## How to call a function in your code

You can call a function using the `function.run` keyword followed by the function's name.

**Example:**

```xs
function.run "maths/calculate_total" {
  input = {
    quantity: 5,
    price_per_item: 20
  }
} as $result
```

## Input Block

The `input` block defines the parameters your function expects. You can specify:

- Data types (`int`, `text`, `decimal`, etc.)
- Optional fields (add `?`)
- Filters (e.g., `trim`, `lower`)
- Metadata (`description`, `sensitive`)

**Example:**

```xs
input {
  text username filters=trim {
    description = "User's login name"
  }

  text email filters=trim {
    description = "User's email address"
  }

  date dob? {
    description = "User's date of birth (YYYY-MM-DD)"
    sensitive = true
  }
}
```

## Stack Block

The `stack` block contains the logic for your function, such as:

- Variable declarations (`var`)
- Control flow (`conditional`, `for`, `foreach`)
- Function calls (`math.add`, `debug.log`)
- Database operations (`db.query`, `db.add`)
- Error handling (`throw`, `try_catch`)

## Response Block

The `response` block defines what your function returns. The value can be a variable, object, or expression.

**Example:**

```xs
response = $total
```

## Best Practices

- Use `description` for documentation.
- Validate inputs with `filters=...` first, fallback on `precondition` or `conditional` blocks.
- Place all logic inside the `stack` block.
- Always define a `response` block for output.
- Organize functions in subfolders for clarity.

## Summary

- Place functions in the `functions` folder.
- Use `input` for parameters.
- Use `stack` for logic.
- Use `response` for output.
- Document your function with `description` fields.

For more examples, see the documentation or sample functions in your project.
