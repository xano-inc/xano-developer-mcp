# XanoScript Language Quick Reference

Reference for the XanoScript language itself — use when authoring documentation examples or verifying correctness.

## Table of Contents

- [Constructs](#constructs)
- [Data Types](#data-types)
- [Variables](#variables)
- [Operators](#operators)
- [Filter System](#filter-system)
- [Control Flow](#control-flow)
- [Error Handling](#error-handling)
- [Database Operations](#database-operations)
- [Input Blocks](#input-blocks)
- [Expressions](#expressions)
- [API Integration](#api-integration)
- [AI Agents and Tools](#ai-agents-and-tools)
- [Testing](#testing)
- [Integrations](#integrations)

## Constructs

XanoScript uses block-based definitions. Each `.xs` file contains exactly one construct:

```xs
<construct> "<name>" {
  input { ... }
  stack { ... }
  response = $result
}
```

| Construct | File Pattern | Purpose |
|-----------|-------------|---------|
| `workspace` | `workspace.xs` | Workspace config |
| `table` | `tables/*.xs` | Database schema |
| `api_group` + `query` | `apis/**/*.xs` | HTTP endpoints |
| `function` | `functions/**/*.xs` | Reusable logic |
| `task` | `tasks/*.xs` | Scheduled jobs |
| `agent` | `agents/**/*.xs` | AI agents |
| `tool` | `tools/**/*.xs` | AI tools |
| `mcp_server` | `mcp_servers/**/*.xs` | MCP servers |
| `middleware` | `middleware/**/*.xs` | Request interceptors |
| `addon` | `addons/*.xs` | Reusable subqueries |
| `table_trigger` | `triggers/**/*.xs` | Table CRUD events |
| `realtime_trigger` | `triggers/**/*.xs` | Channel events |
| `workspace_trigger` | `triggers/**/*.xs` | Branch lifecycle |
| `agent_trigger` | `triggers/**/*.xs` | Agent events |
| `mcp_server_trigger` | `triggers/**/*.xs` | MCP tool calls |
| `workflow_test` | `workflow_test/**/*.xs` | E2E tests |

## Data Types

### Correct Names (Critical)

| Correct | WRONG (never use) |
|---------|-------------------|
| `text` | `string` |
| `int` | `integer` |
| `decimal` | `float`, `number` |
| `bool` | `boolean` |

### All Types

**Primitives:** `text`, `int`, `decimal`, `bool`, `email`, `password`, `uuid`, `timestamp`, `date`, `json`

**Collections:** `type[]` (arrays, e.g., `text[]`, `int[]`), `object` (with nested schema)

**Special:** `vector`, `enum`

**File types:** `file`, `image`, `video`, `audio`, `attachment`

**Geo types:** `geo_point`, `geo_polygon`, `geo_linestring`

### Type Modifiers

```xs
text name                   // Required
text nickname?              // Nullable (can be null)
text role?="user"           // Optional with default
text[1:10] tags             // Array size constraints
```

## Variables

### Access Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `$input.field` | Input parameters | `$input.name` |
| `$var.field` | Stack variables | `$var.total` |
| `$auth.id` | Authenticated user | `$auth.id`, `$auth.role` |
| `$env.NAME` | Environment variables | `$env.API_KEY` |
| `$db.table.field` | DB field reference (queries) | `$db.user.email` |
| `$this` | Current item in loops/maps | `$this.name` |
| `$result` | Accumulator in reduce | `$result + $$` |
| `$$` | Shorthand for current item in filter expressions | `$items\|map:$$.name` |

### Reserved Names

Cannot use as variable names: `$response`, `$output`, `$input`, `$auth`, `$env`, `$db`, `$this`, `$result`

## Operators

| Category | Operators | Notes |
|----------|-----------|-------|
| Comparison | `==`, `!=`, `>`, `<`, `>=`, `<=` | Standard |
| Null-safe | `==?`, `!=?`, `>=?`, `<=?` | Ignore if null (DB queries) |
| Logical | `&&`, `\|\|`, `!` | AND, OR, NOT |
| Math | `+`, `-`, `*`, `/`, `%` | Arithmetic |
| String concat | `~` | `"Hello " ~ $name` |
| Nullish coalescing | `??` | `$val ?? "default"` |
| Regex (DB) | `~`, `!~` | Match/not match |
| JSON contains (DB) | `@>` | JSON containment |

## Filter System

### Pipe Syntax

```xs
$text|trim|to_lower|strlen
$array|first|get:"name"
($count|to_text) ~ " items"    // Parentheses required in expressions
```

### CRITICAL: Type-Specific Filters

String and array filters are NOT interchangeable:

| Task | String Filter | Array Filter |
|------|--------------|--------------|
| Get length | `strlen` | `count` |
| Get part | `substr:0:3` | `slice:0:3` |
| Reverse | `split:""\|reverse\|join:""` | `reverse` |
| Contains | `contains:"text"` | `some:$$=="val"` |

### Math Filters

`add`, `subtract`, `multiply`, `divide`, `modulus`, `floor`, `ceil`, `round`, `abs`, `sqrt`, `pow`, `min`, `max`

Array math: `sum`, `avg`, `product`, `array_min`, `array_max`

Trig: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `deg2rad`, `rad2deg`

### String Filters

`trim`, `ltrim`, `rtrim`, `to_lower`, `to_upper`, `capitalize`, `strlen`, `substr`, `split`, `replace`, `contains`, `starts_with`, `ends_with`, `concat`

Case-insensitive: `icontains`, `istarts_with`, `iends_with`, `iindex`

Regex: `regex_matches`, `regex_get_first_match`, `regex_get_all_matches`, `regex_replace`

### Array Filters

`first`, `last`, `count`, `reverse`, `unique`, `flatten`, `shuffle`, `slice`, `push`, `pop`, `shift`, `unshift`, `merge`, `diff`, `intersect`, `join`, `range`, `..`

Functional: `map`, `filter`, `find`, `findIndex`, `some`, `every`, `reduce`

Grouping: `index_by`, `sort`, `group_by`

### Object Filters

`get`, `set`, `unset`, `has`, `keys`, `values`, `entries`, `pick`, `unpick`

Conditional: `set_conditional`, `set_ifnotempty`, `set_ifnotnull`

### Type Conversion

`to_int`, `to_decimal`, `to_text`, `to_bool`, `is_null`, `is_empty`, `is_array`, `is_object`, `is_int`, `is_text`

Null handling: `first_notnull`, `first_notempty`

### Date/Time Filters

`to_timestamp`, `to_ms`, `to_seconds`, `format_timestamp`, `transform_timestamp`, `add_secs_to_timestamp`, `add_ms_to_timestamp`

Extraction: `timestamp_year`, `timestamp_month`, `timestamp_day_of_month`, `timestamp_hour`, `timestamp_minute`, `timestamp_day_of_week`

### Encoding Filters

`json_encode`, `json_decode`, `base64_encode`, `base64_decode`, `url_encode`, `url_decode`, `xml_decode`, `yaml_encode`, `yaml_decode`, `hex2bin`, `bin2hex`

### Security Filters

`md5`, `sha1`, `sha256`, `sha512`, `hmac_sha256`, `encrypt`, `decrypt`, `jws_encode`, `jws_decode`, `jwe_encode`, `jwe_decode`, `secureid_encode`, `secureid_decode`, `uuid`

### DB Query Filters

`contains` (array), `includes` (string), `overlaps`, `between`, `within` (geo), `distance` (geo), `search_rank` (full-text), `cosine_similarity` (vector), `l2_distance_euclidean` (vector)

### Domain Functions (Alternative Syntax)

`text.contains()`, `text.starts_with()`, `text.ends_with()`, `text.icontains()`, `text.istarts_with()`, `text.iends_with()`

`object.keys()`, `object.values()`, `object.entries()`

`math.add()`, `math.sub()`, `math.mul()`, `math.div()`, `math.mod()`

## Control Flow

### Conditionals

```xs
conditional {
  if (`$input.age >= 18`) {
    var $status { value = "adult" }
  }
  elseif (`$input.age >= 13`) {    // ONE WORD: elseif
    var $status { value = "teen" }
  }
  else {
    var $status { value = "child" }
  }
}
```

Conditional as expression:
```xs
var $tier { value = conditional { if (`$level > 5`) { "premium" } else { "basic" } } }
```

### Loops

```xs
// Each (forEach)
each ($items as $item) {
  debug.log { value = $item.name }
}

// While (must be inside stack)
stack {
  var $i { value = 0 }
  while ($i < 10) {
    each { var.update $i { value = $i + 1 } }
  }
}

// Switch
switch ($input.action) {
  case "create" { /* ... */ }
  case "update" { /* ... */ }
  default { /* ... */ }
}
```

Loop controls: `break`, `continue`, `remove` (deletes current item during iteration)

### Early Return

```xs
conditional {
  if (`$input.skip == true`) {
    return { value = null }
  }
}
```

## Error Handling

### Preconditions

```xs
precondition ($input.amount > 0) {
  error_type = "inputerror"     // 400
  error = "Amount must be positive"
}
```

Error types: `inputerror` (400), `accessdenied` (403), `notfound` (404), `standard` (500)

### Try-Catch

```xs
try_catch {
  try {
    api.request { url = "https://..." } as $result
  }
  catch {
    debug.log { value = "Failed" }
  }
  finally {
    debug.log { value = "Cleanup" }
  }
}
```

### Throw

```xs
throw {
  name = "ValidationError"
  value = "Custom error message"
}
```

## Database Operations

| Operation | Purpose | Returns |
|-----------|---------|---------|
| `db.query` | Filtered list | Array of records |
| `db.get` | Single by field | Record or null |
| `db.has` | Check existence | Boolean |
| `db.add` | Insert | New record |
| `db.edit` | Update (known fields) | Updated record |
| `db.patch` | Update (dynamic fields) | Updated record |
| `db.add_or_edit` | Upsert | Record |
| `db.del` | Delete | void |
| `db.truncate` | Delete all | void |

### Where Clause Operators (DB-specific)

```xs
$db.user.name == "John"              // Equals
$db.user.name includes "ohn"         // String contains
$db.user.tags contains "admin"       // Array contains element
$db.user.tags overlaps ["a", "b"]    // Arrays share elements
$db.user.price between 10:100        // Range
$db.user.geo within $point:1000      // Geo radius (meters)
```

## Input Blocks

```xs
input {
  text name                          // Required
  text nickname?                     // Optional (nullable)
  text role?="user"                  // Optional with default
  email contact filters=trim|lower   // With filters
  text[] tags filters=trim           // Array type
  object address {                   // Nested object
    schema {
      text street
      text city
    }
  }
}
```

Rules:
- Empty input blocks: braces on separate lines
- Single input: can be one-liner
- Multiple inputs: each on own line

## Expressions

Expressions are evaluated inside backticks:

```xs
if (`$input.age >= 18`) { ... }
var $total { value = `$input.qty * $input.price` }
```

String concatenation with `~`:
```xs
var $msg { value = "Hello, " ~ $input.name ~ "!" }
var $info { value = ($status|to_text) ~ ": " ~ ($data|json_encode) }  // Parens required
```

## API Integration

### External HTTP Requests

```xs
api.request {
  url = "https://api.example.com/endpoint"
  method = "POST"
  params = $payload                  // NOTE: params = body (NOT query params)
  headers = ["Content-Type: application/json", "Authorization: Bearer " ~ $env.API_KEY]
} as $result

// Response: $result.response.status, $result.response.result, $result.response.headers
```

### Internal Function Calls

```xs
function.run "math/calculate" {
  input = { quantity: 5, price: 19.99 }
} as $result
```

## AI Agents and Tools

### Agent Definition

```xs
agent "Support Agent" {
  canonical = "support-v1"
  llm = {
    type: "xano-free"          // or "openai", "anthropic", "google-genai"
    system_prompt: "You are helpful"
    prompt: "{{ $args.message }}"
    max_steps: 5
    temperature: 0.7
  }
  tools = [{ name: "lookup_order" }]
}
```

### Tool Definition

```xs
tool "lookup_order" {
  description = "Internal docs"       // NOT sent to AI
  instructions = "How AI should use"  // Sent to AI
  input {
    int order_id { description = "The order ID to look up" }
  }
  stack { db.get "order" { field_name = "id", field_value = $input.order_id } as $order }
  response = $order
}
```

### Running Agents

```xs
ai.agent.run "Support Agent" {
  args = {}|set:"message":$input.text
  allow_tool_execution = true
} as $agent_result
```

## Testing

### Unit Tests (inside constructs)

```xs
test "calculates total correctly" {
  input = { quantity: 5, price: 10 }
  assert.to_equal { actual = $response.total, expected = 50 }
}
```

Assertions: `to_equal`, `to_not_equal`, `to_be_true`, `to_be_false`, `to_be_null`, `to_not_be_null`, `to_contain`, `to_match`, `to_throw`, `to_be_greater_than`, `to_be_less_than`

### Workflow Tests

```xs
workflow_test "user signup flow" {
  stack {
    api.call "auth/signup" {
      input = { email: "test@test.com", password: "pass123" }
    } as $signup
    assert.to_equal { actual = $signup.response.status, expected = 200 }
  }
}
```

## Integrations

### Cloud Storage

```xs
cloud.aws.s3.upload_file { key = $env.S3_KEY, secret = $env.S3_SECRET, bucket = "my-bucket", file_key = "path/file.txt", content = $data }
cloud.azure.storage.upload_file { ... }
cloud.google.storage.upload_file { ... }
```

### Redis

```xs
redis.set { key = "cache:user:1", value = $user|json_encode, ttl = 3600 }
redis.get { key = "cache:user:1" } as $cached
redis.ratelimit { key = "limit:ip:" ~ $env.$remote_ip, limit = 100, window = 60 } as $rate
```

### Search

```xs
cloud.elasticsearch.query { host = $env.ES_HOST, index = "products", query = { match: { name: $input.search } } } as $results
cloud.algolia.search { app_id = $env.ALGOLIA_APP, api_key = $env.ALGOLIA_KEY, index = "products", query = $input.search } as $results
```

### Utilities

```xs
util.send_email { to = $user.email, subject = "Welcome", body = $template }
security.create_auth_token { table = "user", id = $user.id, extras = {}, expiration = 86400 } as $token
security.check_password { password = $input.password, hash = $user.password } as $valid
zip.create { files = $file_list } as $archive
api.lambda { runtime = "nodejs", code = "..." } as $result
```
