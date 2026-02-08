---
applyTo: "run/**/*.xs"
---

# Run Configurations

Define job and service configurations for the Xano Job Runner.

## Quick Reference

| Type | Purpose | Lifecycle |
|------|---------|-----------|
| **run.job** | Execute a function once | Runs main function, then shuts down |
| **run.service** | Long-running background process | Runs pre initialization, then maintains service |

### Directory Structure
```
run.xs
tables/
functions/
apis/
```

---

## run.job

Execute a function as a standalone job in the Xano Job Runner.

### Syntax
```xs
run.job "Job Name" {
  main = {
    name: "function_name"
    input: { key: value }
  }
  env = ["ENV_VAR1", "ENV_VAR2"]
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `main` | Object | Yes | Function to execute |
| `main.name` | String | Yes | Name of the function to call |
| `main.input` | Object | No | Input parameters for the function |
| `env` | String[] | No | Environment variables required |

### Basic Example
```xs
run.job "Random Dad Joke" {
  main = {
    name: "fetch_dad_joke"
    input: {}
  }
}
```

### With Input Parameters
```xs
run.job "Average of values" {
  main = {
    name: "avg_value"
    input: {
      left: 1
      right: 2
    }
  }
}
```

### With Environment Variables
```xs
run.job "Gemini Image Understanding" {
  main = {
    name: "analyze_image"
    input: {
      model: "gemini-1.5-flash"
      prompt: "Describe what is happening in this image."
      image: "(attach image file)"
    }
  }
  env = ["gemini_api_key"]
}
```

---

## run.service

Define a long-running background service with optional initialization.

### Syntax
```xs
run.service "Service Name" {
  pre = {
    name: "init_function"
    input: { key: value }
  }
  env = ["ENV_VAR1", "ENV_VAR2"]
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `pre` | Object | No | Initialization function |
| `pre.name` | String | Yes (if pre) | Name of the init function |
| `pre.input` | Object | No | Input parameters for init |
| `env` | String[] | No | Environment variables required |

### Minimal Form
```xs
run.service "email proxy"
```

### Basic Example
```xs
run.service "Random Dad Joke" {
  pre = {
    name: "fetch_dad_joke"
    input: {}
  }
}
```

### With Initialization
```xs
run.service "email proxy" {
  pre = {
    name: "email_proxy_init"
    input: {
      config: "default"
    }
  }
}
```

### With Environment Variables
```xs
run.service "webhook listener" {
  pre = {
    name: "init_webhook_listener"
    input: {
      port: 8080
    }
  }
  env = ["webhook_secret", "database_url"]
}
```

---

## Supporting Files

Jobs and services can include supporting tables and functions.

### Table with Seed Data
```xs
table users {
  auth = false
  schema {
    int id
    text name
    text email
    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
  items = [
    {"id": 1, "name": "Alice", "email": "alice@example.com"}
    {"id": 2, "name": "Bob", "email": "bob@example.com"}
  ]
}
```

### Function Definition
```xs
function "process_data" {
  input {
    json data
  }
  stack {
    db.query users {
      return = { type: "list" }
    } as $users
  }
  response = $users
}
```

---

## Complete Job Example

```
run.xs
tables/
└── users.xs
functions/
└── migrate_users.xs
```

### run.xs
```xs
run.job "Data Migration" {
  main = {
    name: "migrate_users"
    input: {
      batch_size: 100
    }
  }
  env = ["source_db_url", "webhook_url"]
}
```

### tables/users.xs
```xs
table users {
  auth = false
  schema {
    int id
    text name
    text email
    timestamp migrated_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
  items = [
    {"id": 1, "name": "Alice", "email": "alice@example.com"}
    {"id": 2, "name": "Bob", "email": "bob@example.com"}
  ]
}
```

### functions/migrate_users.xs
```xs
function "migrate_users" {
  input {
    int batch_size
  }
  stack {
    db.query users {
      where = $db.users.migrated_at == null
      paging = { page: 1, per_page: $input.batch_size }
    } as $pending

    foreach ($pending) {
      each as $user {
        db.edit users {
          field_name = "id"
          field_value = $user.id
          data = { migrated_at: now }
        }
      }
    }
  }
  response = { migrated: $pending|count }
}
```

---

## Complete Service Example

```
run.xs
tables/
└── event.xs
apis/
├── api_group.xs
├── list.xs
└── add.xs
```

### run.xs
```xs
run.service "Event Tracker" {
  pre = {
    name: "init_tracker"
    input: {}
  }
  env = ["api_key"]
}
```

### tables/event.xs
```xs
table event {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    text name
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
  items = []
}
```

### apis/list.xs
```xs
query list verb=GET {
  api_group = "events"
  stack {
    db.query event {
      sort = { created_at: "desc" }
      return = { type: "list" }
    } as $events
  }
  response = $events
}
```

---

## Differences: run.job vs run.service

| Feature | run.job | run.service |
|---------|---------|-------------|
| Required attribute | `main` | None |
| Init function | N/A | `pre` (optional) |
| Lifecycle | Executes once | Long-running |
| Use case | One-time operations | Proxies, listeners, daemons |

---

## Validation Rules

1. **run.job requires `main`** - Missing `main` causes an error
2. **run.service cannot use `main`** - Use `pre` for initialization
3. **`env` must be string array** - Cannot contain numbers or booleans
4. **Input values must be constants** - No variables like `$input` allowed

---

## Best Practices

1. **Name clearly** - Indicate purpose: `data-migration`, `email-proxy`
2. **Use env for secrets** - Never hardcode API keys or credentials
3. **Keep self-contained** - Include all required tables and functions
4. **Seed test data** - Use `items` in table definitions for testing
5. **Validate inputs** - Use preconditions in functions for input validation
