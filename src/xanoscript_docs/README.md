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

**Important:** Each `.xs` file must contain exactly one definition. You cannot define multiple tables, functions, queries, or other constructs in a single file.

## Workspace Structure

```
project/
├── tables/              // Database table schemas
├── functions/           // Reusable functions (supports subfolders)
├── apis/
│   └── <api-group>/     // API endpoints grouped by domain
├── tasks/               // Scheduled jobs
├── triggers/            // Event-driven handlers
├── agents/              // AI agents
├── tools/               // AI tools
├── mcp_servers/         // MCP server definitions
├── addons/              // Query addons
├── static/              // Frontend files (HTML, CSS, JS)
└── ephemeral/           // Temporary test environments
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

Use `xanoscript_docs({ keyword: "<keyword>" })` to retrieve documentation.

### Core Language
| Topic | Keyword | Description |
|-------|---------|-------------|
| Syntax Reference | `syntax` | Expressions, operators, filters, system variables |
| Types & Inputs | `input` | Data types, validation, input blocks |
| Functions | `function` | Reusable function stacks, async, loops |
| Schema | `schema` | Runtime schema parsing and validation |

### Data
| Topic | Keyword | Description |
|-------|---------|-------------|
| Tables | `table` | Database schema definitions |
| Database Operations | `db_query` | Query, add, edit, delete, bulk operations |
| Addons | `addon` | Reusable subqueries for related data |
| Streaming | `streaming` | Stream processing for large files |

### APIs & Endpoints
| Topic | Keyword | Description |
|-------|---------|-------------|
| APIs | `api_query` | HTTP endpoint definitions |
| Tasks | `task` | Scheduled jobs |
| Triggers | `trigger` | Event-driven handlers |
| Realtime | `realtime` | Push events and channels |

### AI & Agents
| Topic | Keyword | Description |
|-------|---------|-------------|
| Agents | `agent` | AI agent configuration |
| Tools | `tool` | AI tools for agents |
| MCP Servers | `mcp_server` | Model Context Protocol servers |

### Integrations
| Topic | Keyword | Description |
|-------|---------|-------------|
| Integrations | `integrations` | Cloud storage, search, Redis, zip, Lambda |

### Development
| Topic | Keyword | Description |
|-------|---------|-------------|
| Testing | `testing` | Unit tests and mocking |
| Debugging | `debugging` | Logging and inspection tools |
| Frontend | `frontend` | Static frontend development |
| Ephemeral | `ephemeral` | Temporary environments |

### Best Practices
| Topic | Keyword | Description |
|-------|---------|-------------|
| Performance | `performance` | Query optimization, caching, parallelism |
| Security | `security` | Authentication, authorization, encryption |
