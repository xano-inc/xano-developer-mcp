# Realtime API

Realtime channels enable real-time bidirectional communication between clients using WebSockets. They support features like presence, message history, and private messaging.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/realtime/channel` | List channels |
| GET | `/workspace/{workspace_id}/realtime/channel/{channel_id}` | Get channel |
| POST | `/workspace/{workspace_id}/realtime/channel` | Create channel |
| PUT | `/workspace/{workspace_id}/realtime/channel/{channel_id}` | Update channel |
| DELETE | `/workspace/{workspace_id}/realtime/channel/{channel_id}` | Delete channel |

---

## List Realtime Channels

```
GET /workspace/{workspace_id}/realtime/channel
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `search` | text | "" | Search filter |
| `sort` | enum | "name" | Sort field: "name" |
| `order` | enum | "desc" | Sort order |

---

## Get Realtime Channel

```
GET /workspace/{workspace_id}/realtime/channel/{channel_id}
```

Returns channel definition including XanoScript.

---

## Create Realtime Channel

```
POST /workspace/{workspace_id}/realtime/channel
```

**Content-Type:** `text/x-xanoscript`

### XanoScript Realtime Channel Syntax

```xanoscript
realtime_channel foo {
  public_messaging = {active: false}
  private_messaging = {active: false}
  settings = {
    anonymous_clients: false
    nested_channels  : false
    message_history  : 0
    auth_channel     : false
    presence         : false
  }
}
```

### Messaging Options

| Field | Type | Description |
|-------|------|-------------|
| `public_messaging` | object | Configure public message broadcasting |
| `private_messaging` | object | Configure private direct messages |

### Settings

| Field | Type | Description |
|-------|------|-------------|
| `anonymous_clients` | bool | Allow connections without authentication |
| `nested_channels` | bool | Allow sub-channels (e.g., `chat/room1`) |
| `message_history` | int | Messages to keep in history (0 = disabled) |
| `auth_channel` | bool | Require authentication for channel access |
| `presence` | bool | Track online/offline status of users |

### Example: Chat Room Channel

```xanoscript
realtime_channel chat {
  public_messaging = {active: true}
  private_messaging = {active: true}
  settings = {
    anonymous_clients: false
    nested_channels  : true
    message_history  : 100
    auth_channel     : true
    presence         : true
  }
}
```

### Example: Notifications Channel

```xanoscript
realtime_channel notifications {
  public_messaging = {active: true}
  private_messaging = {active: false}
  settings = {
    anonymous_clients: false
    nested_channels  : false
    message_history  : 50
    auth_channel     : true
    presence         : false
  }
}
```

### Example: Public Broadcast Channel

```xanoscript
realtime_channel announcements {
  public_messaging = {active: true}
  private_messaging = {active: false}
  settings = {
    anonymous_clients: true
    nested_channels  : false
    message_history  : 10
    auth_channel     : false
    presence         : false
  }
}
```

---

## Update Realtime Channel

```
PUT /workspace/{workspace_id}/realtime/channel/{channel_id}
```

**Content-Type:** `text/x-xanoscript`

Send complete channel definition.

---

## Delete Realtime Channel

```
DELETE /workspace/{workspace_id}/realtime/channel/{channel_id}
```

**Warning:** This action cannot be undone. All connected clients will be disconnected.
