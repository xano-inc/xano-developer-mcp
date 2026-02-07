---
applyTo: "functions/**/*.xs, apis/**/*.xs, tasks/*.xs"
---

# Integrations

Cloud services, Redis, storage, and security operations.

## Quick Reference

### Cloud Storage
| Provider | Prefix |
|----------|--------|
| AWS S3 | `cloud.aws.s3.*` |
| Azure Blob | `cloud.azure.storage.*` |
| Google Cloud | `cloud.google.storage.*` |

### Search
| Provider | Prefix |
|----------|--------|
| Elasticsearch | `cloud.elasticsearch.*` |
| AWS OpenSearch | `cloud.aws.opensearch.*` |
| Algolia | `cloud.algolia.*` |

### Other
| Service | Prefix |
|---------|--------|
| Redis | `redis.*` |
| Storage | `storage.*` |
| Security | `security.*` |

---

## AWS S3

### Upload File
```xs
cloud.aws.s3.upload_file {
  bucket = "my-bucket"
  region = "us-east-1"
  key = $env.AWS_ACCESS_KEY
  secret = $env.AWS_SECRET_KEY
  file_key = "uploads/" ~ $input.filename
  file = $input.file
} as $result
```

### Read File
```xs
cloud.aws.s3.read_file {
  bucket = "my-bucket"
  region = "us-east-1"
  key = $env.AWS_ACCESS_KEY
  secret = $env.AWS_SECRET_KEY
  file_key = "data/config.json"
} as $file
```

### Sign URL
```xs
cloud.aws.s3.sign_url {
  bucket = "my-bucket"
  region = "us-east-1"
  key = $env.AWS_ACCESS_KEY
  secret = $env.AWS_SECRET_KEY
  file_key = "private/document.pdf"
  ttl = 300
} as $signed_url
```

### List Directory
```xs
cloud.aws.s3.list_directory {
  bucket = "my-bucket"
  region = "us-east-1"
  key = $env.AWS_ACCESS_KEY
  secret = $env.AWS_SECRET_KEY
  prefix = "uploads/"
} as $files
```

### Delete File
```xs
cloud.aws.s3.delete_file {
  bucket = "my-bucket"
  region = "us-east-1"
  key = $env.AWS_ACCESS_KEY
  secret = $env.AWS_SECRET_KEY
  file_key = "temp/old-file.txt"
}
```

---

## Azure Blob Storage

```xs
cloud.azure.storage.upload_file {
  account_name = $env.AZURE_ACCOUNT
  account_key = $env.AZURE_KEY
  container_name = "files"
  filePath = "uploads/doc.pdf"
  file = $input.file
}

cloud.azure.storage.read_file {
  account_name = $env.AZURE_ACCOUNT
  account_key = $env.AZURE_KEY
  container_name = "files"
  filePath = "data/config.json"
} as $file

cloud.azure.storage.sign_url {
  account_name = $env.AZURE_ACCOUNT
  account_key = $env.AZURE_KEY
  container_name = "private"
  path = "document.pdf"
  ttl = 300
} as $url
```

---

## Google Cloud Storage

```xs
cloud.google.storage.upload_file {
  service_account = $env.GCP_SERVICE_ACCOUNT
  bucket = "my-bucket"
  filePath = "uploads/file.pdf"
  file = $input.file
}

cloud.google.storage.read_file {
  service_account = $env.GCP_SERVICE_ACCOUNT
  bucket = "my-bucket"
  filePath = "data/config.json"
} as $file

cloud.google.storage.sign_url {
  service_account = $env.GCP_SERVICE_ACCOUNT
  bucket = "my-bucket"
  filePath = "private/doc.pdf"
  method = "GET"
  ttl = 300
} as $url
```

---

## Elasticsearch

```xs
# Search
cloud.elasticsearch.query {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  base_url = "https://my-cluster.es.io"
  index = "products"
  return_type = "search"
  expression = [{ field: "category", value: "electronics", op: "eq" }]
  size = 10
  sort = [{ field: "price", order: "asc" }]
} as $results

# Document operations
cloud.elasticsearch.document {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  base_url = "https://my-cluster.es.io"
  index = "products"
  method = "GET"
  doc_id = "product-123"
} as $doc
```

---

## Redis

### Key-Value Operations
```xs
# Set value
redis.set {
  key = "user:123:session"
  data = $session_data
  ttl = 3600                            # Expires in 1 hour
}

# Get value
redis.get { key = "user:123:session" } as $session

# Check exists
redis.has { key = "user:123:session" } as $exists

# Delete
redis.del { key = "user:123:session" }
```

### Counters
```xs
# Increment
redis.incr {
  key = "page_views"
  by = 1
} as $new_count

# Decrement
redis.decr {
  key = "inventory:item-123"
  by = 1
} as $new_count
```

### Lists
```xs
# Push to end
redis.push {
  key = "queue:tasks"
  value = $task
} as $length

# Push to front
redis.unshift {
  key = "queue:priority"
  value = $urgent_task
}

# Pop from end
redis.pop { key = "queue:tasks" } as $task

# Pop from front
redis.shift { key = "queue:tasks" } as $task

# Get range
redis.range {
  key = "recent:logs"
  start = 0
  stop = 9
} as $logs

# Count
redis.count { key = "queue:tasks" } as $count
```

### Rate Limiting
```xs
redis.ratelimit {
  key = "api:" ~ $env.$remote_ip
  max = 100
  ttl = 60
  error = "Rate limit exceeded"
} as $status
```

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

### Auth Tokens
```xs
security.create_auth_token {
  table = "user"
  id = $user.id
  extras = { role: $user.role }
  expiration = 86400
} as $token
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

## External APIs

```xs
api.request {
  url = "https://api.example.com/data"
  method = "POST"
  params = { key: "value" }
  headers = []|push:("Authorization: Bearer " ~ $env.API_KEY)
  timeout = 30
} as $response
```

---

## Utilities

```xs
# Template engine (Twig)
util.template_engine {
  value = """
    Hello {{ $var.name }}!
    {% for item in $var.items %}
    - {{ item.name }}
    {% endfor %}
  """
} as $rendered

# IP lookup
util.ip_lookup { value = $env.$remote_ip } as $location

# Geo distance
util.geo_distance {
  latitude_1 = 40.71
  longitude_1 = -74.00
  latitude_2 = 34.05
  longitude_2 = -118.24
} as $distance_km

# Sleep
util.sleep { value = 5 }
```
