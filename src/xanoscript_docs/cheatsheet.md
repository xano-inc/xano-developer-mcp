---
applyTo: "**/*.xs"
---

# XanoScript Cheat Sheet

> **Purpose:** Quick reference for the 20 most common XanoScript patterns. For detailed documentation, use `xanoscript_docs({ topic: "<topic>" })`.

## Variable Declaration

```xs
var $name { value = "initial" }
var $count { value = 0 }
var $items { value = [] }
var $data { value = { key: "value" } }
```

## Conditionals

```xs
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
```

> **Note:** Use `elseif` (one word), not `else if`.

## Loops

```xs
// For each loop
each ($input.items as $item) {
  debug.log { value = $item.name }
}

// While loop (must be inside stack block)
stack {
  var $counter { value = 0 }
  while ($counter < 10) {
    each {
      var.update $counter { value = $counter + 1 }
    }
  }
}

// Map/filter for transformations
var $names { value = $items|map:$$.name }
var $active { value = $items|filter:$$.is_active }
```

## Database CRUD

```xs
// Get single record by field
db.get "user" {
  field_name = "id"
  field_value = $input.user_id
} as $user

// Query with filters
db.query "user" {
  where = $db.user.is_active == true
  sort = { created_at: "desc" }
  return = { type: "list", paging: { page: 1, per_page: 25 } }
} as $users

// Insert record
db.add "user" {
  data = { name: $input.name, email: $input.email, created_at: now }
} as $new_user

// Update record
db.edit "user" {
  field_name = "id"
  field_value = $input.user_id
  data = { name: $input.name, updated_at: now }
}

// Delete record
db.del "user" { field_name = "id", field_value = $input.user_id }
```

## API Requests

```xs
api.request {
  url = "https://api.example.com/endpoint"
  method = "POST"
  params = { key: "value" }              // Note: "params" for body, NOT "body"
  headers = [
    "Content-Type: application/json",
    "Authorization: Bearer " ~ $env.API_KEY
  ]
  timeout = 30
} as $api_result

// Response structure:
// $api_result.response.status  → HTTP status code (200, 404, etc.)
// $api_result.response.result  → Parsed response body
// $api_result.response.headers → Response headers
```

## Error Handling

```xs
// Precondition (stops execution if false)
precondition ($input.id > 0) {
  error_type = "inputerror"
  error = "ID must be positive"
}

// Try-catch
try_catch {
  try {
    // risky operation
  }
  catch {
    debug.log { value = "Operation failed" }
  }
}

// Throw custom error
throw {
  name = "ValidationError"
  value = "Custom error message"
}
```

## Error Types

| Type | HTTP Status | Use Case |
|------|-------------|----------|
| `inputerror` | 400 | Invalid input data |
| `accessdenied` | 403 | Authorization failure |
| `notfound` | 404 | Resource doesn't exist |
| `standard` | 500 | General errors |

## Common Filters

```xs
// String
$text|trim                    // Remove whitespace
$text|to_lower                // Lowercase
$text|to_upper                // Uppercase
$text|substr:0:10             // Substring
$text|split:","               // Split to array
$text|contains:"x"            // Check contains → bool
$text|strlen                  // Length of a string

// Array
$arr|first                    // First element
$arr|last                     // Last element
$arr|count                    // Length
$arr|map:$$.field             // Transform elements
$arr|filter:$$.active         // Filter by condition
$arr|find:$$.id == 5          // Find first match

// Type conversion
$val|to_text                  // To string
$val|to_int                   // To integer
$val|to_bool                  // To boolean
$val|json_encode              // To JSON string
$text|json_decode             // From JSON string

// Object
$obj|get:"key"                // Get property
$obj|get:"key":"default"      // Get with default
$obj|set:"key":"value"        // Set property
$obj|has:"key"                // Check key exists

// Null handling
$val|first_notnull:"default"  // Default if null
$val ?? "default"             // Nullish coalescing

// Math
$num|round:2                  // Round to 2 decimals
$num|abs                      // Absolute value
```

## Authentication Check

```xs
precondition ($auth.id != null) {
  error_type = "accessdenied"
  error = "Authentication required"
}
```

## Function Call

```xs
function.run "my_function" {
  input = { param1: "value" }
} as $result
```

## String Concatenation

```xs
// Basic
var $msg { value = "Hello, " ~ $input.name ~ "!" }

// With filters - MUST use parentheses
var $msg { value = ($status|to_text) ~ ": " ~ ($data|json_encode) }
```

## Common Type Names

| Use This | Not This |
|----------|----------|
| `text` | string |
| `int` | integer |
| `bool` | boolean |
| `decimal` | float, number |
| `type[]` | array, list |

## Reserved Variables (Cannot Use)

`$response`, `$output`, `$input`, `$auth`, `$env`, `$db`, `$this`, `$result`

## Input Block Syntax

`?` after the **type** = nullable, `?` after the **variable name** = optional (not required).

```xs
input {
  text name                    // Required, not nullable
  text? name                   // Required, nullable (can send null)
  text name?                   // Optional (can be omitted)
  text? name?                  // Optional and nullable
  text role?="user"            // Optional with default
  email contact filters=trim   // With filters
  text[] tags                  // Array type
  object address {             // Nested object
    schema {
      text street
      text city
    }
  }
}
```

---

**Related:** For detailed documentation, use:
- `xanoscript_docs({ topic: "quickstart" })` - Common patterns and mistakes
- `xanoscript_docs({ topic: "syntax" })` - All filters and operators
- `xanoscript_docs({ topic: "database" })` - All db.* operations
- `xanoscript_docs({ topic: "types" })` - Type validation and schemas
