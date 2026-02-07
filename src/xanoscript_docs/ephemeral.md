---
applyTo: "ephemeral/**/*.xs"
---

# Ephemeral Environments

Temporary Xano workspaces for testing and one-off operations.

## Quick Reference

| Type | Purpose | Lifecycle |
|------|---------|-----------|
| **Service** | Temporary workspace with DB/APIs | Runs until shut down |
| **Job** | One-time operation | Executes once, then shuts down |

### Directory Structure
```
ephemeral/
├── my-service/
│   ├── workspace.xs
│   ├── tables/
│   ├── functions/
│   └── apis/
└── my-job/
    ├── workspace.xs
    ├── tables/
    └── functions/
```

---

## Ephemeral Service

A temporary workspace with database, functions, and API endpoints.

### workspace.xs
```xs
workspace my_service {
  env = {
    api_key: "test-key"
    debug: "true"
  }
}
```

### Table with Seed Data
```xs
table event {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    text name filters=trim
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
  items = [
    {"id": 1, "name": "Event 1"}
    {"id": 2, "name": "Event 2"}
  ]
}
```

### API Group
```xs
api_group events {
  canonical = "events-api"
}
```

### Endpoints
```xs
query list verb=GET {
  api_group = "events"
  stack {
    db.query event {
      return = { type: "list" }
    } as $events
  }
  response = $events
}

query add verb=POST {
  api_group = "events"
  input { text name filters=trim }
  stack {
    db.add event {
      data = { name: $input.name }
    } as $event
  }
  response = $event
}
```

---

## Ephemeral Job

One-time operation with setup and cleanup hooks.

### Reserved Functions
| Function | Purpose | Required |
|----------|---------|----------|
| `$main` | Primary logic | Yes |
| `$pre` | Setup/validation | No |
| `$post` | Cleanup/notification | No |

### Execution Order
1. `$pre` (if defined)
2. `$main`
3. `$post` (if defined)
4. Environment shuts down

### $main Function
```xs
function "$main" {
  input {
    json args                   // Runtime arguments
    json pre                    // Result from $pre
  }
  stack {
    db.query authors {
      return = { type: "count" }
    } as $count

    precondition ($count > 0) {
      error = "No authors found"
    }

    db.add authors {
      data = { name: "New Author" }
    }
  }
  response = { processed: true }
}
```

### $pre Function (optional)
```xs
function "$pre" {
  input { json args }
  stack {
    // Validation or setup
    precondition ($input.args.required_field != null) {
      error = "Missing required field"
    }
  }
  response = { validated: true }
}
```

### $post Function (optional)
```xs
function "$post" {
  input {
    json args
    json pre
    json main
  }
  stack {
    // Send notification or cleanup
    api.request {
      url = $env.WEBHOOK_URL
      method = "POST"
      params = {
        status: "complete",
        result: $input.main
      }
    }
  }
  response = null
}
```

---

## Complete Service Example

```
ephemeral/event-tracker/
├── workspace.xs
├── tables/
│   └── event.xs
└── apis/
    ├── api_group.xs
    ├── list.xs
    ├── add.xs
    └── clear.xs
```

### workspace.xs
```xs
workspace event_tracker {
  env = { api_key: "test" }
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

## Complete Job Example

```
ephemeral/data-migration/
├── workspace.xs
├── tables/
│   └── users.xs
└── functions/
    ├── $main.xs
    └── $post.xs
```

### workspace.xs
```xs
workspace data_migration {
  env = { webhook_url: "https://webhook.site/xxx" }
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

### functions/$main.xs
```xs
function "$main" {
  input { json args, json pre }
  stack {
    db.query users {
      where = $db.users.migrated_at == null
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

### functions/$post.xs
```xs
function "$post" {
  input { json args, json pre, json main }
  stack {
    api.request {
      url = $env.webhook_url
      method = "POST"
      params = { result: $input.main }
    }
  }
  response = null
}
```

---

## Deploying

### Deploy Service
```
publish_ephemeral_service name="my-api" directory="ephemeral/my-service" mode="service"
```

### Run Job
```
publish_ephemeral_service name="migration" directory="ephemeral/my-job" mode="job"
```

---

## Best Practices

1. **Keep isolated** - Self-contained with own tables/functions
2. **Seed test data** - Use `items` in table definitions
3. **Handle cleanup** - Use `$post` for notifications/cleanup
4. **Validate in $pre** - Check preconditions before main logic
5. **Name clearly** - Indicate purpose: `auth-test`, `data-migration`
