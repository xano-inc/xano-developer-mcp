---
applyTo: "**/*.xs"
---

# Quickstart & Common Patterns

Essential patterns for XanoScript development. Use this as a quick reference for frequently-used code patterns.

## Quick Reference

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
  params = $payload
  headers = ["Content-Type: application/json", "Authorization: Bearer " ~ $env.API_KEY]
} as $api_result

precondition ($api_result.response.status == 200) {
  error_type = "standard"
  error = "API request failed"
}

var $data { value = $api_result.response.result }
```

### String Concatenation
```xs
var $greeting { value = "Hello, " ~ $input.name ~ "!" }

// With filters (use parentheses)
var $message { value = "Status: " ~ ($status|to_text) ~ " - " ~ ($data|json_encode) }
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
// ❌ Wrong
var $msg { value = $status|to_text ~ " - " ~ $data|json_encode }

// ✅ Correct
var $msg { value = ($status|to_text) ~ " - " ~ ($data|json_encode) }
```

### 3. Using `body` instead of `params` for api.request
```xs
// ❌ Wrong
api.request {
  url = "..."
  method = "POST"
  body = $payload  // "body" is not valid!
}

// ✅ Correct
api.request {
  url = "..."
  method = "POST"
  params = $payload  // Use "params" for request body
}
```

### 4. Using `default` filter (doesn't exist)
```xs
// ❌ Wrong
var $value { value = $input.optional|default:"fallback" }

// ✅ Correct
var $value { value = $input.optional|first_notnull:"fallback" }
// or
var $value { value = $input.optional ?? "fallback" }
```

### 5. Using $env in run.job input blocks
```xs
// ❌ Wrong - $env not allowed in input blocks
run.job "my_job" {
  input {
    text api_key = $env.API_KEY
  }
}

// ✅ Correct - use $env in the stack
run.job "my_job" {
  stack {
    var $api_key { value = $env.API_KEY }
  }
}
```
