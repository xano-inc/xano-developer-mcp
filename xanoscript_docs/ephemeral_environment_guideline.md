# Ephemeral Services and Jobs in XanoScript

Ephemeral services and jobs allow you to run experiments in isolated Xano environments without impacting your main workspace. They are useful for testing, prototyping, and running one-off data operations.

## Overview

| Type                  | Description                                                                | Lifecycle                                  |
| --------------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| **Ephemeral Service** | Creates a temporary Xano workspace with database, functions, and endpoints | Stays running until manually shut down     |
| **Ephemeral Job**     | Runs a one-time operation in an isolated environment                       | Executes once and automatically shuts down |

## Directory Structure

Ephemeral services and jobs should be organized in the `ephemeral/` directory:

```
ephemeral/
├── my-service/
│   ├── workspace.xs      # Workspace configuration
│   ├── tables/           # Database tables
│   ├── functions/        # Custom functions
│   └── apis/             # API endpoints
└── my-job/
    ├── workspace.xs
    ├── tables/
    └── functions/
```

## Creating an Ephemeral Service

An ephemeral service creates a fully functional Xano workspace with its own database, API endpoints, and functions. Each file in the service directory defines a different component.

### Workspace Configuration

Every ephemeral service must have a `workspace.xs` file that defines the workspace name and environment variables:

```xs
workspace test {
  env = {
    api_key: "test"
    phrase: "hello"
  }
}
```

### Defining Tables

Tables define your database schema. Include the `items` property to seed initial data:

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
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  items = [
  ]
}
```

### Defining API Groups and Endpoints

Create an API group to organize your endpoints:

```xs
// api group comment
api_group test {
  canonical = "abc123"
}
```

Then define your API endpoints:

```xs
query count verb=GET {
  api_group = "test"
  input {
  }

  stack {
    db.query event {
      return = {type: "count"}
    } as $cnt
  }

  response = $cnt
}
```

```xs
query add verb=GET {
  api_group = "test"
  input {
  }

  stack {
    db.add event {
      data = {name: ""|uuid}
    }
  }

  response = null
}
```

```xs
query clear verb=GET {
  api_group = "test"
  input {
  }

  stack {
    db.truncate event
  }

  response = null
}
```

### Defining Functions

Functions can be called by your endpoints or other functions:

```xs
function my_helper {
  input {
    json args
  }

  stack {
    // Your logic here
  }

  response = null
}
```

## Creating an Ephemeral Job

An ephemeral job runs once and then shuts down. Jobs use special reserved function names to control execution flow:

| Function | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| `$main`  | **Required.** The primary entry point that executes the job logic |
| `$pre`   | Optional. Runs before `$main`, useful for setup or validation     |
| `$post`  | Optional. Runs after `$main`, useful for cleanup or notifications |

### Job Lifecycle

1. `$pre` function executes (if defined)
2. `$main` function executes
3. `$post` function executes (if defined)
4. Environment shuts down automatically

### Example Job Structure

**Workspace configuration:**

```xs
workspace test {
  env = {
    api_key: "test"
    phrase: "hello"
  }
}
```

**Table with seeded data:**

```xs
table authors {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text name? filters=trim
    text desc? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  items = [
    {"id":1,"created_at":1761410450342,"name":"Kathryn Watson","desc":"aa"}
    {"id":2,"created_at":1761410450344,"name":"Martha Torres","desc":"aa"}
    {"id":3,"created_at":1761410450345,"name":"Raymond Rivera","desc":"aa"}
    {"id":4,"created_at":1761410450345,"name":"Judith Morales","desc":"aa"}
    {"id":5,"created_at":1761410450346,"name":"Philip Shaw","desc":"aa"}
  ]
}
```

**Main entry point:**

```xs
function "$main" {
  input {
    json args
    json pre
  }

  stack {
    db.add authors {
      data = {name: "test"}
    }

    db.query authors {
      return = {type: "count"}
    } as $cnt

    precondition ($cnt == 6) {
      error = "Author count check failed"
    }
  }

  response = $cnt
}
```

**Pre-execution hook (optional):**

```xs
function "$pre" {
  input {
    json args
  }

  stack {
    // Setup logic, validation, etc.
  }

  response = null
}
```

**Post-execution hook (optional):**

```xs
function "$post" {
  input {
    json args
    json pre
    json main
  }

  stack {
    // Send notification, cleanup, etc.
    api.request {
      url = "https://webhook.site/your-webhook-id"
      params = {
        service: true
        pre: $input.pre
        main: $input.main
      }
    }
  }

  response = null
}
```

**Helper functions:**

```xs
function loop {
  input {
    int cnt
  }

  stack {
    var $total {
      value = $input.cnt
    }

    var $x1 {
      value = 0
    }

    for ($total) {
      each as $index {
        math.add $x1 {
          value = 1
        }
      }
    }
  }

  response = $x1
}
```

## Complete Ephemeral Service Example

Here's a complete ephemeral service with a database, API group, and endpoints:

**`ephemeral/event-tracker/workspace.xs`:**

```xs
workspace event_tracker {
  env = {
    api_key: "test-key"
  }
}
```

**`ephemeral/event-tracker/tables/event.xs`:**

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
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  items = []
}
```

**`ephemeral/event-tracker/apis/api_group.xs`:**

```xs
api_group events {
  canonical = "events-api"
}
```

**`ephemeral/event-tracker/apis/count.xs`:**

```xs
query count verb=GET {
  api_group = "events"
  input {}

  stack {
    db.query event {
      return = {type: "count"}
    } as $cnt
  }

  response = $cnt
}
```

**`ephemeral/event-tracker/apis/add.xs`:**

```xs
query add verb=POST {
  api_group = "events"
  input {
    text name filters=trim
  }

  stack {
    db.add event {
      data = {name: $input.name}
    } as $new_event
  }

  response = $new_event
}
```

**`ephemeral/event-tracker/apis/clear.xs`:**

```xs
query clear verb=DELETE {
  api_group = "events"
  input {}

  stack {
    db.truncate event
  }

  response = null
}
```

## Complete Ephemeral Job Example

Here's a complete ephemeral job that seeds and validates data:

**`ephemeral/data-validation/workspace.xs`:**

```xs
workspace data_validation {
  env = {
    webhook_url: "https://webhook.site/your-id"
  }
}
```

**`ephemeral/data-validation/tables/authors.xs`:**

```xs
table authors {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text name? filters=trim
    text desc? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  items = [
    {"id":1,"created_at":1761410450342,"name":"Kathryn Watson","desc":"aa"}
    {"id":2,"created_at":1761410450344,"name":"Martha Torres","desc":"aa"}
    {"id":3,"created_at":1761410450345,"name":"Raymond Rivera","desc":"aa"}
  ]
}
```

**`ephemeral/data-validation/functions/$main.xs`:**

```xs
function "$main" {
  input {
    json args
    json pre
  }

  stack {
    db.add authors {
      data = {name: "New Author"}
    }

    db.query authors {
      return = {type: "count"}
    } as $cnt

    precondition ($cnt == 4) {
      error = "Expected 4 authors after insert"
    }
  }

  response = $cnt
}
```

**`ephemeral/data-validation/functions/$post.xs`:**

```xs
function "$post" {
  input {
    json args
    json pre
    json main
  }

  stack {
    api.request {
      url = $env.webhook_url
      params = {
        status: "complete"
        result: $input.main
      }
    }
  }

  response = null
}
```

## Using the Chat Tool

You can create ephemeral services and jobs directly from VS Code using the `publish_ephemeral_service` chat tool.

### Parameters

| Parameter   | Type   | Description                                               |
| ----------- | ------ | --------------------------------------------------------- |
| `name`      | string | A name for the ephemeral service or job                   |
| `directory` | string | The directory containing the XanoScript files to deploy   |
| `mode`      | enum   | Either `"service"` (stays running) or `"job"` (runs once) |

### Example Usage

To deploy a service:

```
@publish_ephemeral_service name="my-api" directory="ephemeral/my-service" mode="service"
```

To run a job:

```
@publish_ephemeral_service name="data-migration" directory="ephemeral/my-job" mode="job"
```

The tool will bundle all XanoScript files in the specified directory and deploy them according to the selected mode.

## Best Practices

1. **Keep services isolated**: Each ephemeral service should be self-contained with its own tables, functions, and endpoints.

2. **Seed test data**: Use the `items` property in table definitions to pre-populate data for testing.

3. **Use environment variables**: Store configuration values in the workspace `env` block rather than hardcoding them.

4. **Clean up after jobs**: Use the `$post` function to send notifications or perform cleanup after job execution.

5. **Validate with preconditions**: Use `precondition` statements in jobs to verify expected outcomes.

6. **Organize by purpose**: Name your ephemeral directories clearly to indicate their purpose (e.g., `ephemeral/auth-test/`, `ephemeral/data-migration/`).
