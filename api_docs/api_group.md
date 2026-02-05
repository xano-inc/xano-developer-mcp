# API Group & Endpoints

API Groups are containers for related API endpoints. Each API group has its own base URL and can contain multiple API endpoints.

## API Group Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/apigroup` | List API groups |
| GET | `/workspace/{workspace_id}/apigroup/{apigroup_id}` | Get API group |
| POST | `/workspace/{workspace_id}/apigroup` | Create API group |
| PUT | `/workspace/{workspace_id}/apigroup/{apigroup_id}` | Update API group |
| DELETE | `/workspace/{workspace_id}/apigroup/{apigroup_id}` | Delete API group |
| PUT | `/workspace/{workspace_id}/apigroup/{apigroup_id}/security` | Update security |
| GET | `/workspace/{workspace_id}/apigroup/{apigroup_id}/openapi` | Get OpenAPI spec |

## API Endpoint Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/apigroup/{apigroup_id}/api` | List endpoints |
| GET | `/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}` | Get endpoint |
| POST | `/workspace/{workspace_id}/apigroup/{apigroup_id}/api` | Create endpoint |
| PUT | `/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}` | Update endpoint |
| DELETE | `/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}` | Delete endpoint |
| PUT | `/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}/security` | Update security |
| GET | `/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}/openapi` | Get OpenAPI spec |

---

## List API Groups

```
GET /workspace/{workspace_id}/apigroup
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `branch` | text | "" | Branch label |
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page |
| `search` | text | "" | Search filter |
| `sort` | enum | "created_at" | Sort field |
| `order` | enum | "desc" | Sort order |
| `middleware` | bool | true | Include middleware info |

---

## Create API Group

```
POST /workspace/{workspace_id}/apigroup
```

**Content-Type:** `text/x-xanoscript`

```xanoscript
api_group foo {
  canonical = "custom"
  swagger = {active: true}
}
```

**Query Parameters:**
- `branch` (text): Target branch label
- `middleware` (bool): Include middleware in response

---

## Update API Group

```
PUT /workspace/{workspace_id}/apigroup/{apigroup_id}
```

**Content-Type:** `text/x-xanoscript`

---

## Delete API Group

```
DELETE /workspace/{workspace_id}/apigroup/{apigroup_id}
```

Deletes the API group and all its endpoints. Cannot be undone.

---

## Update API Group Security

```
PUT /workspace/{workspace_id}/apigroup/{apigroup_id}/security
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | text | Yes | New security GUID |
| `canonical` | text | Yes | Canonical URL path |

---

## Get API Group OpenAPI Spec

```
GET /workspace/{workspace_id}/apigroup/{apigroup_id}/openapi
```

Returns OpenAPI specification as JSON.

---

# API Endpoints

## List API Endpoints

```
GET /workspace/{workspace_id}/apigroup/{apigroup_id}/api
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page |
| `search` | text | "" | Search filter |
| `sort` | enum | "created_at" | Sort field |
| `order` | enum | "desc" | Sort order |

---

## Create API Endpoint

```
POST /workspace/{workspace_id}/apigroup/{apigroup_id}/api
```

**Content-Type:** `text/x-xanoscript`

### XanoScript API Endpoint Syntax

```xanoscript
query foo verb=GET {
  input {
    int score
  }

  stack {
    var $x1 {
      value = $input.score + 1
    }
  }

  response = $x1
}
```

### HTTP Verbs
Use `verb=` to specify: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

### Input Section
Define request parameters:

```xanoscript
input {
  int required_param
  text optional_param?
  bool param_with_default? default = true
}
```

### Stack Section
The API logic using XanoScript:

```xanoscript
stack {
  // Variable assignment
  var $result {
    value = $input.score * 2
  }

  // Database queries
  db.query user {
    where = $db.user.id == $input.user_id
    return = {type: "single"}
  }

  // Conditional logic
  if $input.score > 10 {
    var $bonus { value = 100 }
  }
}
```

### Response
Define what the endpoint returns:

```xanoscript
response = $result
```

---

## Update API Endpoint

```
PUT /workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately

**Content-Type:** `text/x-xanoscript`

---

## Delete API Endpoint

```
DELETE /workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}
```

---

## Update API Endpoint Security

```
PUT /workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}/security
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | text | Yes | New security GUID |
