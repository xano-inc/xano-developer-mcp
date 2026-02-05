# Table API

Tables are database objects that store structured data. Tables are defined using XanoScript with schema definitions, indexes, and constraints.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/table` | List all tables |
| GET | `/workspace/{workspace_id}/table/{table_id}` | Get table details |
| POST | `/workspace/{workspace_id}/table` | Create table |
| PUT | `/workspace/{workspace_id}/table/{table_id}` | Update table |
| DELETE | `/workspace/{workspace_id}/table/{table_id}` | Delete table |

---

## List Tables

```
GET /workspace/{workspace_id}/table
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `search` | text | "" | Search filter |
| `sort` | enum | "name" | Sort: "created_at", "updated_at", "name" |
| `order` | enum | "asc" | Sort order: "asc", "desc" |

---

## Get Table

```
GET /workspace/{workspace_id}/table/{table_id}
```

Returns table definition including schema, indexes, and XanoScript.

---

## Create Table

```
POST /workspace/{workspace_id}/table
```

**Content-Type:** `text/x-xanoscript`

### XanoScript Table Syntax

```xanoscript
table book {
  schema {
    int id
    text title
    text description
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
}
```

### Schema Field Types

| Type | Description |
|------|-------------|
| `int` | Integer |
| `text` | Text/string |
| `bool` | Boolean |
| `float` | Floating point number |
| `timestamp` | Timestamp/datetime |
| `date` | Date only |
| `time` | Time only |
| `json` | JSON object |
| `uuid` | UUID string |
| `enum` | Enumerated values |
| `object` | Nested object |
| `object[]` | Array of objects |

### Field Modifiers

| Modifier | Syntax | Description |
|----------|--------|-------------|
| Optional | `field_name?` | Nullable field |
| Default | `default = value` | Default value |

### Index Types

| Type | Description |
|------|-------------|
| `primary` | Primary key index |
| `unique` | Unique constraint |
| `index` | Regular index |
| `fulltext` | Full-text search index |

### Complete Example

```xanoscript
table user {
  schema {
    int id
    text email
    text password
    text name?
    timestamp created_at
    bool active default = true
    enum role {
      values = ["admin", "user", "guest"]
      default = "user"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]},
    {type: "unique", field: [{name: "email"}]},
    {type: "index", field: [{name: "created_at"}]}
  ]
}
```

---

## Update Table

```
PUT /workspace/{workspace_id}/table/{table_id}
```

**Content-Type:** `text/x-xanoscript`

Send complete table definition with updated schema.

**Notes:**
- Schema changes may trigger database migrations
- Removing fields or changing types may result in data loss
- Adding new fields typically requires default values for existing rows

---

## Delete Table

```
DELETE /workspace/{workspace_id}/table/{table_id}
```

**Warning:** This action cannot be undone. All data in the table will be permanently deleted.
