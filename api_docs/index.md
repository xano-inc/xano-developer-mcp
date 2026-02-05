# Xano Headless API Documentation

## How to Use This Documentation

This documentation is accessed via the `api_docs` MCP tool. Use the `object` parameter to get detailed documentation for specific API resources.

### Available Object Values

| Object | Description |
|--------|-------------|
| `workspace` | Workspace management, branches, datasources, export/import, OpenAPI specs |
| `table` | Database table schema management with XanoScript |
| `api_group` | API groups and endpoints management |
| `function` | Reusable function library |
| `task` | Scheduled tasks (cron jobs) |
| `middleware` | Request/response middleware |
| `addon` | Reusable query addons for response transformation |
| `agent` | AI agent configuration |
| `tool` | AI tool definitions for agents |
| `mcp_server` | Model Context Protocol server management |
| `realtime` | Realtime WebSocket channels |
| `triggers` | Event-driven triggers (table, workspace, agent, MCP, realtime) |
| `file` | File uploads and static hosting |
| `history` | Request history and audit logs |
| `authentication` | User authentication and session info |

### Example Usage

```
// Get overview (this document)
api_docs()

// Get specific documentation
api_docs({ object: "table" })
api_docs({ object: "api_group" })
api_docs({ object: "function" })
```

---

## API Overview

The Xano Headless API uses **XanoScript** as the primary input/output format for most mutation operations.

### Base URL
All API endpoints are relative to your Xano instance's headless API base URL.

### Content Types
- **Mutations** (POST/PUT): `text/x-xanoscript`
- **Responses**: `application/json`

### Common Patterns

#### Pagination
```
GET /resource?page=1&per_page=50
```
Response:
```json
{
  "curPage": 1,
  "nextPage": 2,
  "prevPage": null,
  "items": [...]
}
```

#### Branch Targeting
Most endpoints support `?branch=<label>` (empty = live branch)

#### Sorting
- `sort`: Field name (varies by endpoint)
- `order`: `asc` or `desc`

#### Search
- `search`: Text search filter

---

## Resource Categories

### Core Resources
- **Workspace** - Container for all Xano resources
- **Table** - Database tables with schema definitions
- **API Group** - Groups of related API endpoints

### Logic & Code
- **Function** - Reusable code blocks
- **Middleware** - Request/response processing
- **Addon** - Response transformation queries
- **Task** - Scheduled jobs

### AI & Integrations
- **Agent** - AI-powered assistants
- **Tool** - Functions callable by AI agents
- **MCP Server** - Model Context Protocol servers

### Events & Realtime
- **Triggers** - Event-driven automation
- **Realtime** - WebSocket channels

### Files & Observability
- **File** - File storage and static hosting
- **History** - Execution logs and audit trails
