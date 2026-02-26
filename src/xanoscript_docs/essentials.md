---
applyTo: "**/*.xs"
---

# XanoScript Essentials

Essential patterns, quick reference, and common mistakes for XanoScript development.

> **TL;DR:** Use `text` not `string`, `elseif` not `else if`, `params` not `body` for api.request, parentheses around filters in expressions.

## Quick Reference

### Variable Access Rules

**Inputs must use `$input.fieldname` — no shorthand exists.**

```xs
input {
  text name
  int age
}

// Wrong — $name is not defined; inputs live on $input
// var $greeting { value = "Hello, " ~ $name }

// Correct
var $greeting { value = "Hello, " ~ $input.name }
var $is_adult { value = $input.age >= 18 }
```

**Stack variables have an optional `$var.` prefix — both forms are identical.**

```xs
var $total { value = 100 }
$var.total       // explicit prefix form
$total           // shorthand form (no prefix)
```

### Reserved Variable Names

These variable names are reserved and cannot be used: `$response`, `$output`, `$input`, `$auth`, `$env`, `$db`, `$this`, `$result`, `$index`.

```xs
// Wrong - $response is reserved
// var $response { value = "test" }

// Correct - use a different name
var $api_response { value = "test" }
```

### Type Names

XanoScript uses specific type names. Common aliases from other languages won't work.

> **Full reference:** See `xanoscript_docs({ topic: "types" })` for complete type details and validation.

| Wrong | Correct | Description |
|-------|---------|-------------|
| `boolean` | `bool` | Boolean true/false |
| `integer` | `int` | 32-bit integer |
| `string` | `text` | UTF-8 string |
| `number` / `float` | `decimal` | Floating-point number |
| `array` / `list` | `type[]` | Array (e.g., `text[]`, `int[]`) |

### Variable Declaration

```xs
var $name { value = "initial" }
var $count { value = 0 }
var $items { value = [] }
var $data { value = { key: "value" } }
```

### Conditionals

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

### Switch

```xs
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
```

> **Note:** `break` goes **after** the closing `}` of each `case` block. The `default` case does not need `break`.

### Loops

```xs
// For each loop
foreach ($input.items) {
  each as $item {
    debug.log { value = $item.name }
  }
}

// For loop (iterate N times)
for (10) {
  each as $idx {
    debug.log { value = $idx }
  }
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

### Database CRUD

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
db.del "user" {
  field_name = "id"
  field_value = $input.user_id
}
```

> **Full reference:** See `xanoscript_docs({ topic: "database" })` for joins, bulk operations, transactions, and more.

### API Requests

```xs
api.request {
  url = "https://api.example.com/endpoint"
  method = "POST"
  params = $payload              // Note: "params" for body, NOT "body"
  headers = [
    "Content-Type: application/json",
    "Authorization: Bearer " ~ $env.API_KEY
  ]
  timeout = 30
} as $api_result

// Response structure:
// $api_result.response.status  -> HTTP status code (200, 404, etc.)
// $api_result.response.result  -> Parsed response body
// $api_result.response.headers -> Response headers
```

### Error Handling

```xs
// Precondition (stops execution if false)
precondition ($input.id > 0) {
  error_type = "inputerror"
  error = "ID must be positive"
}

// Try-catch
try_catch {
  try {
    api.request {
      url = "https://api.example.com/risky"
      method = "GET"
    } as $result
  }
  catch {
    debug.log { value = "Request failed, using fallback" }
    var $result { value = { response: { result: null } } }
  }
}

// Throw custom error
throw {
  name = "ValidationError"
  value = "Custom error message"
}
```

### Error Types

| Type | HTTP Status | Use Case |
|------|-------------|----------|
| `inputerror` | 400 Bad Request | Invalid input data |
| `accessdenied` | 403 Forbidden | Authorization failure |
| `notfound` | 404 Not Found | Resource doesn't exist |
| `standard` | 500 Internal Server Error | General errors |

### Input Block Syntax

`?` after the **type** = nullable, `?` after the **variable name** = optional (not required).

> **Full reference:** See `xanoscript_docs({ topic: "types" })` for complete input types and validation options.

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

### Common Filters

```xs
// String
$text|trim                    // Remove whitespace
$text|to_lower                // Lowercase
$text|to_upper                // Uppercase
$text|substr:0:10             // Substring
$text|split:","               // Split to array
$text|contains:"x"            // Check contains -> bool
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
```

> **Full reference:** See `xanoscript_docs({ topic: "syntax" })` for all 100+ filters organized by category (string, array, object, type, date, encoding).

### String Concatenation

```xs
// Basic
var $msg { value = "Hello, " ~ $input.name ~ "!" }

// With filters - MUST use parentheses
var $msg { value = ($status|to_text) ~ ": " ~ ($data|json_encode) }
```

### Authentication Check

```xs
precondition ($auth.id != null) {
  error_type = "accessdenied"
  error = "Authentication required"
}
```

### Function Call

```xs
function.run "my_function" {
  input = { param1: "value" }
} as $result
```

### Early Return

Stop execution and return a value immediately. Useful for guard clauses.

```xs
conditional {
  if ($input.skip) {
    return { value = null }
  }
}
```

---

## Common Patterns

### 1. Input Validation

```xs
precondition ($input.email != null && $input.email != "") {
  error_type = "inputerror"
  error = "Email is required"
}

precondition ($input.email|contains:"@") {
  error_type = "inputerror"
  error = "Invalid email format"
}
```

### 2. Optional Field Handling

```xs
// Build object with optional fields
var $data { value = { required_field: $input.required } }

conditional {
  if ($input.optional_field != null) {
    var.update $data { value = $data|set:"optional_field":$input.optional_field }
  }
}

// Or use set_ifnotnull
var $data {
  value = { required: $input.required }|set_ifnotnull:"optional":$input.optional
}
```

### 3. Pagination

```xs
var $page { value = $input.page ?? 1 }
var $limit { value = $input.limit ?? 20 }
var $offset { value = ($page - 1) * $limit }

db.query "item" {
  where = $db.item.is_active == true
  order = [{ field: created_at, direction: desc }]
  paging = { limit: $limit, offset: $offset }
  count = true
} as $result

response = {
  items: $result.items,
  total: $result.count,
  page: $page,
  pages: ($result.count / $limit)|ceil
}
```

### 4. Building Complex Objects

```xs
// Step by step
var $response_data { value = {} }
var.update $response_data { value = $response_data|set:"user":$user }
var.update $response_data { value = $response_data|set:"posts":$posts }
var.update $response_data { value = $response_data|set:"stats":{ count: $posts|count } }

// Or all at once
var $response_data {
  value = {
    user: $user,
    posts: $posts,
    stats: { count: $posts|count }
  }
}
```

### 5. Date/Time Operations

> **Full reference:** See `xanoscript_docs({ topic: "syntax" })` for all date/time filters.

```xs
var $now { value = now }
var $formatted { value = now|format_timestamp:"Y-m-d H:i:s":"UTC" }
var $yesterday { value = now|transform_timestamp:"-1 day" }
var $next_week { value = now|transform_timestamp:"+7 days" }

db.query "event" {
  where = $db.event.start_date >= now
} as $upcoming_events
```

### 6. JSON API Response

```xs
api.request {
  url = "https://api.openai.com/v1/chat/completions"
  method = "POST"
  params = {
    model: "gpt-4",
    messages: [{ role: "user", content: $input.prompt }]
  }
  headers = [
    "Content-Type: application/json",
    "Authorization: Bearer " ~ $env.OPENAI_API_KEY
  ]
} as $api_result

conditional {
  if ($api_result.response.status == 200) {
    var $answer { value = $api_result.response.result.choices|first|get:"message"|get:"content" }
  }
  else {
    throw {
      name = "APIError"
      value = "OpenAI API error: " ~ ($api_result.response.status|to_text)
    }
  }
}
```

### 7. Resource Ownership Check

```xs
precondition ($auth.id != null) {
  error_type = "accessdenied"
  error = "Authentication required"
}

db.get "post" {
  where = $db.post.id == $input.post_id
} as $post

precondition ($post.user_id == $auth.id) {
  error_type = "accessdenied"
  error = "You can only edit your own posts"
}
```

---

## Common Mistakes

### 1. Using `else if` instead of `elseif`
```xs
// Wrong
// conditional { if (...) { } else if (...) { } }

// Correct
conditional {
  if (...) { }
  elseif (...) { }
}
```

### 2. Missing parentheses in filter concatenation
```xs
// Wrong - parse error
// var $msg { value = $status|to_text ~ " - " ~ $data|json_encode }

// Correct - wrap filtered expressions in parentheses
var $msg { value = ($status|to_text) ~ " - " ~ ($data|json_encode) }
```

### 3. Missing parentheses in filter comparisons
```xs
// Wrong - parse error
// if ($array|count > 0) { }

// Correct - wrap filter expression in parentheses
if (($array|count) > 0) { }
```

### 4. Using `body` instead of `params` for api.request
```xs
// Wrong - "body" is not valid
// api.request { url = "..." method = "POST" body = $payload }

// Correct - use "params" for request body
api.request {
  url = "..."
  method = "POST"
  params = $payload
}
```

### 5. Using `default` filter (doesn't exist)
```xs
// Wrong - no "default" filter exists
// var $value { value = $input.optional|default:"fallback" }

// Correct - use first_notnull or ?? operator
var $value { value = $input.optional|first_notnull:"fallback" }
// or
var $value { value = $input.optional ?? "fallback" }
```

### 6. Using reserved variable names
```xs
// Wrong - $response is reserved
// var $response { value = "test" }

// Correct - use a different name
var $api_response { value = "test" }
```

### 7. Wrong type names
```xs
// Wrong
// input { boolean active  integer count  string name }

// Correct
input {
  bool active
  int count
  text name
}
```

### 8. Object literal syntax (using = instead of :)
```xs
// Wrong - object literals use : not =
// var $data { value = { customer = $id } }

// Correct - use : for object properties
var $data { value = { customer: $id } }
```

### 9. Commas in block properties (`=`) vs object literals (`:`)

Block properties use `=` and go on **separate lines with no commas**. Object literals use `:` and **require commas** between entries.

```xs
// Wrong - block properties don't use commas
// throw { name = "Error", value = "message" }

// Correct - no commas between block properties (=)
throw {
  name = "Error"
  value = "message"
}

// Correct - object literals (:) DO use commas
db.query "dad_jokes" {
  sort = {dad_jokes.id: "rand", dad_jokes.joke: "asc"}
  return = {type: "single"}
} as $joke
```

### 10. Using $env in run.job input blocks
```xs
// Wrong - $env not allowed in input blocks
// run.job "my_job" { input { text api_key = $env.API_KEY } }

// Correct - access $env in the stack instead
run.job "my_job" {
  stack {
    var $api_key { value = $env.API_KEY }
  }
}
```

### 11. Using `object` type without schema
```xs
// Wrong - object requires a schema
// input { object data }

// Correct - use json for arbitrary data
input {
  json data
}

// Or define a schema for object
input {
  object data {
    schema {
      text name
      int id
    }
  }
}
```

### 12. While loop outside of stack block
```xs
// Wrong - while must be inside stack
// while (true) { each { ... } }

// Correct - wrap in stack block
stack {
  while (true) {
    each { ... }
  }
}
```

### 13. Multiple constructs in one file

Each `.xs` file must contain exactly **one** construct. Placing two constructs in the same file causes a parse error.

```
// Wrong - two constructs in one file
// function "helper_a" { ... }
// function "helper_b" { ... }

// Correct - one construct per file
// function/helper_a.xs -> contains only "helper_a"
// function/helper_b.xs -> contains only "helper_b"
```

---

## Related Topics

Explore more with `xanoscript_docs({ topic: "<topic>" })`:

| Topic | Description |
|-------|-------------|
| `syntax` | Complete filter reference, operators, system variables |
| `types` | Data types, input validation, schema definitions |
| `database` | All db.* operations: query, get, add, edit, delete |
| `functions` | Reusable function stacks, async patterns, loops |
| `apis` | HTTP endpoints, authentication, CRUD patterns |
| `security` | Security best practices and authentication |
| `integrations` | External API patterns (OpenAI, Stripe, etc.) |
