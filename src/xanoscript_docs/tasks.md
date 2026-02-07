---
applyTo: "tasks/*.xs"
---

# Tasks

Scheduled jobs in XanoScript.

## Quick Reference

```xs
task "<name>" {
  description = "What this task does"
  stack { ... }
  schedule = [{starts_on: YYYY-MM-DD HH:MM:SS+0000, freq: <seconds>}]
}
```

### Common Frequencies
| Interval | Seconds |
|----------|---------|
| 1 minute | 60 |
| 5 minutes | 300 |
| 1 hour | 3600 |
| Daily | 86400 |
| Weekly | 604800 |

---

## Basic Structure

```xs
task "daily_cleanup" {
  description = "Clean up expired sessions daily at midnight UTC"
  stack {
    db.query "session" {
      where = $db.session.expires_at < now
    } as $expired

    foreach ($expired) {
      each as $session {
        db.del "session" {
          field_name = "id"
          field_value = $session.id
        }
      }
    }

    debug.log { value = "Cleaned " ~ ($expired|count) ~ " sessions" }
  }
  schedule = [{starts_on: 2025-01-01 00:00:00+0000, freq: 86400}]
}
```

---

## Schedule Configuration

### Single Event
```xs
schedule = [{starts_on: 2025-06-15 09:00:00+0000, freq: 86400}]
```

### With End Date
```xs
schedule = [{
  starts_on: 2025-01-01 08:00:00+0000,
  freq: 3600,
  ends_on: 2025-12-31 23:59:59+0000
}]
```

### Multiple Schedules
```xs
schedule = [
  {starts_on: 2025-01-01 09:00:00+0000, freq: 86400},
  {starts_on: 2025-01-01 21:00:00+0000, freq: 86400}
]
```

---

## Common Patterns

### Data Aggregation
```xs
task "hourly_stats" {
  description = "Aggregate hourly statistics"
  stack {
    var $hour_ago { value = now|transform_timestamp:"-1 hour" }

    db.query "order" {
      where = $db.order.created_at >= $hour_ago
    } as $orders

    db.add "hourly_stats" {
      data = {
        hour: $hour_ago,
        order_count: $orders|count,
        total_revenue: ($orders|map:$$.total)|sum
      }
    }
  }
  schedule = [{starts_on: 2025-01-01 00:00:00+0000, freq: 3600}]
}
```

### Cleanup Job
```xs
task "cleanup_temp_files" {
  description = "Delete temporary files older than 24 hours"
  stack {
    var $cutoff { value = now|transform_timestamp:"-24 hours" }

    db.query "temp_file" {
      where = $db.temp_file.created_at < $cutoff
    } as $files

    foreach ($files) {
      each as $file {
        storage.delete_file { pathname = $file.path }
        db.del "temp_file" {
          field_name = "id"
          field_value = $file.id
        }
      }
    }
  }
  schedule = [{starts_on: 2025-01-01 03:00:00+0000, freq: 86400}]
}
```

### Notification Job
```xs
task "daily_digest" {
  description = "Send daily digest emails"
  stack {
    db.query "user" {
      where = $db.user.digest_enabled == true
    } as $users

    foreach ($users) {
      each as $user {
        db.query "notification" {
          where = $db.notification.user_id == $user.id
            && $db.notification.sent == false
        } as $notifications

        conditional {
          if (($notifications|count) > 0) {
            util.send_email {
              service_provider = "resend"
              api_key = $env.RESEND_API_KEY
              to = $user.email
              from = "noreply@example.com"
              subject = "Your Daily Digest"
              message = "You have " ~ ($notifications|count) ~ " new notifications"
            }
          }
        }
      }
    }
  }
  schedule = [{starts_on: 2025-01-01 08:00:00+0000, freq: 86400}]
}
```

### External API Sync
```xs
task "sync_exchange_rates" {
  description = "Sync currency exchange rates every hour"
  stack {
    api.request {
      url = "https://api.exchangerate.com/latest"
      method = "GET"
      headers = []|push:("Authorization: Bearer " ~ $env.EXCHANGE_API_KEY)
    } as $response

    foreach ($response.rates|entries) {
      each as $rate {
        db.add_or_edit "exchange_rate" {
          field_name = "currency"
          field_value = $rate.key
          data = {
            currency: $rate.key,
            rate: $rate.value,
            updated_at: now
          }
        }
      }
    }
  }
  schedule = [{starts_on: 2025-01-01 00:00:00+0000, freq: 3600}]
}
```

---

## Stack Operations

Tasks use the same stack operations as functions:

- `db.query`, `db.add`, `db.edit`, `db.del` - Database operations
- `api.request` - External API calls
- `function.run` - Call functions
- `foreach`, `for`, `while` - Loops
- `conditional` - Branching
- `debug.log` - Logging
- `util.send_email` - Send emails
- `try_catch` - Error handling

---

## Error Handling

```xs
task "risky_sync" {
  stack {
    try_catch {
      try {
        api.request {
          url = "https://external-api.com/data"
          method = "GET"
        } as $data
        // Process data...
      }
      catch {
        util.send_email {
          service_provider = "resend"
          api_key = $env.RESEND_API_KEY
          to = "alerts@example.com"
          from = "system@example.com"
          subject = "Sync Task Failed"
          message = "The risky_sync task failed"
        }
      }
    }
  }
  schedule = [{starts_on: 2025-01-01 00:00:00+0000, freq: 3600}]
}
```

---

## Best Practices

1. **Descriptive names** - Indicate what and when: `daily_cleanup`, `hourly_sync`
2. **Handle errors** - Use try_catch for external dependencies
3. **Consider timezone** - Schedule uses UTC (+0000)
4. **Batch operations** - Process in chunks for large datasets
5. **Set end dates** - Use ends_on for temporary schedules
