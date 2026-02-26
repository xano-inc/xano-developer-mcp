---
applyTo: "**/*.xs"
---

# Syntax Reference

Complete reference for XanoScript expressions, operators, and core filters. For extended filter references, see the syntax sub-topics.

> **TL;DR:** XanoScript uses `|` for filters (`$text|trim`), `~` for string concat, and standard operators (`==`, `!=`, `&&`, `||`). Filters are chainable. Error handling uses `precondition`, `try_catch`, and `throw`.

## Section Index

| Section | Contents |
|---------|----------|
| [Operators](#quick-reference) | Comparison, logical, math, null-safe |
| [Conditional Blocks](#conditional-blocks) | `conditional`, `if`/`elseif`/`else` |
| [Expressions](#expressions) | Backtick syntax, comparisons |
| [Object Filters](#object-filters) | `get`, `set`, `has`, `keys`, `values` |
| [Type Filters](#type-filters) | `to_int`, `to_text`, `to_bool`, `json_encode` |
| [Date/Time Filters](#datetime-filters) | `to_timestamp`, `format_timestamp` |
| [DB Query Filters](#db-query-filters) | `contains`, `includes`, `between`, `within` |
| [Error Handling](#error-handling) | `precondition`, `try_catch`, `throw` |
| [System Variables](#system-variables) | `$env.*`, `$auth.*`, request context |

### Extended Filter Sub-Topics

For detailed references on specific filter categories, use:
- `xanoscript_docs({ topic: "syntax/string-filters" })` — String filters, regex, encoding, security filters, text functions
- `xanoscript_docs({ topic: "syntax/array-filters" })` — Array filters, functional operations, array functions
- `xanoscript_docs({ topic: "syntax/functions" })` — Math filters/functions, object functions, bitwise operations

## CRITICAL: Filters Are Type-Specific

> **Filters only work on the correct input type.** String filters and array filters are NOT interchangeable. Using the wrong filter type will produce errors or incorrect results.

| Task | WRONG (type mismatch) | CORRECT |
|------|----------------------|---------|
| Get string length | `$text\|count` | `$text\|strlen` |
| Get array length | `$arr\|strlen` | `$arr\|count` |
| Reverse a string | `$text\|reverse` | `$text\|split:""\|reverse\|join:""` |
| Reverse an array | Use `reverse` directly | `$arr\|reverse` |
| Check string has substring | `$text\|some:...` | `$text\|contains:"sub"` |
| Check array has element | `$arr\|contains:$val` (db only) | `$arr\|some:$$==$val` |
| Get part of string | `$text\|slice:0:3` | `$text\|substr:0:3` |
| Get part of array | `$arr\|substr:0:3` | `$arr\|slice:0:3` |

## Choosing a Filter

```
Working with...
├── Strings? → USE STRING FILTERS ONLY
│   ├── Clean whitespace? → trim, ltrim, rtrim
│   ├── Change case? → to_lower, to_upper, capitalize
│   ├── Extract part? → substr (NOT slice)
│   ├── Split to array? → split
│   ├── Find/replace? → replace, contains
│   └── Get length? → strlen (NOT count)
├── Arrays? → USE ARRAY FILTERS ONLY
│   ├── Get element? → first, last, get
│   ├── Count items? → count (NOT strlen)
│   ├── Transform all? → map (filter) or array.map (statement)
│   ├── Keep some? → filter (filter) or array.filter (statement)
│   ├── Find one? → find (filter) or array.find (statement)
│   ├── Combine? → reduce
│   ├── Reverse? → reverse (NOT available on strings)
│   ├── Sort? → sort
│   └── Statement-level ops? → See syntax/array-filters topic
├── Objects?
│   ├── Get value? → get
│   ├── Set value? → set
│   ├── Check key? → has
│   └── Extract? → keys, values
├── Convert type?
│   ├── To number? → to_int, to_decimal
│   ├── To string? → to_text
│   ├── To boolean? → to_bool
│   └── To/from JSON? → json_encode, json_decode
└── Check value?
    ├── Is null? → is_null
    ├── Is empty? → is_empty
    └── Get type? → is_array, is_object, is_int, is_text
```

## Quick Reference

### Variable Access Prefixes

> **Full reference:** See `xanoscript_docs({ topic: "essentials" })` for detailed variable access rules, reserved variables, and type names.

| Prefix | Applies to | Shorthand? |
|--------|-----------|------------|
| `$input.field` | Input parameters | No — prefix always required |
| `$var.field` | Stack variables | Yes — `$field` is identical |
| `$auth.field` | Auth context | No |
| `$env.NAME` | Environment variables | No |
| `$db.table.field` | DB field refs (queries) | No |

### Operators

| Category | Operators |
|----------|-----------|
| Comparison | `==`, `!=`, `>`, `<`, `>=`, `<=` |
| Logical | `&&`, `\|\|`, `!` |
| Math | `+`, `-`, `*`, `/`, `%` |
| String | `~` (concat) |
| Null-safe | `==?`, `!=?`, `>=?`, `<=?` (ignore if null) |

### Common Filters

| Filter | Type | Purpose | Example |
|--------|------|---------|---------|
| `trim` | STRING | Remove whitespace | `$s\|trim` |
| `to_lower` / `to_upper` | STRING | Case conversion | `$s\|to_lower` |
| `strlen` | STRING | String length | `$s\|strlen` |
| `substr` | STRING | Extract substring | `$s\|substr:0:5` |
| `first` / `last` | ARRAY | Array endpoints | `$arr\|first` |
| `count` | ARRAY | Array length | `$arr\|count` |
| `slice` | ARRAY | Extract sub-array | `$arr\|slice:0:3` |
| `reverse` | ARRAY | Reverse array | `$arr\|reverse` |
| `get` | OBJECT | Object property | `$obj\|get:"key"` |
| `set` | OBJECT | Set property | `$obj\|set:"key":"val"` |
| `json_encode` / `json_decode` | ANY | JSON conversion | `$obj\|json_encode` |
| `to_text` / `to_int` | ANY | Type conversion | `$num\|to_text` |

> **Note:** There is no `default` filter. Use conditional blocks or `first_notnull`/`first_notempty` instead.

### Parentheses and Filter Precedence

> **Rule:** Filters bind greedily to the left. Without parentheses, the parser extends the filter expression into the operator that follows — producing invalid or unexpected results. **When in doubt, wrap `$var|filter` in parentheses.**

The filter `|` grabs everything to its right until it hits a boundary. This means `$arr|count > 3` is parsed as `$arr | (length > 3)` — treating `count > 3` as the filter argument, which is invalid.

```xs
// ❌ Wrong — parser reads filter argument as "count == 0" (invalid)
if ($arr|count == 0) { ... }

// ❌ Wrong — parse error in concatenation
var $message {
  value = $status|to_text ~ ": " ~ $data|json_encode
}
```

```xs
// ✅ Correct — evaluate filter first, then apply operator
if (($arr|count) == 0) { ... }

// ✅ Correct — wrap each filtered expression for concatenation
var $message {
  value = ($status|to_text) ~ ": " ~ ($data|json_encode)
}

// ✅ Correct — filter result used in arithmetic
var $total { value = ($prices|sum) + $tax }

// ✅ Correct — filter result compared
var $is_long { value = ($text|strlen) > 100 }
```

**Summary:** Any time you apply an operator (`>`, `<`, `==`, `!=`, `~`, `+`, `-`, etc.) to a filtered value, wrap the `$var|filter` portion in its own parentheses.

---

## Conditional Blocks

Use `conditional` blocks for if/elseif/else logic:

```xs
conditional {
  if ($status == "success") {
    var $message { value = "All good!" }
  }
  elseif ($status == "pending") {
    var $message { value = "Please wait..." }
  }
  else {
    var $message { value = "Unknown status" }
  }
}
```

> **Important:** Use `elseif` (one word), not `else if` or `else { if (...) }`. Nested `if` inside `else` blocks is not supported.

### Conditional with Variable Updates

```xs
var $tier_limit { value = 100 }

conditional {
  if ($auth.tier == "premium") {
    var.update $tier_limit { value = 1000 }
  }
  elseif ($auth.tier == "pro") {
    var.update $tier_limit { value = 500 }
  }
}
```

---

## Expressions

Backticks enter **expression mode** — use them only when you need inline evaluation of a complex expression, not for regular conditionals or variable assignments.

```xs
// ✅ Regular conditionals — no backticks needed
conditional {
  if ($input.age >= 18) { ... }
}

// ✅ Variable assignment — no backticks needed
var $total { value = $input.qty * $input.price }
```

### Comparison
```xs
$a == $b      // Equal
$a != $b      // Not equal
$a > $b       // Greater than
$a >= $b      // Greater or equal
$a < $b       // Less than
$a <= $b      // Less or equal
```

### Logical
```xs
$a && $b      // AND
$a || $b      // OR
!$a           // NOT
```

### Null-Safe Comparisons (DB Queries)
```xs
// In db.query where clauses - ignore condition if value is null
$db.post.category ==? $input.category
$db.post.date >=? $input.start_date
```

---

## Object Filters

| Filter | Example | Result |
|--------|---------|--------|
| `get` | `{a:1}\|get:"a"` | `1` |
| `set` | `{a:1}\|set:"b":2` | `{a:1,b:2}` |
| `unset` | `{a:1,b:2}\|unset:"b"` | `{a:1}` |
| `has` | `{a:1}\|has:"a"` | `true` |
| `keys` | `{a:1,b:2}\|keys` | `["a","b"]` |
| `values` | `{a:1,b:2}\|values` | `[1,2]` |
| `entries` | `{a:1}\|entries` | `[{key:"a",value:1}]` |
| `pick` | `{a:1,b:2,c:3}\|pick:[a,c]` | `{a:1,c:3}` |
| `unpick` | `{a:1,b:2,c:3}\|unpick:[b]` | `{a:1,c:3}` |

### Conditional Set
```xs
{a:1}|set_conditional:"b":2:true            // {a:1,b:2} if condition true
{a:1}|set_ifnotempty:"b":"val"              // Set only if val not empty
{a:1}|set_ifnotnull:"b":$var                // Set only if $var not null
```

---

## Type Filters

> **Full reference:** For input types and validation, see `xanoscript_docs({ topic: "types" })`.

| Filter | Example | Result |
|--------|---------|--------|
| `to_int` | `"123"\|to_int` | `123` |
| `to_decimal` | `"1.5"\|to_decimal` | `1.5` |
| `to_text` | `123\|to_text` | `"123"` |
| `to_bool` | `"true"\|to_bool` | `true` |
| `is_null` | `null\|is_null` | `true` |
| `is_empty` | `[]\|is_empty` | `true` |
| `is_array` | `[1]\|is_array` | `true` |
| `is_object` | `{}\|is_object` | `true` |
| `is_int` | `1\|is_int` | `true` |
| `is_text` | `"a"\|is_text` | `true` |

### Null Handling
```xs
null|first_notnull:0                        // 0
""|first_notempty:"default"                 // "default"
```

### Nullish Coalescing

Return right operand when left is null (not just falsy):

```xs
$value ?? "default"              // Returns "default" only if $value is null
$value || "default"              // Returns "default" if $value is null, 0, "", or false
```

```xs
// Difference example
var $count { value = 0 }
$count ?? 10                     // Returns 0 (not null)
$count || 10                     // Returns 10 (0 is falsy)
```

---

## Date/Time Filters

| Filter | Example | Description |
|--------|---------|-------------|
| `to_timestamp` | `"now"\|to_timestamp` | Parse to timestamp |
| `to_ms` | `"now"\|to_ms` | Milliseconds since epoch |
| `to_seconds` | `"now"\|to_seconds` | Seconds since epoch |
| `format_timestamp` | `$ts\|format_timestamp:"Y-m-d":"UTC"` | Format timestamp |
| `transform_timestamp` | `$ts\|transform_timestamp:"-7 days"` | Relative time |
| `add_secs_to_timestamp` | `$ts\|add_secs_to_timestamp:60` | Add seconds |
| `add_ms_to_timestamp` | `$ts\|add_ms_to_timestamp:1000` | Add milliseconds |

### Timestamp Parts
```xs
$ts|timestamp_year           // Year
$ts|timestamp_month          // Month (1-12)
$ts|timestamp_day_of_month   // Day (1-31)
$ts|timestamp_hour           // Hour (0-23)
$ts|timestamp_minute         // Minute (0-59)
$ts|timestamp_day_of_week    // Day (0=Sunday)
```

---

## DB Query Filters

> **Full reference:** For complete database operations, see `xanoscript_docs({ topic: "database" })`.

Used in `db.query` where clauses:

| Filter | Example | Description |
|--------|---------|-------------|
| `contains` | `$db.tags\|contains:"featured"` | Array contains value |
| `includes` | `$db.title\|includes:"tutorial"` | String includes text |
| `overlaps` | `$db.tags\|overlaps:["a","b"]` | Arrays share elements |
| `between` | `$db.price\|between:10:100` | Value in range |
| `within` | `$db.geo\|within:$point:1000` | Geo within radius (meters) |
| `distance` | `$db.geo\|distance:$point` | Geo distance (meters) |
| `search_rank` | `$db.content\|search_rank:"query"` | Full-text search ranking |
| `cosine_similarity` | `$db.vector\|cosine_similarity:$vec` | Vector similarity |
| `l2_distance_euclidean` | `$db.vector\|l2_distance_euclidean:$vec` | Vector distance |

### Database Filter Operators

Additional operators for `db.query` where clauses:

| Operator | Description | Example |
|----------|-------------|---------|
| `@>` | JSON contains | `$db.meta @> {"type": "featured"}` |
| `~` | Regex match | `$db.name ~ "^test"` |
| `!~` | Regex not match | `$db.name !~ "^draft"` |
| `not in` | Not in list | `$db.status not in ["deleted", "hidden"]` |
| `not between` | Not in range | `$db.price not between 0:10` |
| `not contains` | Array not contains | `$db.tags not contains "spam"` |
| `not includes` | String not includes | `$db.title not includes "test"` |
| `not overlaps` | Arrays don't overlap | `$db.tags not overlaps ["hidden", "draft"]` |
| `not ilike` | Case-insensitive not like | `$db.name not ilike "%test%"` |

```xs
db.query "product" {
  where = $db.product.status not in ["deleted", "archived"]
        && $db.product.metadata @> {"featured": true}
        && $db.product.sku ~ "^SKU-[0-9]+"
} as $products
```

### Timestamp Arithmetic (DB)

```xs
$db.created_at|timestamp_add_days:7
$db.created_at|timestamp_subtract_hours:24
$db.created_at|timestamp_year                // Extract year
$db.created_at|timestamp_month               // Extract month (1-12)
$db.created_at|timestamp_week                // Extract week number
$db.created_at|timestamp_day_of_month        // Day of month (1-31)
$db.created_at|timestamp_day_of_week         // Day of week (0-6)
$db.created_at|timestamp_day_of_year         // Day of year (1-366)
$db.created_at|timestamp_hour                // Hour (0-23)
$db.created_at|timestamp_minute              // Minute (0-59)
$db.created_at|timestamp_epoch_seconds       // Seconds since epoch
$db.created_at|timestamp_epoch_ms            // Milliseconds since epoch
```

### Vector Operations (AI/ML)

> **Full reference:** For AI agents and embeddings, see `xanoscript_docs({ topic: "agents" })`.

```xs
$db.embedding|l1_distance_manhattan:$input.vector    // L1/Manhattan distance
$db.embedding|negative_inner_product:$input.vector   // Negative inner product
$db.embedding|inner_product:$input.vector            // Inner product
$db.boundary|covers:$input.point                     // Polygon covers point
```

---

## Error Handling

### Preconditions

Validate conditions and throw typed errors. See `xanoscript_docs({ topic: "essentials" })` for the error types reference table.

```xs
precondition ($input.amount > 0) {
  error_type = "inputerror"
  error = "Amount must be positive"
}

precondition ($user != null) {
  error_type = "notfound"
  error = "User not found"
}

precondition ($user.id == $auth.id) {
  error_type = "accessdenied"
  error = "Not authorized"
}
```

### Throwing Errors

```xs
throw {
  name = "ValidationError"
  value = "Custom error message"
}
```

### Try-Catch

```xs
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
```

### Early Return

```xs
conditional {
  if ($input.skip) {
    return { value = null }
  }
}
```

---

## System Variables

Built-in variables available in the execution context.

### Request Context

| Variable | Description |
|----------|-------------|
| `$remote_ip` | Client IP address |
| `$remote_port` | Client port number |
| `$remote_host` | Remote hostname |
| `$request_method` | HTTP method (GET, POST, etc.) |
| `$request_uri` | Full request URI |
| `$request_querystring` | Query string portion |
| `$http_headers` | Request headers object |
| `$request_auth_token` | Authorization token (if present) |

### System Context

| Variable | Description |
|----------|-------------|
| `$datasource` | Current data source name |
| `$branch` | Current branch name |
| `$tenant` | Tenant ID (multi-tenant apps) |
| `$api_baseurl` | API base URL |
| `$webflow` | Webflow context (if applicable) |

### Access via $env

```xs
// Request variables accessed through $env
var $client_ip { value = $env.$remote_ip }
var $method { value = $env.$request_method }
var $headers { value = $env.$http_headers }
var $current_branch { value = $env.$branch }

// Custom environment variables (set in Xano dashboard)
var $api_key { value = $env.MY_API_KEY }
```

---

## Related Topics

Explore more with `xanoscript_docs({ topic: "<topic>" })`:

| Topic | Description |
|-------|-------------|
| `essentials` | Common patterns, mistakes to avoid, error types, type names |
| `syntax/string-filters` | String filters, regex, encoding, security filters, text functions |
| `syntax/array-filters` | Array filters, functional operations, array functions |
| `syntax/functions` | Math filters/functions, object functions, bitwise |
| `types` | Data types, input validation, schema definitions |
| `database` | All db.* operations with query examples |
