---
applyTo: "function/**/*.xs, api/**/*.xs"
---

# Streaming Operations

Stream data from files, requests, and to API responses.

## Quick Reference

| Operation             | Purpose                   | Input          |
| --------------------- | ------------------------- | -------------- |
| `stream.from_csv`     | Parse CSV stream          | File or string |
| `stream.from_jsonl`   | Parse JSONL stream        | File or string |
| `stream.from_request` | Stream HTTP request body  | Request        |
| `api.stream`          | Stream response to client | Data           |

---

## stream.from_csv

Parse CSV data as a stream. Returns a stream value (like a generator) that is then iterated with `foreach`.

```xs
stream.from_csv {
  value = $input.csv_file
  separator = ","
  enclosure = '"'
  escape_char = '"'
} as $stream

foreach ($stream) {
  each as $row {
    db.add "import_record" {
      data = {
        name: $row.name,
        email: $row.email,
        created_at: now
      }
    }
  }
}
```

### Parameters

| Parameter     | Type      | Default  | Description                |
| ------------- | --------- | -------- | -------------------------- |
| `value`       | file/text | required | CSV file or string         |
| `headers`     | bool      | `true`   | First row contains headers |
| `separator`   | text      | `,`      | Field separator            |
| `enclosure`   | text      | `"`      | Field enclosure character  |
| `escape_char` | text      | `"`      | Escape character           |

### With Custom Headers

```xs
stream.from_csv {
  value = $input.file
  headers = false
} as $stream

foreach ($stream) {
  each as $row {
    // Access by index: $row.0, $row.1, etc.
    var $name { value = $row.0 }
    var $email { value = $row.1 }
  }
}
```

---

## stream.from_jsonl

Parse JSON Lines (newline-delimited JSON) as a stream. Returns a stream value iterated with `foreach`.

```xs
stream.from_jsonl {
  value = $input.jsonl_file
} as $stream

foreach ($stream) {
  each as $record {
    db.add "event" {
      data = {
        event_type: $record.type,
        payload: $record.data,
        timestamp: $record.ts
      }
    }
  }
}
```

### Parameters

| Parameter | Type      | Default  | Description          |
| --------- | --------- | -------- | -------------------- |
| `value`   | file/text | required | JSONL file or string |

### Example JSONL Format

```
{"type":"click","data":{"page":"/home"},"ts":1699900000}
{"type":"view","data":{"page":"/products"},"ts":1699900001}
{"type":"click","data":{"page":"/checkout"},"ts":1699900002}
```

---

## stream.from_request

Stream the incoming HTTP request body for large uploads. Returns a stream value iterated with `foreach`.

```xs
stream.from_request {
  format = "jsonl"
} as $stream

foreach ($stream) {
  each as $record {
    db.add "log" { data = $record }
  }
}
```

### Parameters

| Parameter   | Type | Options               | Description     |
| ----------- | ---- | --------------------- | --------------- |
| `format`    | text | `jsonl`, `csv`, `raw` | Body format     |
| `headers`   | bool | `true` (csv)          | CSV has headers |
| `separator` | text | `,` (csv)             | CSV separator   |

### Raw Chunks

```xs
stream.from_request {
  format = "raw"
  chunk_size = 8192
} as $stream

foreach ($stream) {
  each as $chunk {
    storage.append_file {
      pathname = "uploads/large_file.bin"
      data = $chunk
    }
  }
}
```

---

## api.stream

Stream response data to the client. Useful for large datasets, real-time feeds, or server-sent events.

### Streaming JSONL Response

```xs
query "export_logs" {
  input {
    timestamp start_date
    timestamp end_date
  }
  stack {
    db.query "log" {
      where = $db.log.created_at >= $input.start_date && $db.log.created_at <= $input.end_date
      return = { type: "stream" }
    } as $logs

    api.stream {
      format = "jsonl"
      value = $logs
    }
  }
}
```

### Streaming CSV Response

```xs
query "export_users_csv" {
  stack {
    db.query "user" {
      return = { type: "stream" }
    } as $users

    api.stream {
      format = "csv"
      value = $users
      headers = ["id", "name", "email", "created_at"]
      filename = "users_export.csv"
    }
  }
}
```

### Server-Sent Events (SSE)

```xs
query "live_updates" {
  stack {
    api.stream {
      format = "sse"
    } as $stream

    // Send events to client
    $stream.send { event = "connected", data = { status: "ok" } }

    foreach ($updates) {
      each as $update {
        $stream.send { event = "update", data = $update }
      }
    }

    $stream.close
  }
}
```

### Parameters

| Parameter  | Type   | Options                      | Description                 |
| ---------- | ------ | ---------------------------- | --------------------------- |
| `format`   | text   | `jsonl`, `csv`, `sse`, `raw` | Stream format               |
| `value`    | stream | optional                     | Data source for jsonl/csv   |
| `headers`  | text[] | optional                     | CSV column headers          |
| `filename` | text   | optional                     | Suggested download filename |

---

## Streaming Patterns

### Large File Import

```xs
function "import_large_csv" {
  input { file csv_file }
  stack {
    var $processed { value = 0 }
    var $errors { value = [] }

    stream.from_csv {
      value = $input.csv_file
      separator = ","
      enclosure = '"'
      escape_char = '"'
    } as $stream

    foreach ($stream) {
      each as $row {
        try_catch {
          try {
            db.add "record" {
              data = {
                name: $row.name|trim,
                email: $row.email|trim|to_lower,
                created_at: now
              }
            }
            math.add $processed { value = 1 }
          }
          catch {
            var.update $errors {
              value = $errors|push:{ row: $processed, error: $error.message }
            }
          }
        }
      }
    }
  }
  response = { processed: $processed, errors: $errors }
}
```

### ETL Pipeline

```xs
function "etl_events" {
  input { file events_file }
  stack {
    stream.from_jsonl {
      value = $input.events_file
    } as $stream

    foreach ($stream) {
      each as $event {
        // Transform
        var $transformed {
          value = {
            event_type: $event.type|to_lower,
            user_id: $event.user_id|to_int,
            metadata: $event.data|json_encode,
            occurred_at: $event.timestamp|to_timestamp
          }
        }

        // Load
        db.add "processed_event" {
          data = $transformed
        }
      }
    }
  }
  response = { status: "complete" }
}
```

### Chunked Export

```xs
query "stream_large_dataset" {
  stack {
    // Stream query results directly to response
    db.query "analytics" {
      where = $db.analytics.created_at >= $input.since
      sort = { created_at: "asc" }
      return = { type: "stream", chunk_size: 1000 }
    } as $data

    api.stream {
      format = "jsonl"
      value = $data
    }
  }
}
```

---

## Best Practices

1. **Use streaming for large files** - Prevents memory exhaustion
2. **Process in batches** - Commit database operations periodically
3. **Handle errors gracefully** - Log failures without stopping stream
4. **Set appropriate chunk sizes** - Balance memory and performance
5. **Use JSONL for structured data** - Easier to parse than multi-line JSON

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `integrations` | Cloud storage for file sources |
| `apis` | Streaming API responses |
| `database` | Processing streamed data into tables |
