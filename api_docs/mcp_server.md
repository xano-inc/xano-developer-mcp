# MCP Server API

MCP (Model Context Protocol) Servers provide a standardized way to expose tools and resources to AI models. They allow external AI applications to interact with your Xano workspace.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/mcp_server` | List MCP servers |
| GET | `/workspace/{workspace_id}/mcp_server/{mcp_server_id}` | Get MCP server |
| POST | `/workspace/{workspace_id}/mcp_server` | Create MCP server |
| PUT | `/workspace/{workspace_id}/mcp_server/{mcp_server_id}` | Update MCP server |
| DELETE | `/workspace/{workspace_id}/mcp_server/{mcp_server_id}` | Delete MCP server |
| GET | `/mcp_server/documentation` | Get XanoScript documentation |

---

## List MCP Servers

```
GET /workspace/{workspace_id}/mcp_server
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label |
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `search` | text | "" | Search filter |
| `sort` | enum | "created_at" | Sort field |
| `order` | enum | "desc" | Sort order |
| `tools` | bool | true | Include tool information |

---

## Get MCP Server

```
GET /workspace/{workspace_id}/mcp_server/{mcp_server_id}
```

**Query Parameters:**
- `tools` (bool, default: true): Include tool information

Returns MCP server definition including XanoScript.

---

## Create MCP Server

```
POST /workspace/{workspace_id}/mcp_server
```

**Content-Type:** `text/x-xanoscript`

**Query Parameters:**
- `branch` (text): Target branch label
- `tools` (bool): Include tool information in response

### XanoScript MCP Server Syntax

```xanoscript
mcp_server foo {
  description = "test"
  canonical = "custom"
  tags = ["test"]
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | text | Human-readable description |
| `canonical` | text | Unique canonical identifier |
| `tags` | array | Tags for categorization |

### Example: Data Access MCP Server

```xanoscript
mcp_server data_access {
  description = "Provides read access to customer data"
  canonical = "customer-data"
  tags = ["data", "customer", "read-only"]
}
```

### Example: Admin MCP Server

```xanoscript
mcp_server admin_tools {
  description = "Administrative tools for workspace management"
  canonical = "admin"
  tags = ["admin", "management", "internal"]
}
```

---

## Update MCP Server

```
PUT /workspace/{workspace_id}/mcp_server/{mcp_server_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately
- `tools` (bool, default: true): Include tool information in response

**Content-Type:** `text/x-xanoscript`

---

## Delete MCP Server

```
DELETE /workspace/{workspace_id}/mcp_server/{mcp_server_id}
```

**Warning:** This action cannot be undone.

---

## Get MCP Documentation

```
GET /mcp_server/documentation
```

Provides comprehensive XanoScript syntax documentation.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | text | "start" | Documentation type/section |

This endpoint is useful for AI models to learn XanoScript syntax dynamically.
