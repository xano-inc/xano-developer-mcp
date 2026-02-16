---
applyTo: "**/*.xs"
---

# Quickstart & Common Patterns

Essential patterns for XanoScript development. Use this as a quick reference for frequently-used code patterns.

## Quick Reference

### Reserved Variable Names

These variable names are reserved and cannot be used:

| Variable | Description |
|----------|-------------|
| `$response` | API/function response (auto-populated) |
| `$output` | Output value |
| `$input` | Input parameters from request/function call |
| `$auth` | Authenticated user context |
| `$env` | Environment variables and request context |
| `$db` | Database table reference for queries |
| `$this` | Current context reference |
| `$result` | Used in reduce operations |

```xs
// ❌ Wrong - using reserved variable name
var $response { value = "test" }    // Error: $response is reserved

// ✅ Correct - use a different name
var $api_response { value = "test" }
var $my_result { value = "test" }
```

### Type Names (Common Aliases)

XanoScript uses specific type names. Common aliases from other languages won't work.

> **Full reference:** For complete type details and validation, see `xanoscript_docs({ topic: "types" })`.

| ❌ Wrong | ✅ Correct | Description |
|----------|------------|-------------|
| `boolean` | `bool` | Boolean true/false |
| `integer` | `int` | 32-bit integer |
| `string` | `text` | UTF-8 string |
| `number` | `decimal` | Floating-point number |
| `float` | `decimal` | Floating-point number |
| `array` | `type[]` | Array (e.g., `text[]`, `int[]`) |
| `list` | `type[]` | Array (e.g., `text[]`, `int[]`) |

```xs
// ❌ Wrong - invalid type names
input {
  boolean is_active    // Error: use "bool"
  integer count        // Error: use "int"
  string name          // Error: use "text"
}

// ✅ Correct - proper XanoScript types
input {
  bool is_active
  int count
  text name
}
```

### Variable Declaration
```xs
var $name { value = "initial value" }
var $count { value = 0 }
var $data { value = { key: "value" } }
```

### Conditional Logic
```xs
conditional {
  if (`$status == "active"`) {
    var $result { value = "Active user" }
  }
  elseif (`$status == "pending"`) {
    var $result { value = "Pending approval" }
  }
  else {
    var $result { value = "Unknown status" }
  }
}
```

### API Request with Error Handling
```xs
api.request {
  url = "https://api.example.com/data"
  method = "POST"
  params = $payload   // Note: "params" is used for request body, NOT "body"
  headers = ["Content-Type: application/json", "Authorization: Bearer " ~ $env.API_KEY]
} as $api_result

precondition ($api_result.response.status == 200) {
  error_type = "standard"
  error = "API request failed"
}

var $data { value = $api_result.response.result }
```

### api.request Response Structure
The response object contains:
```xs
$result.response.status    // HTTP status code (200, 404, 500, etc.)
$result.response.result    // Parsed response body (JSON decoded)
$result.response.headers   // Response headers object
```

### While Loop
```xs
stack {
  var $counter { value = 0 }
  while ($counter < 10) {
    each {
      var.update $counter { value = $counter + 1 }
      debug.log { value = "Iteration: " ~ ($counter|to_text) }
    }
  }
}
```

### String Concatenation
```xs
var $greeting { value = "Hello, " ~ $input.name ~ "!" }

// With filters (use parentheses)
var $message { value = "Status: " ~ ($status|to_text) ~ " - " ~ ($data|json_encode) }
```

### Input Block Syntax

> **Full reference:** For complete input types and validation options, see `xanoscript_docs({ topic: "types" })`.

```xs
input {
  // Required input
  text name

  // Optional input (can be omitted)
  text nickname?

  // Optional with default value
  text role?="user"

  // With filters applied
  email contact filters=trim|lower

  // Optional with default AND filters
  text search?="" filters=trim

  // Array type
  text[] tags filters=trim

  // Nested object with schema
  object address {
    schema {
      text street
      text city
      text country?="US"
    }
  }
}
```

### Error Types Reference

> **Full reference:** For try-catch, throw, and preconditions, see `xanoscript_docs({ topic: "syntax" })`.

| Type | HTTP Status | Use Case |
|------|-------------|----------|
| `inputerror` | 400 Bad Request | Invalid input data |
| `accessdenied` | 403 Forbidden | Authorization failure |
| `notfound` | 404 Not Found | Resource doesn't exist |
| `standard` | 500 Internal Server Error | General errors |

### Quick Filter Reference

> **Full reference:** For the complete list of filters with examples, see `xanoscript_docs({ topic: "syntax" })`.

**String Filters:**
```xs
$s|trim                    // Remove whitespace
$s|to_lower                // Lowercase
$s|to_upper                // Uppercase
$s|substr:1:3              // Substring from index 1, length 3
$s|split:","               // Split by delimiter → array
$s|replace:"old":"new"     // Replace text
$s|contains:"text"         // Check if contains → bool
$s|strlen                  // String length
```

**Array Filters:**
```xs
$arr|first                 // First element
$arr|last                  // Last element
$arr|count                 // Array length
$arr|push:$item            // Add to end
$arr|pop                   // Remove & return last
$arr|join:","              // Join to string
$arr|map:$$.name           // Transform elements
$arr|filter:$$.active      // Filter elements
$arr|find:$$.id == 5       // Find first match
```

**Object Filters:**
```xs
$obj|get:"key"             // Get property value
$obj|get:"key":"default"   // With default if missing
$obj|set:"key":"value"     // Set property
$obj|has:"key"             // Check if key exists → bool
$obj|keys                  // Get all keys → array
$obj|values                // Get all values → array
```

**Type Conversion:**
```xs
$val|to_text               // Convert to string
$val|to_int                // Convert to integer
$val|to_decimal            // Convert to decimal
$val|to_bool               // Convert to boolean
$val|json_encode           // Object → JSON string
$str|json_decode           // JSON string → object
```

**Null Handling:**
```xs
$val|first_notnull:"default"   // Default if null
$val|first_notempty:"default"  // Default if empty
$val ?? "default"               // Nullish coalescing (same as first_notnull)
```

**Encoding:**
```xs
$s|url_encode              // URL encode
$s|url_decode              // URL decode
$s|base64_encode           // Base64 encode
$s|base64_decode           // Base64 decode
```

---

## Common Patterns

### 1. Input Validation

```xs
// Required field check
precondition ($input.email != null && $input.email != "") {
  error_type = "inputerror"
  error = "Email is required"
}

// Format validation
precondition ($input.email|contains:"@") {
  error_type = "inputerror"
  error = "Invalid email format"
}
```

### 2. Database CRUD

> **Full reference:** For all db.* operations including transactions, see `xanoscript_docs({ topic: "database" })`.

```xs
// Create
db.add "user" {
  data = { name: $input.name, email: $input.email }
} as $new_user

// Read one
db.get "user" {
  where = $db.user.id == $input.id
} as $user

// Read many
db.query "user" {
  where = $db.user.is_active == true
  order = [{ field: created_at, direction: desc }]
  paging = { limit: 10, offset: 0 }
} as $users

// Update
db.edit "user" {
  where = $db.user.id == $input.id
  data = { name: $input.name }
}

// Delete
db.delete "user" {
  where = $db.user.id == $input.id
}
```

### 3. Optional Field Handling

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

### 4. Loop Through Array

```xs
// Using each
each ($items as $item) {
  debug.log { value = $item.name }
}

// Using map filter
var $names { value = $items|map:$$.name }

// Using filter
var $active_items { value = $items|filter:$$.is_active == true }
```

### 5. Error Handling with Try-Catch

> **Full reference:** For all error handling patterns, see `xanoscript_docs({ topic: "syntax" })`.

```xs
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
```

### 6. Authentication Check

> **Full reference:** For security best practices, see `xanoscript_docs({ topic: "security" })`.

```xs
// Require authenticated user
precondition ($auth.id != null) {
  error_type = "accessdenied"
  error = "Authentication required"
}

// Check user owns resource
db.get "post" {
  where = $db.post.id == $input.post_id
} as $post

precondition ($post.user_id == $auth.id) {
  error_type = "accessdenied"
  error = "You can only edit your own posts"
}
```

### 7. Pagination

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

### 8. Building Complex Objects

```xs
// Step by step
var $response { value = {} }
var.update $response { value = $response|set:"user":$user }
var.update $response { value = $response|set:"posts":$posts }
var.update $response { value = $response|set:"stats":{ count: $posts|count } }

// Or all at once
var $response {
  value = {
    user: $user,
    posts: $posts,
    stats: { count: $posts|count }
  }
}
```

### 9. Date/Time Operations

> **Full reference:** For all date/time filters, see `xanoscript_docs({ topic: "syntax" })`.

```xs
// Current timestamp
var $now { value = now }

// Format for display
var $formatted { value = now|format_timestamp:"Y-m-d H:i:s":"UTC" }

// Relative time
var $yesterday { value = now|transform_timestamp:"-1 day" }
var $next_week { value = now|transform_timestamp:"+7 days" }

// Compare dates
db.query "event" {
  where = $db.event.start_date >= now
} as $upcoming_events
```

### 10. JSON API Response

> **Full reference:** For external API patterns, see `xanoscript_docs({ topic: "integrations" })`.

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
      name = "APIError",
      value = "OpenAI API error: " ~ ($api_result.response.status|to_text)
    }
  }
}
```

---

## Common Mistakes

### 1. Using `else if` instead of `elseif`
```xs
// ❌ Wrong
conditional {
  if (...) { }
  else if (...) { }  // Parse error!
}

// ✅ Correct
conditional {
  if (...) { }
  elseif (...) { }
}
```

### 2. Missing parentheses in filter concatenation
```xs
// ❌ Wrong - parse error
var $msg { value = $status|to_text ~ " - " ~ $data|json_encode }

// ✅ Correct - wrap filtered expressions in parentheses
var $msg { value = ($status|to_text) ~ " - " ~ ($data|json_encode) }
```

### 3. Missing parentheses in filter comparisons
```xs
// ❌ Wrong - parse error
if ($array|count > 0) { }

// ✅ Correct - wrap filter expression in parentheses
if (($array|count) > 0) { }
```

### 4. Using `body` instead of `params` for api.request
```xs
// ❌ Wrong - "body" is not valid
api.request {
  url = "..."
  method = "POST"
  body = $payload
}

// ✅ Correct - use "params" for request body
api.request {
  url = "..."
  method = "POST"
  params = $payload
}
```

### 5. Using `default` filter (doesn't exist)
```xs
// ❌ Wrong - no "default" filter exists
var $value { value = $input.optional|default:"fallback" }

// ✅ Correct - use first_notnull or ?? operator
var $value { value = $input.optional|first_notnull:"fallback" }
// or
var $value { value = $input.optional ?? "fallback" }

// For object key access with default, use get with 3rd parameter
var $val { value = $obj|get:"key":"default_value" }
```

### 6. Using reserved variable names
```xs
// ❌ Wrong - $response is reserved
var $response { value = "test" }

// ✅ Correct - use a different name
var $api_response { value = "test" }
```

### 7. Wrong type names
```xs
// ❌ Wrong - invalid type names
input {
  boolean active      // Use "bool"
  integer count       // Use "int"
  string name         // Use "text"
}

// ✅ Correct
input {
  bool active
  int count
  text name
}
```

### 8. Object literal syntax (using = instead of :)
```xs
// ❌ Wrong - object literals use : not =
var $data { value = { customer = $id } }

// ✅ Correct - use : for object properties
var $data { value = { customer: $id } }
```

### 9. Throw block with commas
```xs
// ❌ Wrong - throw blocks don't use commas
throw {
  name = "Error",
  value = "message"
}

// ✅ Correct - no commas between properties
throw {
  name = "Error"
  value = "message"
}
```

### 10. Using $env in run.job input blocks
```xs
// ❌ Wrong - $env not allowed in input blocks
run.job "my_job" {
  input {
    text api_key = $env.API_KEY
  }
}

// ✅ Correct - access $env in the stack instead
run.job "my_job" {
  stack {
    var $api_key { value = $env.API_KEY }
  }
}
```

### 11. Using `object` type without schema
```xs
// ❌ Wrong - object requires a schema
input {
  object data        // Error: needs schema
}

// ✅ Correct - use json for arbitrary data
input {
  json data          // Accepts any JSON
}

// ✅ Or define a schema for object
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
// ❌ Wrong - while must be inside stack
while (true) {
  each { ... }
}

// ✅ Correct - wrap in stack block
stack {
  while (true) {
    each { ... }
  }
}
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
