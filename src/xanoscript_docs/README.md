# XanoScript Documentation

XanoScript is the declarative scripting language for [Xano](https://xano.com), a no-code/low-code backend platform. Use it to define database schemas, API endpoints, functions, scheduled tasks, and AI agents.

## Quick Reference

| Construct | File Location | Purpose |
|-----------|---------------|---------|
| `table` | `tables/*.xs` | Database schema definition |
| `function` | `functions/**/*.xs` | Reusable logic blocks |
| `query` | `apis/<group>/*.xs` | HTTP API endpoints |
| `task` | `tasks/*.xs` | Scheduled/cron jobs |
| `*_trigger` | `triggers/**/*.xs` | Event-driven handlers |
| `agent` | `agents/**/*.xs` | AI-powered agents |
| `tool` | `tools/**/*.xs` | Tools for AI agents |
| `mcp_server` | `mcp_servers/**/*.xs` | MCP server definitions |
| `addon` | `addons/*.xs` | Subqueries for related data |
| `middleware` | `middleware/**/*.xs` | Request/response interceptors |
| `branch` | `branch.xs` | Branch-level configuration |
| `workspace` | `workspace.xs` | Workspace-level configuration |
| `realtime_channel` | Configuration | Realtime channel settings |

**Important:** Each `.xs` file must contain exactly one definition. You cannot define multiple tables, functions, queries, or other constructs in a single file.

## Workspace Structure

```
project/
├── workspace.xs         // Workspace configuration (env vars, preferences)
├── branch.xs            // Branch configuration (middleware, history)
├── tables/              // Database table schemas
├── functions/           // Reusable functions (supports subfolders)
├── apis/
│   └── <api-group>/     // API endpoints grouped by domain
├── tasks/               // Scheduled jobs
├── triggers/            // Event-driven handlers
├── agents/              // AI agents
├── tools/               // AI tools
├── mcp_servers/         // MCP server definitions
├── middleware/          // Request/response interceptors
├── addons/              // Query addons
├── static/              // Frontend files (HTML, CSS, JS)
└── run/                 // Job and service configurations
```

## Environment Variables

Access with `$env.<name>`. Built-in variables:

| Variable | Description |
|----------|-------------|
| `$env.$remote_ip` | Client IP address |
| `$env.$http_headers` | Request headers array |
| `$env.$request_uri` | Request URI |
| `$env.$request_method` | HTTP method (GET, POST, etc.) |
| `$env.$request_querystring` | Query string |
| `$env.$datasource` | Current datasource |
| `$env.$branch` | Current branch |

Custom environment variables are set in the Xano dashboard and accessed as `$env.MY_VAR`.

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

**Note:** `$response` is a reserved word and cannot be used as a variable name.

### Comments
```xs
// Single-line comment
var $total { value = 0 }  // Inline comment
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
applyTo: "functions/**/*.xs"
---
```

This helps AI tools apply the correct documentation based on the file being edited.

## Documentation Index

Use `xanoscript_docs({ topic: "<topic>" })` to retrieve documentation.

### Core Language
| Topic | Description |
|-------|-------------|
| `syntax` | Expressions, operators, filters, system variables |
| `types` | Data types, validation, input blocks |
| `functions` | Reusable function stacks, async, loops |
| `schema` | Runtime schema parsing and validation |

### Data
| Topic | Description |
|-------|-------------|
| `tables` | Database schema definitions with indexes and relationships |
| `database` | All db.* operations: query, get, add, edit, patch, delete |
| `addons` | Reusable subqueries for fetching related data |
| `streaming` | Streaming data from files, requests, and responses |

### APIs & Endpoints
| Topic | Description |
|-------|-------------|
| `apis` | HTTP endpoint definitions with authentication and CRUD patterns |
| `tasks` | Scheduled and cron jobs |
| `triggers` | Event-driven handlers (table, realtime, workspace, agent, MCP) |
| `realtime` | Real-time channels and events for push updates |

### AI & Agents
| Topic | Description |
|-------|-------------|
| `agents` | AI agent configuration with LLM providers and tools |
| `tools` | AI tools for agents and MCP servers |
| `mcp-servers` | MCP server definitions exposing tools |

### Integrations
| Topic | Description |
|-------|-------------|
| `integrations` | Cloud storage, Redis, security, and external APIs |

### Configuration
| Topic | Description |
|-------|-------------|
| `workspace` | Workspace-level settings: environment variables, preferences, realtime |
| `branch` | Branch-level settings: middleware, history retention, visual styling |
| `middleware` | Request/response interceptors for functions, queries, tasks, and tools |

### Development
| Topic | Description |
|-------|-------------|
| `testing` | Unit tests, mocks, and assertions |
| `debugging` | Logging, inspecting, and debugging XanoScript execution |
| `frontend` | Static frontend development and deployment |
| `run` | Run job and service configurations for the Xano Job Runner |

### Best Practices
| Topic | Description |
|-------|-------------|
| `performance` | Performance optimization best practices |
| `security` | Security best practices for authentication and authorization |
