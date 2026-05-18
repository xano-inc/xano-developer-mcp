---
applyTo: "**/*.xs"
---

# XanoScript Survival Kit

> Minimal reference for writing valid XanoScript. For more: `xano_xanoscript_docs({ topic: "<topic>" })`.

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
$input.field     — input parameters (ALWAYS use $input. prefix, never bare $field)
$var.field        — stack variables (shorthand $field also works)
$auth.id          — authenticated user
$env.MY_VAR       — environment variable
$db.table.field   — database field reference (in where clauses)
$this             — current item in loops/maps
```

### Syntax Traps

**Trap 0: Complete constructs need required clauses**
```xs
// WRONG: query with only stack/response
// query "items" verb=GET { stack { } response = [] }
// WRONG: validating only a partial query body/snippet as if it were a file

// RIGHT: include input, stack, and response even when input is empty
query "items" verb=GET {
  api_group = "items"
  input {}
  stack {}
  response = []
}
```

**Trap 1: `elseif` not `else if`**
```xs
// WRONG: conditional { if (...) { } else if (...) { } }
// RIGHT:
conditional {
  if ($x > 0) { var $s { value = "positive" } }
  elseif ($x == 0) { var $s { value = "zero" } }
  else { var $s { value = "negative" } }
}
```

**Trap 2: Parentheses around filters in expressions**
```xs
// WRONG: if ($arr|count > 0) { }
// RIGHT:
if (($arr|count) > 0) { }

// WRONG: var $msg { value = $val|to_text ~ " items" }
// RIGHT:
var $msg { value = ($val|to_text) ~ " items" }

// WRONG: filter continuation starts on a new line with |
// var $match { value = $items
//   |find:$$.id == $input.id }
// RIGHT:
var $match { value = $items|find:$$.id == $input.id }
```

**Trap 3: Object literals use `:` — block properties use `=`**
```xs
// Object literal (data) — uses : with commas
var $data { value = { name: "Alice", age: 30 } }

// Block property (config) — uses = with NO commas, separate lines
precondition ($data != null) {
  error_type = "notfound"
  error = "Not found"
}
```

**Trap 4: `params` not `body` for api.request**
```xs
// WRONG: api.request { url = "..." method = "POST" body = $payload }
// RIGHT:
api.request { url = "..." method = "POST" params = $payload } as $result
```

**Trap 5: Wrong type names**
```xs
// WRONG: input { boolean active  integer count  string name }
// RIGHT:
input { bool active  int count  text name }
```

**Trap 6: Comments only in safe positions**
```xs
// Safe: file top, above inputs, immediately above stack operation lines
// WRONG: comments inside object literals, arrays, schema fields, index arrays,
//        or inside db.query/return/join/sort config blocks
// index = [
//   // invalid here
//   {type: "primary", field: [{name: "id"}]}
// ]
// db.query "user" {
//   // invalid here
//   return = {type: "list"}
// } as $users
```

**Trap 7: Stack operations often need `as $variable`**
```xs
// WRONG: db.query "user" { where = $db.user.active == true }
// RIGHT:
db.query "user" { where = $db.user.active == true } as $users
```

**Trap 8: Unit-test args belong in the right block**
```xs
// Mocks go inside the stack operation being mocked, not on the test block.
// Assertion values go inside assertions that accept { value = ... }.
test "returns user" {
  input = { id: 1 }
  expect.to_equal ($response.id) { value = 1 }
}
```

**Trap 9: PATCH endpoints must not write blank text unless intended**
```xs
var $updates { value = {} }
conditional {
  if ($input.cover_letter != null && ($input.cover_letter|trim) != "") {
    var.update $updates {
      value = $updates|set:"cover_letter":$input.cover_letter
    }
  }
}
db.patch "application" {
  field_name = "id"
  field_value = $input.application_id
  data = $updates
} as $application
```

### Canonical Function Example

```xs
function "get_user_greeting" {
  input {
    int user_id
    text? greeting?="Hello"
  }
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user != null) {
      error_type = "notfound"
      error = "User not found"
    }

    var $message { value = ($input.greeting ?? "Hello") ~ ", " ~ $user.name ~ "!" }
  }
  response = $message
}
```

### Canonical API Endpoint Example

```xs
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
```

### Common Operations

```xs
db.get "table" { field_name = "id" field_value = $id } as $record
db.query "table" { where = $db.table.active == true } as $records
db.add "table" { data = { field: value } } as $new
db.edit "table" { field_name = "id" field_value = $id data = { field: val } }
db.del "table" { field_name = "id" field_value = $id }
api.request { url = $url method = "POST" params = $data headers = ["Authorization: Bearer " ~ $env.KEY] } as $res
function.run "my_func" { input = { param: value } } as $result
foreach ($items) { each as $item { debug.log { value = $item } } }
```

### Input Modifiers

```xs
input {
  text name                  // required, not nullable
  text? bio                  // required, nullable (can send null)
  text role?="user"          // optional with default
  text? note?                // optional and nullable
  email contact filters=trim // with validation filter
  text[] tags                // array type
}
```

### Available Topics

survival, working, readme, essentials, syntax, syntax/string-filters, syntax/array-filters, syntax/functions, types, database, functions, apis, tables, tasks, triggers, agents, tools, mcp-servers, security, performance, debugging, unit-testing, workflow-tests, middleware, addons, realtime, streaming, integrations, integrations/cloud-storage, integrations/search, integrations/redis, integrations/external-apis, integrations/utilities, workspace, branch, frontend
