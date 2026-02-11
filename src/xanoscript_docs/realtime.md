---
applyTo: "functions/**/*.xs, apis/**/*.xs, triggers/**/*.xs"
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

## Common Patterns

### Chat Application

```xs
function "send_chat_message" {
  input {
    int room_id
    text content filters=trim|max:1000
  }
  stack {
    // Save message
    db.add "message" {
      data = {
        room_id: $input.room_id,
        sender_id: $auth.id,
        content: $input.content,
        created_at: now
      }
    } as $message

    // Broadcast to room
    api.realtime_event {
      channel = "room:" ~ $input.room_id
      event = "new_message"
      data = {
        id: $message.id,
        sender_id: $auth.id,
        content: $input.content,
        created_at: $message.created_at
      }
    }
  }
  response = $message
}
```

### Live Dashboard Updates

```xs
function "update_metrics" {
  stack {
    // Calculate metrics
    db.query "order" {
      where = $db.order.created_at >= now|transform_timestamp:"-1 hour"
    } as $recent_orders

    var $metrics {
      value = {
        orders_last_hour: $recent_orders|count,
        revenue_last_hour: $recent_orders|map:$$.total|sum,
        updated_at: now
      }
    }

    // Push to dashboard subscribers
    api.realtime_event {
      channel = "dashboard:metrics"
      event = "update"
      data = $metrics
    }
  }
  response = $metrics
}
```

### Collaborative Editing

```xs
realtime_trigger "document_edit" {
  channel = "document:*"
  event = "operation"
  stack {
    // Apply operation to document
    function.run "apply_document_op" {
      input = {
        document_id: $input.document_id,
        operation: $input.operation,
        user_id: $auth.id
      }
    } as $result

    // Broadcast to other editors
    api.realtime_event {
      channel = $channel
      event = "remote_operation"
      data = {
        operation: $input.operation,
        user_id: $auth.id,
        version: $result.version
      }
    }
  }
}
```

### Notification System

```xs
function "notify_user" {
  input {
    int user_id
    text type
    text title
    text body
    json? data
  }
  stack {
    // Save notification
    db.add "notification" {
      data = {
        user_id: $input.user_id,
        type: $input.type,
        title: $input.title,
        body: $input.body,
        data: $input.data,
        read: false,
        created_at: now
      }
    } as $notification

    // Push to user
    api.realtime_event {
      channel = "user:" ~ $input.user_id
      event = "notification"
      data = $notification
    }
  }
  response = $notification
}
```

---

## Subscription Management

Clients subscribe to channels client-side. Server controls what events to send.

### Authorization Pattern

```xs
// Validate user can access channel before sending
function "send_to_room" {
  input {
    int room_id
    text event
    json data
  }
  stack {
    // Check membership
    db.query "room_member" {
      where = $db.room_member.room_id == $input.room_id
            && $db.room_member.user_id == $auth.id
      return = { type: "exists" }
    } as $is_member

    precondition ($is_member) {
      error_type = "accessdenied"
      error = "Not a member of this room"
    }

    api.realtime_event {
      channel = "room:" ~ $input.room_id
      event = $input.event
      data = $input.data
    }
  }
}
```

---

## Best Practices

1. **Use channel namespacing** - `type:id` format for clarity
2. **Keep payloads small** - Send IDs, let client fetch details
3. **Validate before broadcast** - Don't trust client event data
4. **Use triggers for client events** - Handle incoming realtime events
5. **Consider fan-out carefully** - Large broadcasts can be expensive
6. **Implement presence** - Track who's connected to channels
