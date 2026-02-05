# Authentication API

The Headless API requires authentication for all endpoints. This document covers the authentication endpoint.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user info |

---

## Get Current User

```
GET /auth/me
```

Retrieve information about the authenticated user.

**Response Example:**
```json
{
  "id": 123,
  "name": "User Name",
  "email": "user@example.com",
  "extras": {
    "instance": {
      "membership": {
        "role": "admin",
        "workspace": {
          "id": [1, 2, 3]
        }
      }
    }
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | int | User's unique identifier |
| `name` | text | User's display name |
| `email` | text | User's email address |
| `extras` | object | Additional authentication context |

### Extras Object

The `extras` object contains instance membership information:

| Path | Description |
|------|-------------|
| `extras.instance.membership.role` | User's role |
| `extras.instance.membership.workspace.id` | Accessible workspace IDs (for free tier) |

### User Roles

| Role | Description |
|------|-------------|
| `explore` | Free tier - limited workspace access |
| `admin` | Full access to all workspaces |

### Notes

- The `workspace.id` array is used for free tier users to restrict access
- Paid users can access all workspaces not in the disabled list
- The role determines what operations the user can perform
