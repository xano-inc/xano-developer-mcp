---
applyTo: "*/trigger/**/*.xs"
---

# Triggers

Event-driven handlers that execute in response to system events. Triggers allow you to react to database changes, real-time messages, workspace events, agent connections, and MCP server tool calls.

> **TL;DR:** Triggers respond to events. Types: `table_trigger` (CRUD events), `realtime_trigger` (channel events), `workspace_trigger` (branch events), `agent_trigger` (AI events), `mcp_server_trigger` (MCP events). Each has predefined input blocks.

## Section Index

| Section | Contents |
|---------|----------|
| [Quick Reference](#quick-reference) | Trigger types summary |
| [Predefined Input Blocks](#predefined-input-blocks) | All input schemas (reference once) |
| [Table Trigger](#table-trigger) | Database CRUD event handlers |
| [Realtime Trigger](#realtime-trigger) | Channel event handlers |
| [Workspace Trigger](#workspace-trigger) | Branch lifecycle event handlers |
| [Agent Trigger](#agent-trigger) | AI agent event handlers |
| [MCP Server Trigger](#mcp-server-trigger) | MCP tool call handlers |
| [Common Patterns](#common-patterns) | Error handling, conditional logic |
| [Best Practices](#best-practices) | Guidelines for trigger development |

## Quick Reference

| Trigger Type | Purpose | Required Clauses |
|--------------|---------|------------------|
| `table_trigger` | React to database table changes | `table`, `input`, `stack` |
| `realtime_trigger` | Handle real-time channel events | `channel`, `input`, `stack`, `response` |
| `workspace_trigger` | React to branch lifecycle events | `input`, `stack` |
| `agent_trigger` | Handle AI agent connections | `agent`, `input`, `stack`, `response` |
| `mcp_server_trigger` | Handle MCP server tool calls | `mcp_server`, `input`, `stack`, `response` |

---

## Predefined Input Blocks

Each trigger type has a **predefined read-only input block**. These input structures are automatically provided by the system and **cannot be modified**. When creating a trigger, use the predefined input block as-is.

### Table Trigger Input

```xs
input {
  json new
  json old
  enum action {
    values = ["insert", "update", "delete", "truncate"]
  }

  text datasource
}
```

| Field | Type | Description |
|-------|------|-------------|
| `new` | json | The new record data (after insert/update) |
| `old` | json | The old record data (before update/delete) |
| `action` | enum | The action that triggered: `insert`, `update`, `delete`, or `truncate` |
| `datasource` | text | The datasource name where the change occurred |

### Agent Trigger Input / MCP Server Trigger Input

Agent triggers and MCP server triggers share the same input schema:

```xs
input {
  object toolset {
    schema {
      int id
      text name
      text instructions
    }
  }

  object[] tools {
    schema {
      int id
      text name
      text instructions
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `toolset` | object | The toolset configuration with id, name, and instructions |
| `tools` | object[] | Array of available tools with their id, name, and instructions |

### Workspace Trigger Input

```xs
input {
  object to_branch {
    schema {
      int id
      text label
    }
  }

  object from_branch {
    schema {
      int id
      text label
    }
  }

  enum action {
    values = ["branch_live", "branch_merge", "branch_new"]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `to_branch` | object | The target branch with id and label |
| `from_branch` | object | The source branch with id and label |
| `action` | enum | The branch action: `branch_live`, `branch_merge`, or `branch_new` |

### Realtime Trigger Input

```xs
input {
  enum action {
    values = ["message", "join"]
  }

  text channel
  object client {
    schema {
      json extras
      object permissions {
        schema {
          int dbo_id
          text row_id
        }
      }
    }
  }

  object options {
    schema {
      bool authenticated
      text channel
    }
  }

  json payload
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | enum | The event type: `message` or `join` |
| `channel` | text | The channel name |
| `client` | object | Client information including extras and permissions |
| `options` | object | Channel options including authentication status |
| `payload` | json | The message payload data |

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

  // Uses predefined Table Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Logic to execute when triggered
  }

  history = 100
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `table` | The database table name to monitor |
| `input` | Predefined input block (read-only) |
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

  // Uses predefined Table Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Access input fields: $input.new, $input.old, $input.action, $input.datasource
    db.add "audit_log" {
      data = {
        table_name: "user",
        action: $input.action,
        old_data: $input.old,
        new_data: $input.new,
        datasource: $input.datasource,
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

  // Uses predefined Realtime Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Logic to execute when triggered
  }

  response = $result

  history = 100
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `channel` | The real-time channel to monitor |
| `input` | Predefined input block (read-only) |
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

  // Uses predefined Realtime Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Access input fields: $input.action, $input.channel, $input.client, $input.options, $input.payload
    conditional {
      if ($input.action == "join") {
        var $welcome { value = "Welcome to the chat!" }
      }
      else {
        db.add "chat_message" {
          data = {
            channel: $input.channel,
            user_id: $auth.id,
            message: $input.payload.message,
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

  // Uses predefined Workspace Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Logic to execute when triggered
  }

  history = 100
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `input` | Predefined input block (read-only) |
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

  // Uses predefined Workspace Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Access input fields: $input.to_branch, $input.from_branch, $input.action
    util.send_email {
      service_provider = "resend"
      api_key = $env.RESEND_API_KEY
      to = "team@example.com"
      from = "system@example.com"
      subject = "Branch Event: " ~ $input.action
      message = "Branch '" ~ $input.from_branch.label ~ "' -> '" ~ $input.to_branch.label ~ "' event: " ~ $input.action
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

  // Uses predefined Agent Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Logic to execute when triggered
  }

  response = $result

  history = "inherit"
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `agent` | The AI agent name this trigger handles |
| `input` | Predefined input block (read-only) |
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

  // Uses predefined Agent Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Access input fields: $input.toolset, $input.tools
    var $context {
      value = {
        toolset_name: $input.toolset.name,
        toolset_instructions: $input.toolset.instructions,
        available_tools: $input.tools
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

  // Uses predefined MCP Server Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Logic to execute when triggered
  }

  response = $result

  history = false
}
```

### Required Clauses

| Clause | Description |
|--------|-------------|
| `mcp_server` | The MCP server name this trigger handles |
| `input` | Predefined input block (read-only) |
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

  // Uses predefined MCP Server Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    // Access input fields: $input.toolset, $input.tools
    var $result {
      value = {
        server: $input.toolset.name,
        instructions: $input.toolset.instructions,
        tool_count: count($input.tools)
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

  // Uses predefined Table Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    try_catch {
      try {
        db.add "audit_log" {
          data = {
            action: $input.action,
            new_data: $input.new,
            old_data: $input.old,
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

  // Uses predefined Table Trigger Input - see Predefined Input Blocks section
  input { ... }

  stack {
    conditional {
      if ($input.new.total > 1000) {
        util.send_email {
          service_provider = "resend"
          api_key = $env.RESEND_API_KEY
          to = "sales@example.com"
          from = "system@example.com"
          subject = "High Value Order"
          message = "Order #" ~ $input.new.id ~ " for $" ~ $input.new.total
        }
      }
    }
  }
}
```

---

## Best Practices

1. **Use predefined input blocks as-is** - Each trigger type has a read-only input block that cannot be modified; use the exact structure provided
2. **Use descriptive names** - Indicate the event and action: `user_audit_log`, `chat_message_handler`
3. **Handle errors gracefully** - Use try_catch to prevent trigger failures from affecting the main operation
4. **Keep triggers lightweight** - Offload heavy processing to functions or tasks
5. **Set appropriate history** - Use `history = false` for high-frequency triggers to save storage
6. **Use tags** - Organize triggers with meaningful tags for easier management
7. **Document with description** - Always provide a description explaining the trigger's purpose
8. **Test thoroughly** - Triggers execute automatically, so ensure they handle edge cases

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `tables` | Table definitions that triggers respond to |
| `functions` | Reusable logic called from triggers |
| `agents` | Agent triggers for AI events |
| `mcp-servers` | MCP server triggers |
| `realtime` | Real-time channel configuration |
