---
applyTo: "realtime/channel/*.xs, realtime/trigger/*.xs, function/**/*.xs, api/**/*.xs"
---

# Realtime

Push real-time updates to connected clients using channels and events.

## Quick Reference

| Operation | Purpose |
|-----------|---------|
| `api.realtime_event` | Send event to channel |
| Channel patterns | Organize subscriptions |
| Realtime triggers | Handle client events |

---

## api.realtime_event

Send a real-time event to subscribed clients.

```xs
api.realtime_event {
  channel = "orders"
  event = "new_order"
  data = {
    order_id: $order.id,
    total: $order.total,
    customer: $order.customer_name
  }
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `channel` | text | Channel name or pattern |
| `event` | text | Event type name |
| `data` | any | Payload to send |

---

## Realtime Channel Configuration

Define channel settings at the workspace level using `realtime_channel`.

```xs
realtime_channel "<channel_pattern>" {
  description = "Channel description"
  active = true

  public_messaging = {
    active: true,
    auth: false
  }

  private_messaging = {
    active: true,
    auth: true
  }

  settings = {
    anonymous_clients: false,
    nested_channels: true,
    message_history: 100,
    auth_channel: true,
    presence: true
  }
}
```

### Channel Configuration Options

| Attribute | Type | Description |
|-----------|------|-------------|
| `description` | text | Human-readable channel description |
| `active` | boolean | Enable/disable the channel |

### Messaging Options

| Setting | Type | Description |
|---------|------|-------------|
| `public_messaging.active` | boolean | Allow public messages |
| `public_messaging.auth` | boolean | Require authentication for public messages |
| `private_messaging.active` | boolean | Allow private messages |
| `private_messaging.auth` | boolean | Require authentication for private messages |

### Settings Options

| Setting | Type | Values | Description |
|---------|------|--------|-------------|
| `anonymous_clients` | boolean | true/false | Allow unauthenticated clients |
| `nested_channels` | boolean | true/false | Allow sub-channel patterns |
| `message_history` | number | 0, 25, 50, 100, 250, 1000 | Messages to retain |
| `auth_channel` | boolean | true/false | Require channel-level auth |
| `presence` | boolean | true/false | Track client presence |

### Example Configurations

```xs
// Chat room channel with presence
realtime_channel "room:*" {
  description = "Chat room channels"
  active = true

  public_messaging = { active: true, auth: true }
  private_messaging = { active: true, auth: true }

  settings = {
    anonymous_clients: false,
    nested_channels: false,
    message_history: 100,
    auth_channel: true,
    presence: true
  }
}

// Global announcements (read-only for clients)
realtime_channel "announcements" {
  description = "System-wide announcements"
  active = true

  public_messaging = { active: true, auth: false }
  private_messaging = { active: false, auth: false }

  settings = {
    anonymous_clients: true,
    nested_channels: false,
    message_history: 25,
    auth_channel: false,
    presence: false
  }
}

// User-specific notifications
realtime_channel "user:*" {
  description = "User notification channels"
  active = true

  public_messaging = { active: false, auth: false }
  private_messaging = { active: true, auth: true }

  settings = {
    anonymous_clients: false,
    nested_channels: false,
    message_history: 50,
    auth_channel: true,
    presence: false
  }
}
```

---

## Channel Patterns

### Public Channels

Accessible to all authenticated clients. When you send to a public channel, all clients currently subscribed to that channel receive the message.

```xs
// Global announcements
api.realtime_event {
  channel = "announcements"
  event = "system_update"
  data = { message: "Maintenance in 10 minutes" }
}
```

### User-Specific Channels

Target individual users.

```xs
// Notify specific user
api.realtime_event {
  channel = "user:" ~ $user.id
  event = "notification"
  data = {
    title: "New message",
    body: "You have a new message from " ~ $sender.name
  }
}
```

### Resource Channels

Updates for specific resources.

```xs
// Update watchers of a document
api.realtime_event {
  channel = "document:" ~ $document.id
  event = "content_updated"
  data = {
    updated_by: $auth.id,
    updated_at: now,
    changes: $changes
  }
}
```

### Tenant Channels

Multi-tenant isolation.

```xs
api.realtime_event {
  channel = "tenant:" ~ $env.$tenant ~ ":orders"
  event = "order_created"
  data = $order
}
```

---

## Broadcast Patterns

### To All Connected Users

```xs
api.realtime_event {
  channel = "global"
  event = "broadcast"
  data = { message: $input.message }
}
```

### To Role-Based Groups

```xs
// Notify all admins
foreach ($admin_users) {
  each as $admin {
    api.realtime_event {
      channel = "user:" ~ $admin.id
      event = "admin_alert"
      data = $alert_data
    }
  }
}
```

### To Room/Group

```xs
api.realtime_event {
  channel = "room:" ~ $input.room_id
  event = "message"
  data = {
    sender_id: $auth.id,
    content: $input.message,
    sent_at: now
  }
}
```

---

## Realtime Triggers

Handle events from connected clients using `realtime_trigger`. For complete trigger syntax, input schemas, and configuration options, see `xanoscript_docs({ topic: "triggers" })`.

---

## Common Pattern: Broadcast After Database Write

```xs
// Save to database, then broadcast to subscribers
db.add "message" {
  data = { room_id: $input.room_id, sender_id: $auth.id, content: $input.content }
} as $message

api.realtime_event {
  channel = "room:" ~ $input.room_id
  event = "new_message"
  data = $message
}
```

---

## Subscription Management

Clients subscribe to channels client-side. Server controls what events to send. Validate channel access with preconditions before broadcasting.

> See `xanoscript_docs({ topic: "security" })` for authorization patterns.

---

## Best Practices

1. **Use channel namespacing** - `type:id` format for clarity
2. **Keep payloads small** - Send IDs, let client fetch details
3. **Validate before broadcast** - Don't trust client event data

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `workspace` | Realtime configuration settings |
| `security` | Authorization patterns for channels |
| `frontend` | Client-side realtime integration |
