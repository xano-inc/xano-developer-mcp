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
