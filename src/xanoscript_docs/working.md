---
applyTo: "**/*.xs"
---

# XanoScript Working Reference

> Complete reference for common XanoScript development. Call `xanoscript_docs({ topic: "<topic>" })` for specialized topics.

## Quick Reference

### Mental Model

- Declarative block syntax, not imperative statements
- One construct per `.xs` file (function, query, table, task, agent, tool, etc.)
- Pipe `|` applies filters, `~` concatenates strings, `$input.x` accesses parameters

### Type Names (CRITICAL)

| Use This | NOT This |
|----------|----------|
| `text` | ~~string~~ |
| `int` | ~~integer~~ |
| `bool` | ~~boolean~~ |
| `decimal` | ~~float/number~~ |
| `type[]` | ~~array/list~~ |
| `json` | ~~object/any~~ |

### Reserved Names

Cannot be used as variable names: `$response`, `$output`, `$input`, `$auth`, `$env`, `$db`, `$this`, `$result`, `$index`

### Variable Access

```
$input.field      — input parameters (ALWAYS use $input. prefix, never bare $field)
$var.field        — stack variables (shorthand $field also works)
$auth.id          — authenticated user
$env.MY_VAR       — environment variable
$db.table.field   — database field reference (in where clauses)
$this             — current item in loops/maps
```

### Operators

| Category | Operators |
|----------|-----------|
| Comparison | `==`, `!=`, `>`, `<`, `>=`, `<=` |
| Logical | `&&`, `\|\|`, `!` |
| Math | `+`, `-`, `*`, `/`, `%` |
| String concat | `~` |
| Null-safe | `==?`, `!=?`, `>=?`, `<=?` (ignore if null) |
| Nullish coalescing | `??` |
| Ternary | `$cond ? "yes" : "no"` |

---

## Common Mistakes

### 1. Using `else if` instead of `elseif`
```xs
// WRONG: conditional { if (...) { } else if (...) { } }
// RIGHT:
conditional {
  if (...) { }
  elseif (...) { }
}
```

### 2. Missing parentheses in filter concatenation
```xs
// WRONG: var $msg { value = $status|to_text ~ " - " ~ $data|json_encode }
// RIGHT:
var $msg { value = ($status|to_text) ~ " - " ~ ($data|json_encode) }
```

### 3. Missing parentheses in filter comparisons
```xs
// WRONG: if ($array|count > 0) { }
// RIGHT:
if (($array|count) > 0) { }
```

### 4. Using `body` instead of `params` for api.request
```xs
// WRONG: api.request { url = "..." method = "POST" body = $payload }
// RIGHT:
api.request { url = "..." method = "POST" params = $payload } as $result
```

### 5. Using `default` filter (doesn't exist)
```xs
// WRONG: var $value { value = $input.optional|default:"fallback" }
// RIGHT:
var $value { value = $input.optional ?? "fallback" }
// or: var $value { value = $input.optional|first_notnull:"fallback" }
```

### 6. Using reserved variable names
```xs
// WRONG: var $response { value = "test" }
// RIGHT:
var $api_response { value = "test" }
```

### 7. Wrong type names
```xs
// WRONG: input { boolean active  integer count  string name }
// RIGHT:
input { bool active  int count  text name }
```

### 8. Object literal syntax (using = instead of :)
```xs
// WRONG: var $data { value = { customer = $id } }
// RIGHT:
var $data { value = { customer: $id } }
```

### 9. Block properties vs object literals
```xs
// Block properties: = with NO commas, separate lines
throw {
  name = "Error"
  value = "message"
}

// Object literals: : with commas
var $obj { value = { name: "Alice", age: 30 } }
```

### 10. Using $env in run.job input blocks
```xs
// WRONG: run.job "my_job" { input { text api_key = $env.API_KEY } }
// RIGHT — access $env in the stack:
run.job "my_job" { stack { var $api_key { value = $env.API_KEY } } }
```

### 11. Using `object` type without schema
```xs
// WRONG: input { object data }
// RIGHT — use json for arbitrary data:
input { json data }
// Or define a schema:
input { object data { schema { text name  int id } } }
```

### 12. While loop outside of stack block
```xs
// WRONG: while (true) { each { ... } }
// RIGHT:
stack { while (true) { each { ... } } }
```

### 13. Multiple constructs in one file
```
// WRONG — two constructs in one file:
// function "helper_a" { ... }
// function "helper_b" { ... }
// RIGHT — one construct per file (function/helper_a.xs, function/helper_b.xs)
```

---

## Filters Reference

### String Filters
trim: remove whitespace — `$s|trim`
ltrim, rtrim: left/right trim — `$s|ltrim`
to_lower, to_upper: case — `$s|to_lower`
capitalize: capitalize first — `$s|capitalize`
strlen: string length — `$s|strlen` (NOT count)
substr:start:len: substring — `$s|substr:0:5` (NOT slice)
split:delim: split to array — `$s|split:","`
replace:old:new: replace — `$s|replace:"foo":"bar"`
contains:str: check substring — `$s|contains:"@"`
starts_with, ends_with: prefix/suffix — `$s|starts_with:"http"`
pad_start:len:char, pad_end: pad — `$s|pad_start:5:"0"`

### Array Filters
first, last: endpoints — `$arr|first`
count: array length — `$arr|count` (NOT strlen)
slice:start:end: sub-array — `$arr|slice:0:3` (NOT substr)
reverse: reverse — `$arr|reverse`
sort:field:dir: sort — `$arr|sort:"name":"asc"`
unique: deduplicate — `$arr|unique`
flatten: flatten nested — `$arr|flatten`
map:expr: transform — `$arr|map:$$.name`
filter:expr: keep matching — `$arr|filter:$$.active`
find:expr: first match — `$arr|find:$$.id == 5`
some:expr: any match? — `$arr|some:$$.active`
every:expr: all match? — `$arr|every:$$.valid`
reduce:init:expr: accumulate — `$arr|reduce:0:$$ + $$2`
join:delim: array to string — `$arr|join:","`
push:val: append — `$arr|push:"new"`

### Object Filters
get:key: get property — `$obj|get:"key"` or `$obj|get:"key":"default"`
set:key:val: set property — `$obj|set:"key":"value"`
has:key: check key — `$obj|has:"key"`
keys: get keys — `$obj|keys`
values: get values — `$obj|values`
set_ifnotnull:key:val: set if not null — `$obj|set_ifnotnull:"k":$val`

### Type Conversion
to_text: to string — `$n|to_text`
to_int: to integer — `$s|to_int`
to_decimal: to float — `$s|to_decimal`
to_bool: to boolean — `$s|to_bool`
json_encode: to JSON string — `$obj|json_encode`
json_decode: from JSON string — `$s|json_decode`

### Null/Empty Handling
is_null: check null — `$v|is_null`
is_empty: check empty — `$v|is_empty`
first_notnull:default: fallback — `$v|first_notnull:"default"`
first_notempty:default: fallback — `$v|first_notempty:"fallback"`
Nullish coalescing: `$v ?? "default"`

### Date/Time
now — current timestamp
now|format_timestamp:"Y-m-d":"UTC" — format
now|transform_timestamp:"-1 day" — offset
now|to_ms — milliseconds

### Math
round:precision — `$n|round:2`
ceil, floor — `$n|ceil`
abs — `$n|abs`
min:val, max:val — `$n|min:0`
sum — `$arr|sum` (sum array of numbers)
avg — `$arr|avg`

---

## Variables & Input Blocks

```xs
// Declare
var $name { value = "initial" }
var $items { value = [] }
var $data { value = { key: "value" } }

// Update
var.update $name { value = "new value" }

// Input block modifiers
input {
  text name                    // required, not nullable
  text? bio                    // required, nullable (can send null)
  text role?="user"            // optional with default
  text? note?                  // optional and nullable
  email contact filters=trim   // with validation filter
  text[] tags                  // array type
  object address {             // nested object
    schema {
      text street
      text city
    }
  }
}
```

Common validation filters: `trim`, `to_lower`, `to_upper`, `sanitize_html`, `strip_tags`

---

## Conditional Logic

```xs
// if / elseif / else (MUST use elseif, NOT else if)
conditional {
  if ($input.age >= 18) { var $status { value = "adult" } }
  elseif ($input.age >= 13) { var $status { value = "teen" } }
  else { var $status { value = "child" } }
}

// switch
switch ($input.status) {
  case ("active") { var $msg { value = "Active" } } break
  case ("pending") { var $msg { value = "Pending" } } break
  default { var $msg { value = "Unknown" } }
}
// Note: break goes AFTER the closing } of each case

// precondition (guard clause — stops execution if false)
precondition ($input.id > 0) {
  error_type = "inputerror"
  error = "ID must be positive"
}

// early return
conditional {
  if ($input.skip) {
    return { value = null }
  }
}
```

### Error Types

| Type | HTTP Status | Use Case |
|------|-------------|----------|
| `inputerror` | 400 | Invalid input data |
| `accessdenied` | 403 | Authorization failure |
| `notfound` | 404 | Resource doesn't exist |
| `standard` | 500 | General errors |

---

## Loops

```xs
// foreach — iterate array
foreach ($input.items) {
  each as $item {
    debug.log { value = $item.name }
  }
}

// for — iterate N times
for (10) {
  each as $idx {
    debug.log { value = $idx }
  }
}

// while — MUST be inside stack block
stack {
  var $counter { value = 0 }
  while ($counter < 10) {
    each {
      var.update $counter { value = $counter + 1 }
    }
  }
}

// map/filter (inline, returns new array)
var $names { value = $items|map:$$.name }
var $active { value = $items|filter:$$.is_active }
var $found { value = $items|find:$$.id == $input.target_id }

// break/continue
foreach ($items) {
  each as $item {
    conditional {
      if ($item.skip) { continue }
      if ($item.done) { break }
    }
  }
}
```

---

## Functions

```xs
// Define
function "calculate_total" {
  input {
    decimal[] prices
    decimal tax_rate?=0.1
  }
  stack {
    var $subtotal { value = $input.prices|sum }
    var $tax { value = $subtotal * $input.tax_rate }
  }
  response = { subtotal: $subtotal, tax: $tax, total: $subtotal + $tax }
}

// Call
function.run "calculate_total" {
  input = { prices: [10, 20, 30], tax_rate: 0.08 }
} as $result

// Async (fire and forget)
function.run "send_notification" {
  async = true
  input = { user_id: $auth.id, message: "Done" }
}
```

> For async patterns, recursion, and advanced function features: `xanoscript_docs({ topic: "functions" })`

---

## Database Operations

### Choosing an Operation
```
Read:   db.get (single by ID) | db.has (exists?) | db.query (filtered list)
Write:  db.add (insert) | db.edit (update known fields) | db.patch (dynamic fields) | db.add_or_edit (upsert)
Delete: db.del (single) | db.truncate (all)
```

### db.get — Single record
```xs
db.get "user" { field_name = "id" field_value = $input.user_id } as $user
db.get "user" { field_name = "email" field_value = $input.email } as $user
```

### db.has — Check existence
```xs
db.has "user" { field_name = "email" field_value = $input.email } as $exists
```

### db.query — Filtered list
```xs
db.query "product" {
  where = $db.product.is_active == true && $db.product.price > 0
  sort = { created_at: "desc" }
  return = { type: "list", paging: { page: $input.page, per_page: 25, totals: true } }
} as $products

// Return types: "list" (default), "single", "count", "exists"
// Null-safe where: $db.product.category ==? $input.category (ignores if null)
// String matching: $db.product.name includes "phone"
// Array contains: $db.product.tags contains "featured"
```

### db.query with join
```xs
db.query "comment" {
  join = {
    post: { table: "post", type: "inner", where: $db.comment.post_id == $db.post.id }
  }
  eval = { post_title: $db.post.title }
  where = $db.post.author_id == $auth.id
} as $comments
```

### db.add — Insert
```xs
db.add "product" {
  data = { name: $input.name, price: $input.price, created_at: now }
} as $product
```

### db.edit — Update (inline data)
```xs
db.edit "product" {
  field_name = "id"
  field_value = $input.product_id
  data = { name: $input.name, price: $input.price, updated_at: now }
} as $product
```

### db.patch — Update (dynamic fields)
```xs
var $updates { value = { updated_at: now } }
conditional {
  if ($input.name != null) {
    var.update $updates { value = $updates|set:"name":$input.name }
  }
}
db.patch "product" { field_name = "id" field_value = $input.id data = $updates } as $product
```

### db.del — Delete
```xs
db.del "product" { field_name = "id" field_value = $input.product_id }
```

### db.transaction — Atomic operations
```xs
db.transaction {
  stack {
    db.add "order" { data = { user_id: $auth.id, total: $total } } as $order
    foreach ($input.items) {
      each as $item {
        db.add "order_item" { data = { order_id: $order.id, product_id: $item.product_id, quantity: $item.quantity } }
      }
    }
  }
}
```

> For bulk operations, direct SQL, vector search, and advanced queries: `xanoscript_docs({ topic: "database" })`

---

## API Endpoints

```xs
// GET endpoint
query "users" verb=GET {
  api_group = "users"
  auth = "none"              // "none", "user", "session", "api_key"
  input { int page?=1  int per_page?=25 }
  stack {
    db.query "user" {
      where = $db.user.is_active == true
      sort = { created_at: "desc" }
      return = { type: "list", paging: { page: $input.page, per_page: $input.per_page } }
    } as $users
  }
  response = $users
}

// GET single
query "users/{user_id}" verb=GET {
  api_group = "users"
  auth = "user"
  input { int user_id }
  stack {
    db.get "user" { field_name = "id" field_value = $input.user_id } as $user
    precondition ($user != null) { error_type = "notfound" error = "User not found" }
  }
  response = $user
}

// POST create
query "users" verb=POST {
  api_group = "users"
  auth = "user"
  input { text name  email email }
  stack {
    db.has "user" { field_name = "email" field_value = $input.email } as $exists
    precondition (!$exists) { error_type = "inputerror" error = "Email already taken" }
    db.add "user" { data = { name: $input.name, email: $input.email, created_at: now } } as $user
  }
  response = $user
}

// PATCH update
query "users/{user_id}" verb=PATCH {
  api_group = "users"
  auth = "user"
  input { int user_id  text? name?  email? email? }
  stack {
    db.get "user" { field_name = "id" field_value = $input.user_id } as $user
    precondition ($user != null) { error_type = "notfound" error = "Not found" }
    precondition ($user.id == $auth.id) { error_type = "accessdenied" error = "Not your record" }
    var $updates { value = { updated_at: now } }
    conditional {
      if ($input.name != null) { var.update $updates { value = $updates|set:"name":$input.name } }
    }
    db.patch "user" { field_name = "id" field_value = $input.user_id data = $updates } as $updated
  }
  response = $updated
}

// DELETE
query "users/{user_id}" verb=DELETE {
  api_group = "users"
  auth = "user"
  input { int user_id }
  stack {
    db.get "user" { field_name = "id" field_value = $input.user_id } as $user
    precondition ($user != null) { error_type = "notfound" error = "Not found" }
    precondition ($user.id == $auth.id) { error_type = "accessdenied" error = "Not yours" }
    db.del "user" { field_name = "id" field_value = $input.user_id }
  }
  response = { success: true }
}
```

> For API groups, rate limiting, file uploads, and custom headers: `xanoscript_docs({ topic: "apis" })`

---

## Error Handling

```xs
// Precondition (guard — stops execution if false)
precondition ($input.email|contains:"@") {
  error_type = "inputerror"
  error = "Invalid email"
}

// Try/catch
try_catch {
  try {
    api.request { url = "https://api.example.com/data" method = "GET" } as $result
  }
  catch {
    var $result { value = { response: { result: null } } }
  }
}

// Throw custom error
throw {
  name = "ValidationError"
  value = "Custom error message"
}
```

---

## External API Calls

```xs
api.request {
  url = "https://api.example.com/endpoint"
  method = "POST"
  params = $payload                // NOTE: "params" for body, NOT "body"
  headers = [
    "Content-Type: application/json",
    "Authorization: Bearer " ~ $env.API_KEY
  ]
  timeout = 30
} as $api_result

// Response structure:
// $api_result.response.status  → HTTP status code
// $api_result.response.result  → Parsed response body
// $api_result.response.headers → Response headers
```

---

## Common Patterns

### Authentication Check
```xs
precondition ($auth.id != null) {
  error_type = "accessdenied"
  error = "Authentication required"
}
```

### Optional Field Handling
```xs
var $data {
  value = { required: $input.required }|set_ifnotnull:"optional":$input.optional
}
```

### Building Complex Objects
```xs
var $result { value = { user: $user, posts: $posts, count: ($posts|count) } }
```

### String Concatenation with Filters
```xs
var $msg { value = ($status|to_text) ~ ": " ~ ($data|json_encode) }
```

---

## Topic Index

| Topic | Description | Size |
|-------|-------------|------|
| `essentials` | Common patterns and mistakes | ~15KB |
| `syntax` | Operators, all filters, system variables | ~17KB |
| `syntax/string-filters` | String filters, regex, encoding | ~6KB |
| `syntax/array-filters` | Array filters, functional operations | ~7KB |
| `types` | Type system, input validation | ~11KB |
| `database` | All db.* operations, joins, transactions | ~13KB |
| `functions` | Function stacks, async, recursion | ~9KB |
| `apis` | HTTP endpoints, authentication | ~12KB |
| `tables` | Database schema definitions | ~7KB |
| `tasks` | Scheduled/cron jobs | ~6KB |
| `triggers` | Event handlers (table, realtime, agent, MCP) | ~17KB |
| `agents` | AI agent configuration | ~9KB |
| `tools` | AI tools for agents | ~7KB |
| `mcp-servers` | MCP server definitions | ~4KB |
| `security` | Auth patterns, encryption | ~12KB |
| `integrations` | External APIs, cloud storage, Redis | ~varies |
| `unit-testing` | Unit tests, mocks, assertions | ~10KB |
| `workflow-tests` | E2E workflow tests | ~11KB |
| `debugging` | debug.log, debug.stop | ~6KB |
| `performance` | Caching, query optimization | ~8KB |
| `middleware` | Request/response interceptors | ~6KB |
| `realtime` | WebSocket channels and events | ~9KB |
| `streaming` | Large file/data streaming | ~8KB |
