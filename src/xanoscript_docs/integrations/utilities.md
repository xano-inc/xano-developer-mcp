---
applyTo: "function/**/*.xs, api/**/*.xs, task/**/*.xs"
---

# Utility Integrations

> **TL;DR:** Local storage (`storage.*`), security (`security.*`), email (`util.send_email`), archives (`zip.*`), Lambda (`api.lambda`), and utilities (template engine, geo, etc.).

## Quick Reference

| Category | Prefix | Purpose |
|----------|--------|---------|
| Local Storage | `storage.*` | File resources, images, attachments |
| Security | `security.*` | Passwords, encryption, JWT, random |
| Email | `util.send_email` | Send emails via providers |
| Archives | `zip.*` | Create, modify, extract ZIP files |
| Lambda | `api.lambda` | Execute inline code |
| Utilities | `util.*` | Templates, IP lookup, geo distance |

---

## Local Storage

### File Operations

```xs
# Create file resource
storage.create_file_resource {
  filename = "report.csv"
  filedata = $csv_content
} as $file

# Read file resource
storage.read_file_resource {
  value = $input.file
} as $content

# Delete file
storage.delete_file { pathname = "temp/old-file.txt" }
```

### Image/Attachment Handling

```xs
# Create image metadata
storage.create_image {
  value = $input.image
  access = "public"
  filename = "profile.jpg"
} as $image_meta

# Create attachment metadata
storage.create_attachment {
  value = $input.file
  access = "private"
  filename = "document.pdf"
} as $attachment_meta

# Sign private URL
storage.sign_private_url {
  pathname = "private/document.pdf"
  ttl = 300
} as $signed_url
```

---

## Security

### Password Hashing

```xs
# Password is auto-hashed on insert
db.add "user" {
  data = { email: $input.email, password: $input.password }
}

# Verify password
security.check_password {
  text_password = $input.password
  hash_password = $user.password
} as $is_valid
```

### Encryption

```xs
# Encrypt
security.encrypt {
  data = $sensitive_data
  algorithm = "aes-256-cbc"
  key = $env.ENCRYPTION_KEY
  iv = $env.ENCRYPTION_IV
} as $encrypted

# Decrypt
security.decrypt {
  data = $encrypted
  algorithm = "aes-256-cbc"
  key = $env.ENCRYPTION_KEY
  iv = $env.ENCRYPTION_IV
} as $decrypted
```

### JWT (JWS/JWE)

```xs
# Sign JWT
security.jws_encode {
  claims = { user_id: $user.id, role: $user.role }
  key = $env.JWT_SECRET
  signature_algorithm = "HS256"
  ttl = 3600
} as $token

# Verify JWT
security.jws_decode {
  token = $input.token
  key = $env.JWT_SECRET
  signature_algorithm = "HS256"
} as $claims
```

### Random Generation

```xs
security.create_uuid as $uuid
security.random_number { min = 1, max = 100 } as $random
security.random_bytes { length = 32 } as $bytes
security.create_password {
  character_count = 16
  require_lowercase = true
  require_uppercase = true
  require_digit = true
  require_symbol = true
} as $password
```

---

## Email

```xs
util.send_email {
  service_provider = "resend"
  api_key = $env.RESEND_API_KEY
  to = $user.email
  from = "noreply@example.com"
  subject = "Welcome!"
  message = "Thanks for signing up."
  reply_to = "support@example.com"
} as $result
```

---

## Zip/Archive Operations

### Create Archive

```xs
zip.create_archive {
  filename = "export.zip"
} as $archive

// Add files
zip.add_to_archive {
  archive = $archive
  files = [
    { path: "data/users.json", content: $users|json_encode },
    { path: "data/orders.json", content: $orders|json_encode },
    { path: "readme.txt", content: "Export generated on " ~ now|format_timestamp:"Y-m-d" }
  ]
}

storage.create_file_resource {
  filename = "export.zip"
  filedata = $archive
} as $file
```

### Add to Existing Archive

```xs
zip.add_to_archive {
  archive = $input.zip_file
  files = [
    { path: "additional/data.json", content: $data|json_encode }
  ]
} as $updated_archive
```

### Delete from Archive

```xs
zip.delete_from_archive {
  archive = $input.zip_file
  paths = ["old_file.txt", "deprecated/"]
} as $cleaned_archive
```

### Extract Archive

```xs
zip.extract {
  archive = $input.zip_file
  target_path = "extracted/"
} as $extracted_files

// $extracted_files = [
//   { path: "data/users.json", content: "..." },
//   { path: "readme.txt", content: "..." }
// ]
```

### View Contents

```xs
zip.view_contents {
  archive = $input.zip_file
} as $contents

// $contents = [
//   { path: "data/users.json", size: 1234, compressed_size: 456 },
//   { path: "readme.txt", size: 100, compressed_size: 80 }
// ]
```

### Full Example: Export & Download

```xs
query "export_data" {
  input {
    int[] user_ids
  }
  stack {
    // Fetch data
    db.query "user" {
      where = $db.user.id in $input.user_ids
    } as $users

    db.query "order" {
      where = $db.order.user_id in $input.user_ids
    } as $orders

    // Create archive
    zip.create_archive {
      filename = "user_export_" ~ now|format_timestamp:"Y-m-d" ~ ".zip"
    } as $archive

    zip.add_to_archive {
      archive = $archive
      files = [
        { path: "users.json", content: $users|json_encode },
        { path: "orders.json", content: $orders|json_encode },
        { path: "manifest.json", content: {
          exported_at: now,
          user_count: $users|count,
          order_count: $orders|count
        }|json_encode }
      ]
    }

    storage.create_file_resource {
      filename = "export.zip"
      filedata = $archive
    } as $download
  }
  response = { download_url: $download.url }
}
```

---

## Lambda Integration

### api.lambda

Execute inline code with optional timeout.

```xs
api.lambda {
  code = 'return "hello";'
  timeout = 10
} as $result
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Code to execute (required) |
| `timeout` | integer | Execution timeout in seconds (optional) |

---

## Utilities

```xs
// Template engine (Twig)
util.template_engine {
  value = """
    Hello {{ $var.name }}!
    {% for item in $var.items %}
    - {{ item.name }}
    {% endfor %}
  """
} as $rendered

// IP lookup
util.ip_lookup { value = $env.$remote_ip } as $location

// Geo distance
util.geo_distance {
  latitude_1 = 40.71
  longitude_1 = -74.00
  latitude_2 = 34.05
  longitude_2 = -118.24
} as $distance_km

// Sleep
util.sleep { value = 5 }
```

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `security` | Security best practices |
| `integrations/cloud-storage` | Cloud storage alternatives |
| `integrations` | All integrations index |
