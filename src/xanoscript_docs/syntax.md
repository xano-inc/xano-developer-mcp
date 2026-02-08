---
applyTo: "**/*.xs"
---

# Syntax Reference

Complete reference for XanoScript expressions, operators, and filters.

## Quick Reference

### Operators
| Category | Operators |
|----------|-----------|
| Comparison | `==`, `!=`, `>`, `<`, `>=`, `<=` |
| Logical | `&&`, `||`, `!` |
| Math | `+`, `-`, `*`, `/`, `%` |
| String | `~` (concat) |
| Null-safe | `==?`, `!=?`, `>=?`, `<=?` (ignore if null) |

### Common Filters
| Filter | Purpose | Example |
|--------|---------|---------|
| `trim` | Remove whitespace | `$s\|trim` |
| `lower` / `upper` | Case conversion | `$s\|to_lower` |
| `first` / `last` | Array endpoints | `$arr\|first` |
| `count` | Array/object length | `$arr\|count` |
| `get` | Object property | `$obj\|get:"key"` |
| `set` | Set property | `$obj\|set:"key":"val"` |
| `json_encode` / `json_decode` | JSON conversion | `$obj\|json_encode` |

---

## Expressions

Expressions are wrapped in backticks for evaluation:

```xs
conditional {
  if (`$input.age >= 18`) { ... }
}

var $total { value = `$input.qty * $input.price` }
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

## Math Filters

| Filter | Example | Result |
|--------|---------|--------|
| `add` | `10\|add:5` | `15` |
| `subtract` | `10\|subtract:3` | `7` |
| `multiply` | `10\|multiply:2` | `20` |
| `divide` | `10\|divide:2` | `5` |
| `modulus` | `10\|modulus:3` | `1` |
| `floor` | `2.7\|floor` | `2` |
| `ceil` | `2.3\|ceil` | `3` |
| `round` | `2.567\|round:2` | `2.57` |
| `abs` | `-5\|abs` | `5` |
| `sqrt` | `9\|sqrt` | `3` |
| `pow` | `2\|pow:3` | `8` |
| `min` | `5\|min:3` | `3` |
| `max` | `5\|max:10` | `10` |

### Array Math
```xs
[1,2,3,4]|sum        // 10
[1,2,3,4]|avg        // 2.5
[1,2,3,4]|product    // 24
[5,2,8,1]|array_min  // 1
[5,2,8,1]|array_max  // 8
```

### Trigonometry
`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `deg2rad`, `rad2deg`

---

## String Filters

| Filter | Example | Result |
|--------|---------|--------|
| `trim` | `"  hi  "\|trim` | `"hi"` |
| `ltrim` / `rtrim` | `"  hi"\|ltrim` | `"hi"` |
| `to_lower` | `"Hi"\|to_lower` | `"hi"` |
| `to_upper` | `"Hi"\|to_upper` | `"HI"` |
| `capitalize` | `"hi there"\|capitalize` | `"Hi There"` |
| `strlen` | `"hello"\|strlen` | `5` |
| `substr` | `"hello"\|substr:1:3` | `"ell"` |
| `split` | `"a,b,c"\|split:","` | `["a","b","c"]` |
| `replace` | `"hello"\|replace:"l":"x"` | `"hexxo"` |
| `contains` | `"hello"\|contains:"ell"` | `true` |
| `starts_with` | `"hello"\|starts_with:"he"` | `true` |
| `ends_with` | `"hello"\|ends_with:"lo"` | `true` |
| `concat` | `"a"\|concat:"b":"-"` | `"a-b"` |

### Case-Insensitive Variants
`icontains`, `istarts_with`, `iends_with`, `iindex`

### Regex
```xs
"/pattern/"|regex_matches:"subject"           // Boolean match
"/(\w+)/"|regex_get_first_match:"test"        // First match
"/\w+/"|regex_get_all_matches:"a b c"         // All matches
"/\s+/"|regex_replace:"-":"a  b"              // Replace: "a-b"
```

---

## Array Filters

| Filter | Example | Result |
|--------|---------|--------|
| `first` | `[1,2,3]\|first` | `1` |
| `last` | `[1,2,3]\|last` | `3` |
| `count` | `[1,2,3]\|count` | `3` |
| `reverse` | `[1,2,3]\|reverse` | `[3,2,1]` |
| `unique` | `[1,1,2]\|unique` | `[1,2]` |
| `flatten` | `[[1,2],[3]]\|flatten` | `[1,2,3]` |
| `shuffle` | `[1,2,3]\|shuffle` | Random order |
| `slice` | `[1,2,3,4]\|slice:1:2` | `[2,3]` |
| `push` | `[1,2]\|push:3` | `[1,2,3]` |
| `pop` | `[1,2,3]\|pop` | `3` |
| `shift` | `[1,2,3]\|shift` | `1` |
| `unshift` | `[1,2]\|unshift:0` | `[0,1,2]` |
| `merge` | `[1,2]\|merge:[3,4]` | `[1,2,3,4]` |
| `diff` | `[1,2,3]\|diff:[2]` | `[1,3]` |
| `intersect` | `[1,2,3]\|intersect:[2,3,4]` | `[2,3]` |
| `join` | `["a","b"]\|join:","` | `"a,b"` |
| `range` | `\|range:1:5` | `[1,2,3,4,5]` |
| `..` | `(1..5)` | `[1,2,3,4,5]` |

### Range Operator

Generate numeric ranges with the `..` operator:

```xs
(1..5)                                      // [1,2,3,4,5]
(0..10)                                     // [0,1,2,3,4,5,6,7,8,9,10]
($start..$end)                              // Dynamic range with variables
```

### Functional Operations
```xs
// Map - transform each element
[{v:1},{v:2}]|map:$$.v*2                    // [2,4]

// Filter - keep matching elements
[1,2,3,4]|filter:$$%2==0                    // [2,4]

// Find - first matching element
[{id:1},{id:2}]|find:$$.id==2               // {id:2}

// FindIndex - index of first match
[{id:1},{id:2}]|findIndex:$$.id==2          // 1

// Some - any element matches?
[1,2,3]|some:$$>2                           // true

// Every - all elements match?
[2,4,6]|every:$$%2==0                       // true

// Reduce - accumulate to single value
[1,2,3,4]|reduce:$$+$result:0               // 10
```

### Grouping & Indexing
```xs
// Group by property
[{g:"a",v:1},{g:"b",v:2},{g:"a",v:3}]|index_by:g
// {"a":[{g:"a",v:1},{g:"a",v:3}],"b":[{g:"b",v:2}]}

// Sort
[{n:"z"},{n:"a"}]|sort:n:text:false         // Ascending by n
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

## Encoding Filters

| Filter | Example |
|--------|---------|
| `json_encode` | `{a:1}\|json_encode` |
| `json_decode` | `'{"a":1}'\|json_decode` |
| `base64_encode` | `"hello"\|base64_encode` |
| `base64_decode` | `"aGVsbG8="\|base64_decode` |
| `url_encode` | `"a b"\|url_encode` |
| `url_decode` | `"a%20b"\|url_decode` |
| `xml_decode` | `"<a>1</a>"\|xml_decode` |
| `yaml_encode` / `yaml_decode` | YAML conversion |
| `hex2bin` / `bin2hex` | Hex conversion |

---

## Security Filters

| Filter | Example |
|--------|---------|
| `md5` | `"text"\|md5` |
| `sha1` / `sha256` / `sha512` | Hash functions |
| `hmac_sha256` | `"msg"\|hmac_sha256:"key"` |
| `encrypt` | `"data"\|encrypt:"aes-256-cbc":"key":"iv"` |
| `decrypt` | `$enc\|decrypt:"aes-256-cbc":"key":"iv"` |
| `jws_encode` / `jws_decode` | JWT signing |
| `jwe_encode` / `jwe_decode` | JWT encryption |
| `secureid_encode` / `secureid_decode` | ID obfuscation |
| `uuid` | `\|uuid` |

---

## DB Query Filters

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

### Timestamp Arithmetic (DB)
```xs
$db.created_at|timestamp_add_days:7
$db.created_at|timestamp_subtract_hours:24
```

---

## Error Handling

### Preconditions

Validate conditions and throw typed errors:

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

### Error Types

| Type | HTTP Status | Use Case |
|------|-------------|----------|
| `inputerror` | 400 Bad Request | Invalid input data |
| `accessdenied` | 403 Forbidden | Authorization failure |
| `notfound` | 404 Not Found | Resource doesn't exist |
| `standard` | 500 Internal Server Error | General errors |

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
```

---

## Additional Operators

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

---

## Additional Filters

### Text Domain Functions

Functional equivalents for string operations:

```xs
text.contains("hello world", "world")        // true
text.starts_with("hello", "he")              // true
text.ends_with("hello", "lo")                // true
text.icontains("Hello World", "WORLD")       // true (case-insensitive)
text.istarts_with("Hello", "HE")             // true
text.iends_with("Hello", "LO")               // true
```

### Object Domain Functions

Functional equivalents for object operations:

```xs
object.keys({a: 1, b: 2})                    // ["a", "b"]
object.values({a: 1, b: 2})                  // [1, 2]
object.entries({a: 1, b: 2})                 // [{key: "a", value: 1}, {key: "b", value: 2}]
```

### Math Domain Functions

Functional equivalents for math operations:

```xs
math.add(5, 3)                               // 8
math.sub(10, 4)                              // 6
math.mul(3, 4)                               // 12
math.div(20, 5)                              // 4
math.mod(10, 3)                              // 1
```

### Bitwise Operations

```xs
// As filters
5|bitwise_and:3                              // 1
5|bitwise_or:3                               // 7
5|bitwise_xor:3                              // 6
5|bitwise_not                                // -6

// As functions
math.bitwise.and(5, 3)                       // 1
math.bitwise.or(5, 3)                        // 7
math.bitwise.xor(5, 3)                       // 6
```

### Logical NOT Filter

```xs
true|not                                     // false
false|not                                    // true
$condition|not                               // Inverts boolean
```

### Array Filtering

| Filter | Description | Example |
|--------|-------------|---------|
| `filter_empty` | Remove empty values | `$arr\|filter_empty` |
| `filter_empty_text` | Remove empty strings | `$arr\|filter_empty_text` |
| `filter_empty_array` | Remove empty arrays | `$arr\|filter_empty_array` |
| `filter_empty_object` | Remove empty objects | `$arr\|filter_empty_object` |
| `filter_null` | Remove null values | `$arr\|filter_null` |
| `filter_zero` | Remove zero values | `$arr\|filter_zero` |
| `filter_false` | Remove false values | `$arr\|filter_false` |

```xs
[1, null, "", 0, "text", false]|filter_empty      // [1, "text"]
["a", "", "b", ""]|filter_empty_text              // ["a", "b"]
```

### Array Fill Operations

```xs
|fill:5:"x"                                  // ["x", "x", "x", "x", "x"]
["a", "b"]|fill_keys:{"a": 1, "b": 2}        // {a: 1, b: 2}
```

### Deep Merge & Comparison

```xs
{a: {b: 1}}|merge_recursive:{a: {c: 2}}      // {a: {b: 1, c: 2}}
[1, 2, 3]|diff_assoc:[2]                     // Associative diff
[1, 2, 3]|intersect_assoc:[2, 3, 4]          // Associative intersect
```

### Encoding Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `list_encodings` | List available encodings | `\|list_encodings` |
| `detect_encoding` | Detect string encoding | `$text\|detect_encoding` |
| `to_utf8` | Convert to UTF-8 | `$text\|to_utf8` |
| `from_utf8` | Convert from UTF-8 | `$text\|from_utf8:"ISO-8859-1"` |
| `convert_encoding` | Convert encodings | `$text\|convert_encoding:"UTF-8":"ISO-8859-1"` |

```xs
// CSV parsing (alternative to csv_decode)
$csv_text|csv_parse                          // Parse CSV string
$data|csv_create                             // Create CSV string

// Query string
"a=1&b=2"|querystring_parse                  // {a: "1", b: "2"}
```

### String Escape Filters

| Filter | Description |
|--------|-------------|
| `addslashes` | Escape quotes and backslashes |
| `escape` | HTML escape |
| `text_escape` | Escape for text output |
| `text_unescape` | Unescape text |
| `regex_quote` | Escape regex special characters |

```xs
"Hello \"World\""|addslashes                 // "Hello \\\"World\\\""
"<script>"|escape                            // "&lt;script&gt;"
"^test$"|regex_quote                         // "\^test\$"
```

### Trigonometry Examples

```xs
// Radians and degrees
90|deg2rad                                   // 1.5707963...
1.5707963|rad2deg                            // 90

// Trig functions (input in radians)
0|sin                                        // 0
0|cos                                        // 1
0.785398|tan                                 // ~1 (45 degrees)

// Inverse trig
0|asin                                       // 0
1|acos                                       // 0
1|atan                                       // 0.785398...

// Hyperbolic
0|sinh                                       // 0
0|cosh                                       // 1
0|tanh                                       // 0
```

### DB Query Timestamp Filters

Extended timestamp operations for database queries:

```xs
$db.created_at|timestamp_year                // Extract year
$db.created_at|timestamp_month               // Extract month (1-12)
$db.created_at|timestamp_week                // Extract week number
$db.created_at|timestamp_day_of_month        // Day of month (1-31)
$db.created_at|timestamp_day_of_week         // Day of week (0-6)
$db.created_at|timestamp_day_of_year         // Day of year (1-366)
$db.created_at|timestamp_hour                // Hour (0-23)
$db.created_at|timestamp_minute              // Minute (0-59)

// Epoch variants
$db.created_at|timestamp_epoch_seconds       // Seconds since epoch
$db.created_at|timestamp_epoch_ms            // Milliseconds since epoch
```

### Vector Operations (AI/ML)

Additional vector similarity functions:

```xs
$db.embedding|l1_distance_manhattan:$input.vector    // L1/Manhattan distance
$db.embedding|negative_inner_product:$input.vector   // Negative inner product
$db.embedding|inner_product:$input.vector            // Inner product

// Geo covers (for polygon containment)
$db.boundary|covers:$input.point                     // Polygon covers point
```
