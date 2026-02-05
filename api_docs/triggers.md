# Triggers API

Triggers are event-driven functions that execute automatically in response to specific events.

## Trigger Types

| Type | Description |
|------|-------------|
| Table Triggers | Respond to database events (insert, update, delete) |
| Workspace Triggers | Respond to branch events (merge, set live, create) |
| Agent Triggers | Extend agent functionality with custom hooks |
| MCP Server Triggers | Extend MCP server functionality |
| Realtime Triggers | Respond to realtime channel events |

---

# Table Triggers

Execute code when database records are created, updated, or deleted.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/table/trigger` | List triggers |
| GET | `/workspace/{workspace_id}/table/trigger/{trigger_id}` | Get trigger |
| POST | `/workspace/{workspace_id}/table/trigger` | Create trigger |
| PUT | `/workspace/{workspace_id}/table/trigger/{trigger_id}` | Update trigger |
| DELETE | `/workspace/{workspace_id}/table/trigger/{trigger_id}` | Delete trigger |
| PUT | `/workspace/{workspace_id}/table/trigger/{trigger_id}/security` | Update security |

## XanoScript Syntax

```xanoscript
table_trigger foo {
  table = "user"
  input {
    json new
    json old
    enum action {
      values = ["insert", "update", "delete", "truncate"]
    }
    text datasource
  }

  stack {
    var $x1 {
      value = $input.score + 1
    }
  }

  actions = {insert: true, update: true}
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `table` | text | Name of the table to watch |
| `actions` | object | Which events trigger execution |

### Available Actions

| Action | Description |
|--------|-------------|
| `insert` | New record created |
| `update` | Record modified |
| `delete` | Record deleted |
| `truncate` | Table truncated |

### Input Variables

The trigger receives these inputs automatically:

| Variable | Description |
|----------|-------------|
| `$input.new` | New record data (insert/update) |
| `$input.old` | Previous record data (update/delete) |
| `$input.action` | The action type |
| `$input.datasource` | The datasource that triggered the event |

### Example: Audit Log Trigger

```xanoscript
table_trigger user_audit {
  table = "user"
  input {
    json new
    json old
    enum action { values = ["insert", "update", "delete", "truncate"] }
    text datasource
  }

  stack {
    db.insert audit_log {
      data = {
        table: "user",
        action: $input.action,
        old_data: $input.old,
        new_data: $input.new,
        timestamp: now()
      }
    }
  }

  actions = {insert: true, update: true, delete: true}
}
```

---

# Workspace Triggers

Execute code when workspace branch events occur.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/trigger` | List triggers |
| GET | `/workspace/{workspace_id}/trigger/{trigger_id}` | Get trigger |
| POST | `/workspace/{workspace_id}/trigger` | Create trigger |
| PUT | `/workspace/{workspace_id}/trigger/{trigger_id}` | Update trigger |
| DELETE | `/workspace/{workspace_id}/trigger/{trigger_id}` | Delete trigger |

## XanoScript Syntax

```xanoscript
workspace_trigger foo {
  input {
    object to_branch? {
      schema {
        int id?
        text label? filters=trim
      }
    }
    object from_branch? {
      schema {
        int id?
        text label? filters=trim
      }
    }
    enum action {
      values = ["branch_live", "branch_merge", "branch_new"]
    }
  }

  stack {
    // Your logic here
  }

  actions = {branch_live: true, branch_merge: true, branch_new: true}
}
```

### Available Actions

| Action | Description |
|--------|-------------|
| `branch_live` | Branch set as live |
| `branch_merge` | Branches merged |
| `branch_new` | New branch created |

---

# Agent Triggers

Extend agent functionality with custom hooks.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/agent/trigger` | List triggers |
| GET | `/workspace/{workspace_id}/agent/trigger/{trigger_id}` | Get trigger |
| POST | `/workspace/{workspace_id}/agent/trigger` | Create trigger |
| PUT | `/workspace/{workspace_id}/agent/trigger/{trigger_id}` | Update trigger |
| DELETE | `/workspace/{workspace_id}/agent/trigger/{trigger_id}` | Delete trigger |

## XanoScript Syntax

```xanoscript
agent_trigger foo {
  agent = "my_agent"
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

  stack {
    var $x1 { value = 123 }
  }

  actions = {connection: true}
}
```

---

# MCP Server Triggers

Extend MCP server functionality.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/mcp_server/trigger` | List triggers |
| GET | `/workspace/{workspace_id}/mcp_server/trigger/{trigger_id}` | Get trigger |
| POST | `/workspace/{workspace_id}/mcp_server/trigger` | Create trigger |
| PUT | `/workspace/{workspace_id}/mcp_server/trigger/{trigger_id}` | Update trigger |
| DELETE | `/workspace/{workspace_id}/mcp_server/trigger/{trigger_id}` | Delete trigger |

## XanoScript Syntax

```xanoscript
mcp_server_trigger foo {
  mcp_server = "my_server"
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

  stack {
    var $x1 { value = 123 }
  }

  actions = {connection: true}
}
```

---

# Realtime Triggers

Execute code when realtime channel events occur.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/realtime/channel/trigger` | List triggers |
| GET | `/workspace/{workspace_id}/realtime/channel/trigger/{trigger_id}` | Get trigger |
| POST | `/workspace/{workspace_id}/realtime/channel/trigger` | Create trigger |
| PUT | `/workspace/{workspace_id}/realtime/channel/trigger/{trigger_id}` | Update trigger |
| DELETE | `/workspace/{workspace_id}/realtime/channel/trigger/{trigger_id}` | Delete trigger |

## XanoScript Syntax

```xanoscript
realtime_trigger foo {
  channel = "my_channel"
  input {
    enum action { values = ["message", "join"] }
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

  stack {
    var $x1 { value = 123 }
  }

  actions = {connection: true}
}
```

### Available Actions

| Action | Description |
|--------|-------------|
| `connection` | Client connects |
| `message` | Message received |
| `join` | Client joins channel |

---

# Workflow Tests

Automated tests for your workflows.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/workflow_test` | List tests |
| GET | `/workspace/{workspace_id}/workflow_test/{workflow_test_id}` | Get test |
| POST | `/workspace/{workspace_id}/workflow_test` | Create test |
| PUT | `/workspace/{workspace_id}/workflow_test/{workflow_test_id}` | Update test |
| DELETE | `/workspace/{workspace_id}/workflow_test/{workflow_test_id}` | Delete test |
| PUT | `/workspace/{workspace_id}/workflow_test/{workflow_test_id}/security` | Update security |

## XanoScript Syntax

```xanoscript
workflow_test foo {
  stack {
    var $x1 {
      value = 1 + 2 + 3
    }
  }
}
```
