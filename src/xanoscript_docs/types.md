---
applyTo: "functions/**/*.xs, apis/**/*.xs, tools/**/*.xs, agents/**/*.xs"
---

# Types & Inputs

Reference for XanoScript data types, input blocks, and validation.

## Quick Reference

### Primitive Types
| Type | Description | Example |
|------|-------------|---------|
| `int` | 32-bit integer | `int user_id` |
| `decimal` | Floating-point | `decimal price` |
| `text` | UTF-8 string | `text name filters=trim` |
| `bool` | Boolean | `bool is_active?=true` |
| `email` | Validated email | `email contact filters=lower` |
| `password` | Hashed credential | `password secret` |
| `uuid` | UUID string | `uuid session_id` |
| `timestamp` | Epoch ms or ISO | `timestamp created_at` |
| `date` | YYYY-MM-DD | `date birth_date` |
| `json` | JSON object/array | `json metadata` |

### Special Types
| Type | Description |
|------|-------------|
| `vector` | Numeric array for embeddings |
| `enum` | Restricted value set |
| `object` | Nested schema |
| `file` / `image` / `video` / `audio` / `attachment` | File resources |
| `geo_point` / `geo_polygon` / `geo_linestring` | Geographic data |

### Modifiers
| Syntax | Meaning |
|--------|---------|
| `text?` | Nullable (can be null) |
| `text name?` | Optional (not required) |
| `text name?="default"` | Optional with default |
| `text[]` | Array of type |
| `text[1:10]` | Array with size constraints |

---

## Input Block

Define parameters for functions, APIs, and tools:

```xs
input {
  text username filters=trim {
    description = "User's login name"
  }
  int age? filters=min:0 {
    description = "Optional age"
  }
  text role?="user" {
    description = "Role, defaults to 'user'"
  }
}
```

### Empty Input Blocks

**SYNTAX REQUIREMENT:** When an input block has no parameters, the braces MUST be on separate lines.

**Why:** The XanoScript parser requires whitespace between braces to distinguish empty input blocks from inline objects.

**Impact:** Using `input {}` on a single line will cause:
- Syntax error during compilation
- Function/API/tool will fail to deploy

```xs
// CORRECT - braces on separate lines
input {
}

// WRONG - causes parsing errors
input {}
```

Access inputs in stack: `$input.username`, `$input.age`

---

## Type Details

### text
```xs
text name filters=trim|lower           // With filters
text bio? filters=max:500              // Optional, max 500 chars
```

### int / decimal
```xs
int quantity filters=min:0|max:100
decimal price filters=min:0.01
```

### bool
```xs
bool is_active?=true                   // Defaults to true
bool confirmed?=false
```

### email
```xs
email contact filters=trim|lower {
  sensitive = true
}
```

### password
```xs
password secret filters=min:8          // Minimum 8 characters
```

#### Password Complexity Filters
| Filter | Description | Example |
|--------|-------------|---------|
| `min:<n>` | Minimum total length | `password pwd filters=min:8` |
| `minAlpha:<n>` | Minimum letters (a-zA-Z) | `password pwd filters=minAlpha:2` |
| `minLowerAlpha:<n>` | Minimum lowercase letters | `password pwd filters=minLowerAlpha:1` |
| `minUpperAlpha:<n>` | Minimum uppercase letters | `password pwd filters=minUpperAlpha:1` |
| `minDigit:<n>` | Minimum digits (0-9) | `password pwd filters=minDigit:1` |
| `minSymbol:<n>` | Minimum special characters | `password pwd filters=minSymbol:1` |

```xs
// Strong password: 8+ chars, 1 upper, 1 lower, 1 digit, 1 symbol
password strong_pwd filters=min:8|minUpperAlpha:1|minLowerAlpha:1|minDigit:1|minSymbol:1
```

### timestamp / date
```xs
timestamp created_at?=now              // Defaults to current time
date birth_date
```

### uuid
```xs
uuid session_id
uuid user_id { table = "user" }        // Foreign key reference
```

### json
```xs
json metadata                          // Any JSON structure
json settings?={}                      // Default empty object
```

### enum
```xs
enum status {
  values = ["pending", "active", "cancelled"]
  description = "Order status"
}

enum priority?="medium" {
  values = ["low", "medium", "high"]
}
```

### object (Nested Schema)
```xs
object address {
  schema {
    text street filters=trim
    text city filters=trim
    text zip filters=trim
    text country?="US"
  }
}
```

### Arrays
```xs
text[] tags filters=trim|lower         // Array of trimmed lowercase strings
int[1:10] scores filters=min:0|max:100 // 1-10 integers between 0-100
object[] items {
  schema {
    int id
    text name
  }
}
```

### File Types
```xs
image photo {
  description = "Profile photo"
}
attachment document
video recording
audio clip
file generic_file
```

### Geographic Types
```xs
geo_point location
geo_polygon boundary
geo_linestring path
geo_multipoint points
```

---

## Input Filters

Filters validate and transform input values. Chain with `|`.

### String Filters
| Filter | Description | Example |
|--------|-------------|---------|
| `trim` | Remove leading/trailing whitespace | `text name filters=trim` |
| `lower` | Convert to lowercase | `text email filters=lower` |
| `upper` | Convert to uppercase | `text code filters=upper` |
| `min:<n>` | Minimum length | `text name filters=min:2` |
| `max:<n>` | Maximum length | `text bio filters=max:500` |
| `ok:<chars>` | Allow only specified characters | `text hex filters=ok:0123456789abcdef` |
| `prevent:<str>` | Block specific substrings | `text name filters=prevent:admin` |
| `startsWith:<prefix>` | Require prefix | `text sku filters=startsWith:SKU-` |
| `alphaOk` | Allow only letters (a-zA-Z) | `text name filters=alphaOk` |
| `digitOk` | Allow only digits (0-9) | `text code filters=digitOk` |
| `pattern:<regex>` | Match regex pattern | `text phone filters=pattern:^\+?[0-9]+$` |

### Numeric Filters
| Filter | Description | Example |
|--------|-------------|---------|
| `min:<n>` | Minimum value | `int age filters=min:0` |
| `max:<n>` | Maximum value | `int age filters=max:150` |

### Array Filters
| Filter | Description | Example |
|--------|-------------|---------|
| `min:<n>` | Minimum array length | `text[] tags filters=min:1` |
| `max:<n>` | Maximum array length | `text[] tags filters=max:10` |

### Character Set Filters

```xs
input {
  // Allow only specific characters
  text hex_code filters=ok:0123456789abcdef

  // Allow letters only
  text name filters=alphaOk

  // Allow digits only
  text pin filters=digitOk

  // Combine: letters, digits, and underscore
  text username filters=ok:abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_
}
```

### Pattern Validation

```xs
input {
  // Phone number pattern
  text phone filters=pattern:^\+?[1-9]\d{1,14}$

  // Postal code pattern
  text zip filters=pattern:^\d{5}(-\d{4})?$

  // Custom ID format
  text product_id filters=pattern:^[A-Z]{2}-\d{4}$
}
```

### Combined Examples
```xs
input {
  text username filters=trim|lower|min:3|max:20|ok:abcdefghijklmnopqrstuvwxyz0123456789_
  email contact filters=trim|lower
  int age filters=min:0|max:150
  text hex_code filters=ok:abcdef0123456789|min:6|max:6
  text[] tags filters=trim|lower|max:50
  text phone filters=trim|pattern:^\+?[0-9\s-]+$
  int quantity filters=min:1|max:100
}

---

## Nullable vs Optional

```xs
input {
  // Required, cannot be null
  text required_field

  // Required, can be null (must provide, can send null)
  text? nullable_field

  // Optional, cannot be null (can omit, but if sent must have value)
  text optional_field?

  // Optional, can be null (can omit or send null)
  text? nullable_optional?

  // Optional with default
  text with_default?="hello"
}
```

---

## Foreign Key References

Link input to a table for validation:

```xs
input {
  int user_id {
    table = "user"
    description = "References user table"
  }
  uuid post_id {
    table = "post"
  }
}
```

---

## Sensitive Fields

Mark fields for log masking:

```xs
input {
  password api_key {
    sensitive = true
  }
  text ssn {
    sensitive = true
  }
}
```

---

## Validation with Preconditions

For complex validation beyond filters, use preconditions. For complete error handling reference, use `xanoscript_docs({ topic: "syntax" })`.

```xs
precondition ($input.start_date < $input.end_date) {
  error_type = "inputerror"
  error = "Start date must be before end date"
}
```

---

## Best Practices

1. **Always specify types** - Never leave inputs untyped
2. **Use filters first** - Prefer declarative filters over stack validation
3. **Mark sensitive data** - Use `sensitive = true` for PII/credentials
4. **Validate at boundaries** - Validate user input, trust internal calls
