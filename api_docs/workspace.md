# Workspace API

Workspaces are the primary container for all Xano resources including tables, APIs, functions, and more.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace` | List all workspaces |
| GET | `/workspace/{workspace_id}` | Get workspace details |
| POST | `/workspace/{workspace_id}/export` | Export workspace archive |
| POST | `/workspace/{workspace_id}/export-schema` | Export schema only |
| POST | `/workspace/{workspace_id}/import` | Import workspace archive |
| POST | `/workspace/{workspace_id}/import-schema` | Import schema to new branch |
| GET | `/workspace/{workspace_id}/openapi` | Get OpenAPI specification |
| GET | `/workspace/{workspace_id}/context` | Get AI-consumable context |
| GET | `/workspace/{workspace_id}/multidoc` | Export as XanoScript multidoc |
| POST | `/workspace/{workspace_id}/convert/fromXS` | Convert XanoScript to JSON |
| POST | `/workspace/{workspace_id}/convert/toXS` | Convert JSON to XanoScript |

---

## List Workspaces

```
GET /workspace
```

Returns array of workspace objects the authenticated user can access.

---

## Get Workspace

```
GET /workspace/{workspace_id}
```

**Path Parameters:**
- `workspace_id` (int, required): Workspace ID

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Workspace unique identifier |
| `name` | text | Workspace name |
| `branch` | text | Current live branch label |
| `swagger` | bool | OpenAPI documentation enabled |
| `documentation.link` | text | Link to OpenAPI spec |

---

## Export Workspace

```
POST /workspace/{workspace_id}/export
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label (empty = live) |
| `password` | text | "" | Optional encryption password |

Returns downloadable archive file.

---

## Export Schema Only

```
POST /workspace/{workspace_id}/export-schema
```

Same parameters as export. Returns schema and branch configuration only.

---

## Import Workspace

```
POST /workspace/{workspace_id}/import
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | file | Yes | Export archive file |
| `password` | text | No | Decryption password |

Replaces all content in target workspace.

---

## Import Schema

```
POST /workspace/{workspace_id}/import-schema
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | file | Yes | Schema export file |
| `newbranch` | text | Yes | Name for new branch |
| `setlive` | bool | No | Set new branch as live |
| `password` | text | No | Decryption password |

---

## Get OpenAPI Spec

```
GET /workspace/{workspace_id}/openapi
```

**Parameters:**
- `branch` (text): Branch label (empty = live)

Returns OpenAPI specification as JSON.

---

## Get Workspace Context

```
GET /workspace/{workspace_id}/context
```

Generates AI/LLM-consumable workspace context.

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label |
| `format` | enum | "yaml" | Output: "json" or "yaml" |
| `include` | text | "" | Comma-separated resource list |

---

## Export as XanoScript Multidoc

```
GET /workspace/{workspace_id}/multidoc
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label |
| `env` | bool | false | Include environment variables |
| `records` | bool | false | Include database records |

Returns XanoScript multidoc (`text/x-xanoscript`).

---

## Convert XanoScript to JSON

```
POST /workspace/{workspace_id}/convert/fromXS
```

**Content-Type:** `text/x-xanoscript`

Body: XanoScript code to convert.

---

## Convert JSON to XanoScript

```
POST /workspace/{workspace_id}/convert/toXS
```

**Content-Type:** `application/json`

**Body:**
```json
{
  "kind": "object_type",
  "data": "json_data"
}
```

---

# Branches

## List Branches

```
GET /workspace/{workspace_id}/branch
```

**Response Example:**
```json
[
  {"created_at": "2024-01-01T00:00:00Z", "label": "v1", "backup": false, "live": true},
  {"created_at": "2024-01-15T00:00:00Z", "label": "dev", "backup": false}
]
```

## Delete Branch

```
DELETE /workspace/{workspace_id}/branch/{branch_label}
```

Cannot delete `v1` (root) or currently live branch.

---

# Datasources

External database connections.

## List Datasources

```
GET /workspace/{workspace_id}/datasource
```

## Create Datasource

```
POST /workspace/{workspace_id}/datasource
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `label` | text | Yes | - | Unique label |
| `color` | text | No | "#ebc346" | Display color (hex) |

## Update Datasource

```
PUT /workspace/{workspace_id}/datasource/{label}
```

## Delete Datasource

```
DELETE /workspace/{workspace_id}/datasource/{label}
```
