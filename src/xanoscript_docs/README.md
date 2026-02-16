# XanoScript Documentation

XanoScript is the declarative scripting language for [Xano](https://xano.com), a no-code/low-code backend platform. Use it to define database schemas, API endpoints, functions, scheduled tasks, and AI agents.

## Quick Reference

| Construct           | File Location                        | Purpose                       |
| ------------------- | ------------------------------------ | ----------------------------- |
| `workspace`         | `workspace/{name}.xs`                | Workspace-level configuration |
| `workspace_trigger` | `workspace/trigger/{name}.xs`        | Workspace event handlers      |
| `table`             | `table/{name}.xs`                    | Database schema definition    |
| `table_trigger`     | `table/trigger/{name}.xs`            | Table event handlers          |
| `api_group`         | `api/{group}/api_group.xs`           | API group definition          |
| `query`             | `api/{group}/{endpoint}_{verb}.xs`   | HTTP API endpoints            |
| `function`          | `function/{name}.xs`                 | Reusable logic blocks         |
| `task`              | `task/{name}.xs`                     | Scheduled/cron jobs           |
| `agent`             | `agent/{name}.xs`                    | AI-powered agents             |
| `agent_trigger`     | `agent/trigger/{name}.xs`            | Agent event handlers          |
| `tool`              | `tool/{name}.xs`                     | Tools for AI agents           |
| `mcp_server`        | `mcp_server/{name}.xs`               | MCP server definitions        |
| `mcp_server_trigger`| `mcp_server/trigger/{name}.xs`       | MCP server event handlers     |
| `addon`             | `addon/{name}.xs`                    | Subqueries for related data   |
| `middleware`        | `middleware/{name}.xs`               | Request/response interceptors |
| `branch`            | `branch.xs`                          | Branch-level configuration    |
| `realtime_channel`  | Configuration                        | Realtime channel settings     |

**Naming convention:** All folder and file names use `snake_case` (e.g., `user_profile.xs`, `get_all_users_get.xs`).

**Important:** Each `.xs` file must contain exactly one definition. You cannot define multiple tables, functions, queries, or other constructs in a single file.

## Workspace Structure

After pulling from Xano, files are organized using `snake_case` naming:

```
project/
├── branch.xs                        # Branch configuration
├── workspace/
│   ├── my_workspace.xs              # Workspace configuration
│   └── trigger/
│       └── on_deploy.xs             # Workspace triggers
├── api/
│   └── users/                       # API group folder
│       ├── api_group.xs             # API group definition
│       ├── get_all_get.xs           # GET /users
│       ├── get_one_get.xs           # GET /users/:id
│       ├── create_post.xs           # POST /users
│       └── nested/
│           └── profile_get.xs       # Nested endpoint: GET /users/nested/profile
├── function/
│   └── validate_token.xs            # Reusable functions
├── task/
│   └── daily_cleanup.xs             # Scheduled jobs
├── table/
│   ├── users.xs                     # Table schema
│   └── trigger/
│       └── on_user_create.xs        # Table triggers
├── agent/
│   ├── support_bot.xs               # AI agents
│   └── trigger/
│       └── on_message.xs            # Agent triggers
├── tool/
│   └── search_docs.xs               # AI tools
├── mcp_server/
│   ├── my_server.xs                 # MCP server definitions
│   └── trigger/
│       └── on_connect.xs            # MCP server triggers
├── middleware/
│   └── auth_check.xs                # Request/response interceptors
├── addon/
│   └── user_posts.xs                # Query addons
├── static/                          # Frontend files (HTML, CSS, JS)
└── run/                             # Job and service configurations
```

**Key conventions:**
- All folders and files use `snake_case` naming
- API endpoints include the HTTP verb suffix (e.g., `create_post.xs`, `get_one_get.xs`)
- Triggers are nested under `{type}/trigger/` folders
- Nested API paths become nested folders (e.g., `/users/nested/profile` → `api/users/nested/profile_get.xs`)

## Environment Variables

Access with `$env.<name>`. Common built-in variables include `$env.$remote_ip`, `$env.$http_headers`, `$env.$request_method`, `$env.$datasource`, and `$env.$branch`. Custom environment variables are set in the Xano dashboard and accessed as `$env.MY_VAR`.

For the complete list of system variables, see `xanoscript_docs({ topic: "syntax" })`.

## Core Syntax Patterns

### Block Structure

```xs
<construct> "<name>" {
  input { ... }      // Parameters (optional)
  stack { ... }      // Logic
  response = $var    // Output
}
```

### Variable Access

```xs
$input.field        // Input parameters
$var.field          // Stack variables
$auth.id            // Authenticated user ID
$env.MY_VAR         // Environment variable
$db.table.field     // Database field reference (in queries)
$this               // Current item in loops/maps
```

**Reserved Variables:** The following cannot be used as variable names: `$response`, `$output`, `$input`, `$auth`, `$env`, `$db`, `$this`, `$result`.

### Type Names

XanoScript uses specific type names:

| Type | Description | Example |
|------|-------------|---------|
| `text` | String (not "string") | `text name` |
| `int` | Integer (not "integer") | `int count` |
| `bool` | Boolean (not "boolean") | `bool active` |
| `decimal` | Float/number | `decimal price` |
| `type[]` | Array (not "array" or "list") | `text[] tags` |
| `json` | Arbitrary JSON data | `json metadata` |

### Comments

```xs
// Single-line comment
var $total {
  value = 0
}
```

**Note:** XanoScript only supports `//` for comments. Other comment styles like `#` are not supported.

### Filters (Pipe Syntax)

```xs
$value|trim|lower                    // Chain filters
$input.name|strlen                   // Get length
$array|first                         // First element
($a + $b)|round:2                    // Math with precision
```

## File Frontmatter

Documentation files use frontmatter to specify which file patterns they apply to:

```markdown
---
applyTo: "function/**/*.xs"
---
```

This helps AI tools apply the correct documentation based on the file being edited.

## Getting Started

For common patterns and quick examples, use:
```
xanoscript_docs({ topic: "quickstart" })
```

This includes:
- Variable declaration patterns
- Conditional logic (if/elseif/else)
- API requests with error handling
- Database CRUD operations
- Common mistakes to avoid

---

## Documentation Index

Use `xanoscript_docs({ topic: "<topic>" })` to retrieve documentation.

### Core Language

| Topic        | Description                                          | Key Sections |
| ------------ | ---------------------------------------------------- | ------------ |
| `quickstart` | Common patterns, quick examples, mistakes to avoid   | Patterns, Common Mistakes |
| `syntax`     | Expressions, operators, filters, system variables    | Filters (L179-275), Error Handling (L411-477) |
| `types`      | Data types, validation, input blocks                 | Validation Filters, Input Blocks |
| `functions`  | Reusable function stacks, async, loops               | Loops, Async Patterns |
| `schema`     | Runtime schema parsing and validation                | parse.object, parse.array |

### Data

| Topic       | Description                                                | Key Sections |
| ----------- | ---------------------------------------------------------- | ------------ |
| `tables`    | Database schema definitions with indexes and relationships | Indexes, Foreign Keys |
| `database`  | All db.\* operations: query, get, add, edit, patch, delete | Decision Tree (L11), Bulk Ops (L450-529) |
| `addons`    | Reusable subqueries for fetching related data              | Usage Patterns |
| `streaming` | Streaming data from files, requests, and responses         | File Streams, API Streams |

### APIs & Endpoints

| Topic      | Description                                                     | Key Sections |
| ---------- | --------------------------------------------------------------- | ------------ |
| `apis`     | HTTP endpoint definitions with authentication and CRUD patterns | Decision Tree (L9), CRUD Examples (L220-350) |
| `tasks`    | Scheduled and cron jobs                                         | Cron Syntax, Input Handling |
| `triggers` | Event-driven handlers (table, realtime, workspace, agent, MCP)  | Predefined Inputs, Event Types |
| `realtime` | Real-time channels and events for push updates                  | Channels, Events |

### AI & Agents

| Topic         | Description                                         | Key Sections |
| ------------- | --------------------------------------------------- | ------------ |
| `agents`      | AI agent configuration with LLM providers and tools | LLM Config, Tool Binding |
| `tools`       | AI tools for agents and MCP servers                 | Tool Schema, Parameters |
| `mcp-servers` | MCP server definitions exposing tools               | Server Config, Tool Exposure |

### Integrations

| Topic          | Description                                       | Sub-topics |
| -------------- | ------------------------------------------------- | ---------- |
| `integrations` | Cloud storage, Redis, security, and external APIs | cloud-storage, search, redis, external-apis, utilities |

### Configuration

| Topic        | Description                                                            | Key Sections |
| ------------ | ---------------------------------------------------------------------- | ------------ |
| `workspace`  | Workspace-level settings: environment variables, preferences, realtime | Env Variables, Preferences |
| `branch`     | Branch-level settings: middleware, history retention, visual styling   | Middleware Config, History |
| `middleware` | Request/response interceptors for functions, queries, tasks, and tools | Pre/Post Hooks |

### Development

| Topic       | Description                                                | Key Sections |
| ----------- | ---------------------------------------------------------- | ------------ |
| `testing`   | Unit tests, mocks, and assertions                          | Test Syntax, Assertions |
| `debugging` | Logging, inspecting, and debugging XanoScript execution    | debug.log, Inspection |
| `frontend`  | Static frontend development and deployment                 | File Structure |
| `run`       | Run job and service configurations for the Xano Job Runner | Jobs, Services |

### Best Practices

| Topic         | Description                                                  | Key Sections |
| ------------- | ------------------------------------------------------------ | ------------ |
| `performance` | Performance optimization best practices                      | Caching, Query Optimization |
| `security`    | Security best practices for authentication and authorization | Auth Patterns, Token Handling |

---

## Example Implementations

Common integration patterns you can reference:

### External API Integrations
- **OpenAI/ChatGPT**: Use `api.request` with POST to `/v1/chat/completions`
- **Stripe**: Use `api.request` with form-encoded params for payments
- **SendGrid/Resend**: Use `api.request` or `util.send_email` for emails
- **Slack/Discord**: Use `api.request` with webhook URLs
- **Twilio**: Use `api.request` with Basic auth for SMS

### Common Pattern: API Integration Function

```xs
function "call_external_api" {
  input {
    text endpoint
    object payload
  }
  stack {
    api.request {
      url = $env.API_BASE_URL ~ $input.endpoint
      method = "POST"
      params = $input.payload
      headers = [
        "Content-Type: application/json",
        "Authorization: Bearer " ~ $env.API_KEY
      ]
      timeout = 30
    } as $api_result

    precondition ($api_result.response.status >= 200 && $api_result.response.status < 300) {
      error_type = "standard"
      error = "API error: " ~ ($api_result.response.status|to_text)
    }
  }
  response = $api_result.response.result
}
```

For more patterns, see `xanoscript_docs({ topic: "quickstart" })` or `xanoscript_docs({ topic: "integrations" })`.
