---
applyTo: "triggers/**/*.xs"
---

# Triggers

Event-driven handlers that execute in response to system events. Triggers allow you to react to database changes, real-time messages, workspace events, agent connections, and MCP server tool calls.

## Quick Reference

| Trigger Type | Purpose | Required Clauses |
|--------------|---------|------------------|
| `table_trigger` | React to database table changes | `table`, `input`, `stack` |
| `realtime_trigger` | Handle real-time channel events | `channel`, `input`, `stack`, `response` |
| `workspace_trigger` | React to branch lifecycle events | `input`, `stack` |
| `agent_trigger` | Handle AI agent connections | `agent`, `input`, `stack`, `response` |
| `mcp_server_trigger` | Handle MCP server tool calls | `mcp_server`, `input`, `stack`, `response` |

---

## Table Trigger

Executes when database table records are inserted, updated, deleted, or truncated.

### Syntax

```xs
table_trigger "<name>" {
  table = "<table_name>"
  actions = {insert: true, update: true, delete: true, truncate: false}
  datasources = ["datasource1", "datasource2"]
  active = true
  description = "Description of this trigger"
  tags = ["tag1", "tag2"]

  input {
    # Define input parameters
  }

  stack {
    # Logic to execute when triggered
  }

  history = 100
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `table` | The database table name to monitor |
| `input` | Input parameter definitions |
| `stack` | Logic to execute when triggered |

### Optional Clauses

| Clause | Type | Description |
|--------|------|-------------|
| `actions` | object | Which operations trigger execution |
| `active` | boolean | Enable/disable the trigger |
| `datasources` | array | List of datasources to apply trigger to |
| `description` | string | Human-readable description |
| `history` | integer/string | History retention setting |
| `tags` | array | Tags for organization |

### Actions

| Action | Description |
|--------|-------------|
| `insert` | Trigger on new record creation |
| `update` | Trigger on record modification |
| `delete` | Trigger on record deletion |
| `truncate` | Trigger when table is truncated |

### Example

```xs
table_trigger "audit_user_changes" {
  table = "user"
  actions = {insert: true, update: true, delete: true, truncate: false}
  active = true
  description = "Log all changes to user records"
  datasources = ["main_db"]

  input {
  }

  stack {
    db.add "audit_log" {
      data = {
        table_name: "user",
        action: $trigger.action,
        record_id: $trigger.record.id,
        timestamp: now
      }
    }
  }

  history = 100
}
```

---

## Realtime Trigger

Handles events from real-time channels, such as client joins or messages.

### Syntax

```xs
realtime_trigger "<name>" {
  channel = "<channel_name>"
  actions = {join: true, message: true}
  active = true
  description = "Description of this trigger"
  tags = ["tag1", "tag2"]

  input {
    # Define input parameters
  }

  stack {
    # Logic to execute when triggered
  }

  response = $result

  history = 100
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `channel` | The real-time channel to monitor |
| `input` | Input parameter definitions |
| `stack` | Logic to execute when triggered |
| `response` | Value to return to the client |

### Optional Clauses

| Clause | Type | Description |
|--------|------|-------------|
| `actions` | object | Which events trigger execution |
| `active` | boolean | Enable/disable the trigger |
| `description` | string | Human-readable description |
| `history` | integer/string | History retention setting |
| `tags` | array | Tags for organization |

### Actions

| Action | Description |
|--------|-------------|
| `join` | Trigger when a client joins the channel |
| `message` | Trigger when a message is received |

### Example

```xs
realtime_trigger "chat_message_handler" {
  channel = "chat_room"
  actions = {join: true, message: true}
  active = true
  description = "Handle chat room messages and joins"

  input {
    text message filters=trim
  }

  stack {
    conditional {
      if ($trigger.action == "join") {
        var $welcome { value = "Welcome to the chat!" }
      }
      else {
        db.add "chat_message" {
          data = {
            channel: "chat_room",
            user_id: $auth.id,
            message: $input.message,
            timestamp: now
          }
        }
        var $welcome { value = null }
      }
    }
  }

  response = {status: "ok", welcome: $welcome}

  history = false
}
```

---

## Workspace Trigger

Executes in response to workspace branch lifecycle events.

### Syntax

```xs
workspace_trigger "<name>" {
  actions = {branch_new: true, branch_merge: true, branch_live: true}
  active = true
  description = "Description of this trigger"
  tags = ["tag1", "tag2"]

  input {
    # Define input parameters
  }

  stack {
    # Logic to execute when triggered
  }

  history = 100
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `input` | Input parameter definitions |
| `stack` | Logic to execute when triggered |

### Optional Clauses

| Clause | Type | Description |
|--------|------|-------------|
| `actions` | object | Which branch events trigger execution |
| `active` | boolean | Enable/disable the trigger |
| `description` | string | Human-readable description |
| `history` | integer/string | History retention setting |
| `tags` | array | Tags for organization |

### Actions

| Action | Description |
|--------|-------------|
| `branch_new` | Trigger when a new branch is created |
| `branch_merge` | Trigger when a branch is merged |
| `branch_live` | Trigger when a branch goes live |

### Example

```xs
workspace_trigger "branch_notification" {
  actions = {branch_new: true, branch_merge: true, branch_live: true}
  active = true
  description = "Send notifications on branch events"
  tags = ["devops", "notifications"]

  input {
  }

  stack {
    util.send_email {
      service_provider = "resend"
      api_key = $env.RESEND_API_KEY
      to = "team@example.com"
      from = "system@example.com"
      subject = "Branch Event: " ~ $trigger.action
      message = "Branch '" ~ $trigger.branch_name ~ "' event: " ~ $trigger.action
    }
  }

  history = false
}
```

---

## Agent Trigger

Handles connections and interactions with AI agents.

### Syntax

```xs
agent_trigger "<name>" {
  agent = "<agent_name>"
  actions = {connection: true}
  active = true
  description = "Description of this trigger"
  docs = "Extended documentation for the trigger"
  tags = ["tag1", "tag2"]

  input {
    # Define input parameters
  }

  stack {
    # Logic to execute when triggered
  }

  response = $result

  history = "inherit"
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `agent` | The AI agent name this trigger handles |
| `input` | Input parameter definitions |
| `stack` | Logic to execute when triggered |
| `response` | Value to return |

### Optional Clauses

| Clause | Type | Description |
|--------|------|-------------|
| `actions` | object | Which agent events trigger execution |
| `active` | boolean | Enable/disable the trigger |
| `description` | string | Short description |
| `docs` | string | Extended documentation |
| `history` | integer/string/boolean | History retention setting |
| `tags` | array | Tags for organization |

### Actions

| Action | Description |
|--------|-------------|
| `connection` | Trigger on agent connection events |

### Example

```xs
agent_trigger "assistant_handler" {
  agent = "customer_assistant"
  actions = {connection: true}
  active = true
  description = "Handle customer assistant agent connections"
  docs = "This trigger initializes the customer context when the agent connects"

  input {
    text session_id filters=trim
  }

  stack {
    db.get "customer" {
      field_name = "session_id"
      field_value = $input.session_id
    } as $customer

    var $context {
      value = {
        customer_name: $customer.name,
        customer_tier: $customer.tier,
        history: $customer.support_history
      }
    }
  }

  response = $context

  history = "inherit"
}
```

---

## MCP Server Trigger

Handles tool calls from MCP (Model Context Protocol) servers.

### Syntax

```xs
mcp_server_trigger "<name>" {
  mcp_server = "<server_name>"
  actions = {connection: true}
  active = true
  description = "Description of this trigger"
  tags = ["tag1", "tag2"]

  input {
    # Define input parameters
  }

  stack {
    # Logic to execute when triggered
  }

  response = $result

  history = false
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `mcp_server` | The MCP server name this trigger handles |
| `input` | Input parameter definitions |
| `stack` | Logic to execute when triggered |
| `response` | Value to return to the MCP client |

### Optional Clauses

| Clause | Type | Description |
|--------|------|-------------|
| `actions` | object | Which MCP events trigger execution |
| `active` | boolean | Enable/disable the trigger |
| `description` | string | Human-readable description |
| `history` | integer/string/boolean | History retention setting |
| `tags` | array | Tags for organization |

### Actions

| Action | Description |
|--------|-------------|
| `connection` | Trigger on MCP connection events (required) |

### Example

```xs
mcp_server_trigger "database_tool_handler" {
  mcp_server = "database_tools"
  actions = {connection: true}
  active = true
  description = "Handle database tool calls from MCP clients"
  tags = ["mcp", "database"]

  input {
    text operation filters=trim
    object params
  }

  stack {
    conditional {
      if ($input.operation == "query") {
        db.query $input.params.table {
          where = $input.params.where
        } as $result
      }
      elseif ($input.operation == "insert") {
        db.add $input.params.table {
          data = $input.params.data
        } as $result
      }
      else {
        var $result { value = {error: "Unknown operation"} }
      }
    }
  }

  response = $result

  history = false
}
```

---

## Common Patterns

### Error Handling in Triggers

```xs
table_trigger "safe_audit" {
  table = "sensitive_data"
  actions = {insert: true, update: true, delete: true, truncate: false}

  input {
  }

  stack {
    try_catch {
      try {
        db.add "audit_log" {
          data = {
            action: $trigger.action,
            timestamp: now
          }
        }
      }
      catch {
        debug.log { value = "Audit logging failed" }
      }
    }
  }
}
```

### Conditional Trigger Logic

```xs
table_trigger "conditional_notification" {
  table = "order"
  actions = {insert: true, update: false, delete: false, truncate: false}

  input {
  }

  stack {
    conditional {
      if ($trigger.record.total > 1000) {
        util.send_email {
          service_provider = "resend"
          api_key = $env.RESEND_API_KEY
          to = "sales@example.com"
          from = "system@example.com"
          subject = "High Value Order"
          message = "Order #" ~ $trigger.record.id ~ " for $" ~ $trigger.record.total
        }
      }
    }
  }
}
```

---

## Best Practices

1. **Use descriptive names** - Indicate the event and action: `user_audit_log`, `chat_message_handler`
2. **Handle errors gracefully** - Use try_catch to prevent trigger failures from affecting the main operation
3. **Keep triggers lightweight** - Offload heavy processing to functions or tasks
4. **Set appropriate history** - Use `history = false` for high-frequency triggers to save storage
5. **Use tags** - Organize triggers with meaningful tags for easier management
6. **Document with description** - Always provide a description explaining the trigger's purpose
7. **Test thoroughly** - Triggers execute automatically, so ensure they handle edge cases
