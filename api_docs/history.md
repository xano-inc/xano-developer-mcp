# History & Audit Logs API

View execution history and audit logs for various resources.

## History Endpoints

| Resource | List Endpoint | Search Endpoint |
|----------|---------------|-----------------|
| Request | `/workspace/{workspace_id}/request_history` | `.../request_history/search` |
| Function | `/workspace/{workspace_id}/function_history` | `.../function_history/search` |
| Task | `/workspace/{workspace_id}/task_history` | `.../task_history/search` |
| Middleware | `/workspace/{workspace_id}/middleware_history` | `.../middleware_history/search` |
| Tool | `/workspace/{workspace_id}/tool_history` | `.../tool_history/search` |
| Trigger | `/workspace/{workspace_id}/trigger_history` | `.../trigger_history/search` |

## Audit Log Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/audit_log` | Workspace audit logs |
| GET | `/audit_log` | All audit logs (paid only) |
| POST | `/workspace/{workspace_id}/audit_log/search` | Search workspace logs |
| POST | `/audit_log/search` | Search all logs (paid only) |

---

# Request History

## List Request History

```
GET /workspace/{workspace_id}/request_history
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `branch` | text | "" | Branch label |
| `apigroup_id` | int | 0 | Filter by API group ID |
| `query_id` | int | 0 | Filter by API endpoint ID |
| `include_output` | bool | false | Include response output |

## Search Request History

```
POST /workspace/{workspace_id}/request_history/search
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `branch` | text | "" | Branch label |
| `apigroup_id` | int | 0 | Filter by API group |
| `query_id` | int | 0 | Filter by endpoint |
| `search` | json | [] | Search filters |
| `sort` | json | [] | Sort configuration |
| `include_output` | bool | false | Include response output |

---

# Function History

## List Function History

```
GET /workspace/{workspace_id}/function_history
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `branch` | text | "" | Branch label |
| `function_id` | int | 0 | Filter by function ID |
| `include_output` | bool | false | Include response output |

## Search Function History

```
POST /workspace/{workspace_id}/function_history/search
```

---

# Task History

## List Task History

```
GET /workspace/{workspace_id}/task_history
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `branch` | text | "" | Branch label |
| `task_id` | int | 0 | Filter by task ID |
| `include_output` | bool | false | Include response output |

## Search Task History

```
POST /workspace/{workspace_id}/task_history/search
```

---

# Middleware History

## List Middleware History

```
GET /workspace/{workspace_id}/middleware_history
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `branch` | text | "" | Branch label |
| `middleware_id` | int | 0 | Filter by middleware ID |
| `query_id` | int | 0 | Filter by API endpoint ID |
| `function_id` | int | 0 | Filter by function ID |
| `task_id` | int | 0 | Filter by task ID |
| `include_output` | bool | false | Include response output |

## Search Middleware History

```
POST /workspace/{workspace_id}/middleware_history/search
```

---

# Tool History

## List Tool History

```
GET /workspace/{workspace_id}/tool_history
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `branch` | text | "" | Branch label |
| `tool_id` | int | 0 | Filter by tool ID |
| `include_output` | bool | false | Include response output |

## Search Tool History

```
POST /workspace/{workspace_id}/tool_history/search
```

---

# Trigger History

## List Trigger History

```
GET /workspace/{workspace_id}/trigger_history
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `trigger_id` | int | 0 | Filter by trigger ID |
| `include_output` | bool | false | Include response output |

## Search Trigger History

```
POST /workspace/{workspace_id}/trigger_history/search
```

---

# Audit Logs

## List Workspace Audit Logs

```
GET /workspace/{workspace_id}/audit_log
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `include_data` | bool | false | Include full log data |

## List All Audit Logs

```
GET /audit_log
```

**Note:** Requires paid plan.

Same parameters as workspace audit logs.

## Search Workspace Audit Logs

```
POST /workspace/{workspace_id}/audit_log/search
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-500) |
| `include_data` | bool | false | Include full log data |
| `search` | json | [] | Search filters |
| `sort` | json | [] | Sort configuration |

## Search All Audit Logs

```
POST /audit_log/search
```

**Note:** Requires paid plan.

---

# Response Fields

## History Entries

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | History entry ID |
| `created_at` | timestamp | Execution timestamp |
| `duration` | int | Execution duration in ms |
| `status` | int | HTTP status code |
| `input` | json | Request input |
| `output` | json | Response output (if requested) |

## Audit Log Entries

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Log entry ID |
| `created_at` | timestamp | Event timestamp |
| `action` | text | Action performed |
| `user` | object | User who performed action |
| `data` | json | Additional event data (if requested) |
