# XanoScript Input Guidelines

This document provides comprehensive guidelines for defining and utilizing inputs in XanoScript queries and functions. Adhere to these principles when generating or reviewing XanoScript code to facilitate reliable API endpoints, reusable functions.

## Core Principles

- **Explicitness**: Always specify data types, optionality, and constraints to prevent runtime errors and enhance readability.
- **Validation**: Use filters and preconditions to enforce data integrity early in the execution flow.
- **Security**: Mark sensitive fields (e.g., passwords, emails) explicitly and apply appropriate filters (e.g., `lower` for emails).
- **Documentation**: Include a `description` for every input field to clarify its purpose and expected format.
- **Conciseness**: Avoid redundant validation; leverage defaults and filters where appropriate.

Inputs are defined within the `input` block of `query` or `function` declarations. The `response` block remains unaffected by inputs, focusing solely on outputs.

```xs
function "foo" {
  input {
    ...
  }

  stack {
    ...
  }

  response = null
}
```

## Input Structure

The `input` block accepts a series of field definitions, each following this syntax:

```
<type> <field_name>[?]? [filters=<filter_list>] {
  description = "<explanation>"
  [sensitive = true/false]
  [table = "<table_name>"]
  [schema { ... }]  // For nested objects
}
```

- **`<type>`**: Specifies the data type (see Types section below).
- **`?` (nullable marker)**: Append one `?` to the type for nullable fields (`int?` can be `null`).
- **`<field_name>`**: A descriptive identifier (e.g., `user_id`).
- **`?` (optional marker)**: Append one `?` to the field name for optional fields (not required).
- **`?=<default>`**: Alternatively from the single `?`, use `?=<value>` to set a default value for optional fields.
- **`filters=`**: Pipe-separated list of transformations or validations (e.g., `filters=trim|lower|min:1`).
- **`description`**: Optional but recommended explanatory text.
- **`sensitive`**: Boolean flag for logging/masking sensitive data from the logs (default: false).
- **`table`**: Links to a database table for foreign key validation (e.g., primary keys).
- **`schema`**: Nested block used by the `object` type to enforce structure.

### Nullable vs Optional

The first `?` on the type indicates the field can be of the given type or `null` (nullable).
The second `?` on the field name indicates it is optional (not required).

Examples:

```xs
input {
    text? required_and_nullable {
      description = "Can be null but must be provided"
    }
    text required_and_not_nullable {
      description = "Must be provided and cannot be null"
    }
    text? not_required_and_nullable? {
      description = "Can be null and is optional"
    }
    text not_required_and_not_nullable? {
      description = "Must be provided but cannot be null"
    }
}
```

### Arrays

Denote arrays with `[]` after the type (e.g., `int[]` for an array of integers). To limit the number of elements, use a range (e.g., `int[1:10]`). Filters apply element-wise.

```xs
input {
    int[1:10] max_10_scores? filters=min:0|max:100 {
      description = "Accepts between 1 and 10 scores between 0 and 100"
    }
    text[] tags? filters=trim|lower|ok:abcdefghijklmnopqrstuvwxyz0123456789, {
      description = "Array of tags, each trimmed and lowercased"
    }
}
```

### Defaults

Assign defaults with `?=<value>` (e.g., `int page?=1`).

```xs
input {
    int page?=1 filters=min:1 {
      description = "Page number, defaults to 1"
    }
    int page_size?=20 filters=min:1|max:100 {
      description = "Page size, defaults to 20, max 100"
    }
}
```

## Supported Types

The following types are accepted. Select based on the expected data format to enable automatic parsing and validation:

| Type             | Description                                                            | Example Usage                                     |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| `int`            | Signed 32-bit integer.                                                 | `int user_id`                                     |
| `decimal`        | Floating-point number with arbitrary precision.                        | `decimal price filters=min:0`                     |
| `text`           | Arbitrary string (UTF-8).                                              | `text title filters=trim`                         |
| `email`          | Validated email address.                                               | `email contact_email sensitive=true`              |
| `password`       | Secure string for credentials (hashed internally).                     | `password api_key filters=min:12`                 |
| `bool`           | Boolean (true/false).                                                  | `bool is_active?=true`                            |
| `timestamp`      | Epoch milliseconds (UTC) or ISO string.                                | `timestamp created_at`                            |
| `date`           | ISO date string (YYYY-MM-DD).                                          | `date birth_date`                                 |
| `uuid`           | Universally unique identifier (validated format).                      | `uuid session_id?`                                |
| `json`           | Parsed JSON object or array.                                           | `json metadata`                                   |
| `vector`         | Fixed-size numeric array for embeddings (specify dimension if needed). | `vector embedding`                                |
| `dblink`         | Database-linked object (auto-populates from table).                    | `dblink { table = "orders" }`                     |
| `enum`           | Restricted to predefined values.                                       | `enum status { values = ["active", "inactive"] }` |
| `file`           | File resource (accepts URL or data URI).                               | `file avatar`                                     |
| `image`          | Image file (subset of `file` with validation).                         | `image profile_photo`                             |
| `video`          | Video file.                                                            | `video tutorial`                                  |
| `audio`          | Audio file.                                                            | `audio recording`                                 |
| `attachment`     | Generic file attachment.                                               | `attachment document`                             |
| `geo_point`      | Geographic point (lat, lng).                                           | `geo_point location`                              |
| `geo_multipoint` | Array of geographic points.                                            | `geo_multipoint points`                           |
| `geo_linestring` | Line string of coordinates.                                            | `geo_linestring path`                             |
| `geo_polygon`    | Closed polygon of coordinates.                                         | `geo_polygon boundary`                            |

For arrays: Append `[]` (e.g., `decimal[] scores`).

For nested objects: Use `object` with a `schema` sub-block. For example we could define a `person` object like this:

```xs
input {
  object person? {
    schema {
      enum gender?=undisclosed {
        description = "Gender identity, defaults to undisclosed"
        values = ["undisclosed", "male", "female"]
      }

      text name filters=trim {
        description = "Full name (required)"
      }
      int age? {
        description = "Age in years (optional)"
      }
    }
  }
}
```

## Filters and Transformations

Filters process inputs declaratively. Chain them with `|` (e.g., `filters=trim|lower|min:1|max:100`). Common filters include:

| Filter                | Purpose                                      | Example                                |
| --------------------- | -------------------------------------------- | -------------------------------------- |
| `trim`                | Remove leading/trailing whitespace.          | `text name filters=trim`               |
| `lower`               | Convert to lowercase.                        | `email addr filters=lower`             |
| `upper`               | Convert to uppercase.                        | `text code filters=upper`              |
| `min:<value>`         | Enforce minimum value (numeric or length).   | `int age filters=min:18`               |
| `max:<value>`         | Enforce maximum value.                       | `text desc filters=max:500`            |
| `startsWith:<prefix>` | Require string prefix.                       | `text code filters=startsWith:ABC`     |
| `ok:<pattern>`        | Allow only matching characters (regex-like). | `text hex filters=ok:abcdef0123456789` |
| `prevent:<substring>` | Block specific substrings.                   | `text msg filters=prevent:spam`        |
| `digitOk`             | Permit only digits (for arrays/strings).     | `text[] nums filters=digitOk`          |
| `alphaOk`             | Permit only alphabetic characters.           | `text name filters=alphaOk`            |

- **Array-Specific**: Filters like `count:min:5|max:20` apply to array length.
- **Chaining Order**: Filters execute left-to-right; transformations (e.g., `trim`) precede validations (e.g., `min`).
- **Custom Validation**: For complex rules, use `precondition` in the `stack` block post-input.

## Validation and Error Handling

- **Built-in**: Filters trigger `inputerror` exceptions on failure (this is the preferred method).
- **Preconditions**: In the `stack` (when validating complex rules), for example if we wanted to ensure that a provided start date is before an end date we could do:

```xs
precondition ($input.start_date < $input.end_date) {
  description = "Start date must be before end date"
  error_type = "inputerror"
  error = "Start date must be before end date"
}
```

- **Error Types**: Use `inputerror` for validation, `accessdenied` for auth-related issues.
- **Sensitive Handling**: Set `sensitive=true` on input fields to mask in logs/responses.

## Best Practices

1. **Optionality**: Default to required fields; use `?` sparingly to avoid null-handling complexity.
2. **Arrays and Loops**: For array inputs, pair with `for` or `foreach` in `stack` for iteration.
3. **Database Integration**: Use `table` for foreign keys to auto-validate against schemas.
4. **Testing**: Include `test` blocks in functions/queries to verify input scenarios:

```xs
test "valid input" {
  input = {
    field: "value"
  }
  expect.to_equal ($response) {
    value = "expected"
  }
}
```

5. **Performance**: Limit array sizes with `max` filters; avoid large vectors without pagination.
6. **Security**: Always filter user inputs; never trust raw data.
7. **Nesting**: Limit schema depth to 2-3 levels to prevent over-complexity.

## Common Pitfalls

- **Missing Descriptions**: Omitting `description` reduces code clarity—always include.
- **Filter Misordering**: Validate after transformation (e.g., `trim` before `strlen`).
- **Type Mismatches**: Enforce types strictly; use `decimal` over `int` for precision.
- **Null Propagation**: Optional fields can cascade nulls—handle in `conditional` blocks.
- **No Comments**: Use `description` exclusively; the input section does not support inline comments.

By following these guidelines, inputs will be robust, self-documenting, and aligned with XanoScript's declarative paradigm. For advanced usage, refer to the full syntax reference. If discrepancies arise, prioritize schema consistency across related files.
