---
applyTo: "function/**/*.xs, api/**/*.xs"
---

# Schema Operations

Runtime schema parsing and validation for dynamic data structures.

## Quick Reference

| Function | Purpose |
|----------|---------|
| `schema.parse` | Parse and validate any schema |
| `schema.parse.object` | Parse object schema |
| `schema.parse.array` | Parse array schema |
| `schema.parse.attribute` | Parse single attribute |
| `schema.parse.constant` | Parse constant value |
| `schema.parse.enum` | Parse enum value |
| `schema.parse.immutable` | Parse immutable structure |

---

## schema.parse

Parse and validate data against a dynamic schema.

```xs
schema.parse {
  data = $input.payload
  schema = {
    type: "object",
    properties: {
      name: { type: "text", required: true },
      email: { type: "email", filters: ["trim", "lower"] },
      age: { type: "int", filters: ["min:0", "max:150"] }
    }
  }
} as $validated
```

### Schema Definition

| Property | Description |
|----------|-------------|
| `type` | Data type (text, int, decimal, bool, object, array, etc.) |
| `required` | Whether field is required (default: false) |
| `nullable` | Whether null is allowed (default: false) |
| `default` | Default value if not provided |
| `filters` | Array of validation filters |
| `properties` | Nested properties (for object type) |
| `items` | Item schema (for array type) |

---

## schema.parse.object

Parse and validate an object structure.

```xs
schema.parse.object {
  data = $input.user
  schema = {
    id: { type: "int", required: true },
    profile: {
      type: "object",
      properties: {
        name: { type: "text", required: true },
        bio: { type: "text", nullable: true, filters: ["max:500"] }
      }
    },
    roles: { type: "array", items: { type: "text" } }
  }
} as $user
```

### With Defaults

```xs
schema.parse.object {
  data = $input.settings
  schema = {
    theme: { type: "text", default: "light" },
    notifications: { type: "bool", default: true },
    language: { type: "text", default: "en" }
  }
} as $settings
```

---

## schema.parse.array

Parse and validate an array structure.

```xs
schema.parse.array {
  data = $input.items
  schema = {
    min_items: 1,
    max_items: 100,
    items: {
      type: "object",
      properties: {
        product_id: { type: "int", required: true },
        quantity: { type: "int", required: true, filters: ["min:1"] }
      }
    }
  }
} as $items
```

### Flat Array

```xs
schema.parse.array {
  data = $input.tags
  schema = {
    items: { type: "text", filters: ["trim", "lower"] },
    unique: true
  }
} as $tags
```

---

## schema.parse.attribute

Parse a single attribute value.

```xs
schema.parse.attribute {
  data = $input.email
  schema = {
    type: "email",
    required: true,
    filters: ["trim", "lower"]
  }
} as $email
```

### With Custom Validation

```xs
schema.parse.attribute {
  data = $input.phone
  schema = {
    type: "text",
    pattern: "^\\+?[1-9]\\d{1,14}$",
    error_message: "Invalid phone number format"
  }
} as $phone
```

---

## schema.parse.constant

Validate that a value matches an expected constant.

```xs
schema.parse.constant {
  data = $input.version
  schema = {
    value: "2.0",
    error_message: "Only API version 2.0 is supported"
  }
}
```

---

## schema.parse.enum

Validate that a value is one of allowed options.

```xs
schema.parse.enum {
  data = $input.status
  schema = {
    values: ["pending", "active", "suspended", "closed"],
    error_message: "Invalid status value"
  }
} as $status
```

### With Default

```xs
schema.parse.enum {
  data = $input.priority
  schema = {
    values: ["low", "medium", "high"],
    default: "medium"
  }
} as $priority
```

---

## schema.parse.immutable

Parse a structure that cannot be modified after parsing.

```xs
schema.parse.immutable {
  data = $input.config
  schema = {
    api_version: { type: "text", required: true },
    features: { type: "array", items: { type: "text" } }
  }
} as $config

// Attempting to modify $config will throw an error
```

---

## Dynamic Schema Generation

Build schemas programmatically.

```xs
function "validate_dynamic_form" {
  input {
    object form_config
    object form_data
  }
  stack {
    // Build schema from configuration
    var $schema { value = { type: "object", properties: {} } }

    foreach ($input.form_config.fields) {
      each as $field {
        var.update $schema.properties {
          value = $schema.properties|set:$field.name:{
            type: $field.type,
            required: $field.required,
            filters: $field.filters
          }
        }
      }
    }

    // Validate form data against dynamic schema
    schema.parse.object {
      data = $input.form_data
      schema = $schema.properties
    } as $validated
  }
  response = $validated
}
```

---

## Error Handling

Schema validation errors can be caught and handled.

```xs
try_catch {
  try {
    schema.parse.object {
      data = $input.payload
      schema = $expected_schema
    } as $validated
  }
  catch {
    // $error contains validation details
    // $error.field - which field failed
    // $error.message - validation error message
    // $error.value - the invalid value
    throw {
      name = "ValidationError"
      value = {
        field: $error.field,
        message: $error.message
      }
    }
  }
}
```

---

## Best Practices

1. **Define schemas upfront** - Use input blocks when structure is known
2. **Use schema.parse for dynamic data** - External APIs, user-generated content
3. **Validate at boundaries** - Parse external input, trust internal data
4. **Provide clear error messages** - Use error_message for user-facing errors
5. **Use immutable for config** - Prevent accidental modification
