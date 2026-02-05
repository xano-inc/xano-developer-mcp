# Task API

Tasks are scheduled jobs that run automatically based on a cron-like schedule. They are defined using XanoScript.

**Note:** Task functionality is restricted to paid accounts.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/task` | List tasks |
| GET | `/workspace/{workspace_id}/task/{task_id}` | Get task |
| POST | `/workspace/{workspace_id}/task` | Create task |
| PUT | `/workspace/{workspace_id}/task/{task_id}` | Update task |
| DELETE | `/workspace/{workspace_id}/task/{task_id}` | Delete task |
| PUT | `/workspace/{workspace_id}/task/{task_id}/security` | Update security |

---

## List Tasks

```
GET /workspace/{workspace_id}/task
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

## Get Task

```
GET /workspace/{workspace_id}/task/{task_id}
```

Returns task definition including schedule and XanoScript.

---

## Create Task

```
POST /workspace/{workspace_id}/task
```

**Content-Type:** `text/x-xanoscript`

**Query Parameters:**
- `branch` (text): Target branch label

### XanoScript Task Syntax

```xanoscript
task foo {
  stack {
    var $x1 {
      value = 1
    }
  }

  schedule = [{starts_on: 2025-10-28 18:03:58+0000, freq: 900}]
}
```

### Stack Section

The task logic (same syntax as functions):

```xanoscript
stack {
  db.query user {
    where = $db.user.active == false
    return = {type: "list"}
  }

  foreach $user as $u {
    // Process each user
  }
}
```

### Schedule Section

#### Inline Format
```xanoscript
schedule = [{
  starts_on: 2025-10-28 18:03:58+0000,
  freq: 900
}]
```

#### Block Format
```xanoscript
schedule {
  events = [{
    starts_on: 2025-07-25 20:00:12+0000,
    freq: 900
  }]
}
```

### Schedule Options

| Field | Description |
|-------|-------------|
| `starts_on` | ISO timestamp when schedule begins |
| `freq` | Frequency in seconds between runs |

### Common Frequencies

| Seconds | Interval |
|---------|----------|
| 60 | Every minute |
| 300 | Every 5 minutes |
| 900 | Every 15 minutes |
| 3600 | Every hour |
| 86400 | Every day |

### Complete Example

```xanoscript
task cleanup_expired_sessions {
  stack {
    // Find expired sessions
    db.query session {
      where = $db.session.expires_at < now()
      return = {type: "list"}
    }

    // Delete each expired session
    foreach $session as $s {
      db.delete session {
        where = $db.session.id == $s.id
      }
    }

    var $deleted_count {
      value = count($session)
    }
  }

  schedule = [{
    starts_on: 2025-01-01 00:00:00+0000,
    freq: 3600
  }]
}
```

---

## Update Task

```
PUT /workspace/{workspace_id}/task/{task_id}
```

**Query Parameters:**
- `publish` (bool, default: true): Publish changes immediately

**Content-Type:** `text/x-xanoscript`

---

## Delete Task

```
DELETE /workspace/{workspace_id}/task/{task_id}
```

**Warning:** This action cannot be undone.

---

## Update Task Security

```
PUT /workspace/{workspace_id}/task/{task_id}/security
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | text | Yes | New security GUID |
