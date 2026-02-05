# Middleware API

Middleware are reusable code blocks that run before or after API endpoints. They add common functionality like authentication, logging, or request/response transformation.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/middleware` | List middlewares |
| GET | `/workspace/{workspace_id}/middleware/{middleware_id}` | Get middleware |
| POST | `/workspace/{workspace_id}/middleware` | Create middleware |
| PUT | `/workspace/{workspace_id}/middleware/{middleware_id}` | Update middleware |
| DELETE | `/workspace/{workspace_id}/middleware/{middleware_id}` | Delete middleware |
| PUT | `/workspace/{workspace_id}/middleware/{middleware_id}/security` | Update security |

---

## List Middlewares

```
GET /workspace/{workspace_id}/middleware
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

---

## Get Middleware

```
GET /workspace/{workspace_id}/middleware/{middleware_id}
```

Returns middleware definition including XanoScript.

---

## Create Middleware

```
POST /workspace/{workspace_id}/middleware
```

**Content-Type:** `text/x-xanoscript`

**Query Parameters:**
- `branch` (text): Target branch label

### XanoScript Middleware Syntax

Middleware follows the same syntax as functions:

```xanoscript
middleware foo {
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

### Common Use Cases

#### Authentication Check

```xanoscript
middleware auth_check {
  input {
    text token?
  }

  stack {
    // Validate token
    if $input.token == null {
      precondition.abort {
        status = 401
        message = "Unauthorized"
      }
    }

    // Decode and verify token
    var $user {
      value = decode_jwt($input.token)
    }
  }

  response = $user
}
```

#### Request Logging

```xanoscript
middleware request_logger {
  input {
    text endpoint
    json body?
  }

  stack {
    db.insert request_log {
      data = {
        endpoint: $input.endpoint,
        body: $input.body,
        timestamp: now()
      }
    }
  }

  response = true
}
```

#### Rate Limiting

```xanoscript
middleware rate_limit {
  input {
    text client_ip
  }

  stack {
    // Count recent requests
    db.query rate_limit {
      where = $db.rate_limit.ip == $input.client_ip
        && $db.rate_limit.timestamp > now() - 60
      return = {type: "count"}
    }

    if $rate_limit > 100 {
      precondition.abort {
        status = 429
        message = "Too many requests"
      }
    }

    // Log this request
    db.insert rate_limit {
      data = {ip: $input.client_ip, timestamp: now()}
    }
  }

  response = true
}
```

### Use Cases

- Authentication and authorization
- Request logging
- Rate limiting
- Request/response transformation
- Error handling
- CORS headers

---

## Update Middleware

```
PUT /workspace/{workspace_id}/middleware/{middleware_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately

**Content-Type:** `text/x-xanoscript`

---

## Delete Middleware

```
DELETE /workspace/{workspace_id}/middleware/{middleware_id}
```

**Warning:** This action cannot be undone. Any API groups using this middleware will no longer have it applied.

---

## Update Middleware Security

```
PUT /workspace/{workspace_id}/middleware/{middleware_id}/security
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | text | Yes | New security GUID |
