---
applyTo: "functions/**/*.xs, apis/**/*.xs, tasks/*.xs"
---

# Integrations

Cloud services, Redis, storage, archives, and security operations.

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
| Zip/Archive | `zip.*` |
| Lambda | `api.lambda` |

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

### Search Query

```xs
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
```

### Document Operations

```xs
// Get document
cloud.elasticsearch.document {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  base_url = "https://my-cluster.es.io"
  index = "products"
  method = "GET"
  doc_id = "product-123"
} as $doc

// Index document
cloud.elasticsearch.document {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  base_url = "https://my-cluster.es.io"
  index = "products"
  method = "PUT"
  doc_id = "product-123"
  body = {
    name: "Product Name",
    category: "electronics",
    price: 99.99
  }
}

// Delete document
cloud.elasticsearch.document {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  base_url = "https://my-cluster.es.io"
  index = "products"
  method = "DELETE"
  doc_id = "product-123"
}
```

### Bulk Operations

```xs
cloud.elasticsearch.bulk {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  base_url = "https://my-cluster.es.io"
  index = "products"
  operations = [
    { action: "index", id: "1", doc: { name: "Product 1" } },
    { action: "update", id: "2", doc: { price: 29.99 } },
    { action: "delete", id: "3" }
  ]
} as $result
```

### Advanced Search

```xs
cloud.elasticsearch.query {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  base_url = "https://my-cluster.es.io"
  index = "products"
  return_type = "search"
  query = {
    bool: {
      must: [
        { match: { name: $input.search } }
      ],
      filter: [
        { range: { price: { gte: $input.min_price, lte: $input.max_price } } },
        { term: { is_active: true } }
      ]
    }
  }
  aggregations = {
    categories: { terms: { field: "category.keyword" } },
    avg_price: { avg: { field: "price" } }
  }
  size = 20
  from = $input.offset
} as $results
```

---

## AWS OpenSearch

```xs
cloud.aws.opensearch.query {
  region = "us-east-1"
  access_key = $env.AWS_ACCESS_KEY
  secret_key = $env.AWS_SECRET_KEY
  endpoint = "https://search-domain.us-east-1.es.amazonaws.com"
  index = "logs"
  query = {
    bool: {
      must: [
        { match: { level: "error" } }
      ],
      filter: [
        { range: { timestamp: { gte: "now-24h" } } }
      ]
    }
  }
  size = 100
} as $logs

// Index document
cloud.aws.opensearch.document {
  region = "us-east-1"
  access_key = $env.AWS_ACCESS_KEY
  secret_key = $env.AWS_SECRET_KEY
  endpoint = "https://search-domain.us-east-1.es.amazonaws.com"
  index = "logs"
  method = "PUT"
  doc_id = $log_id
  body = $log_data
}
```

---

## Algolia

### Search

```xs
cloud.algolia.search {
  app_id = $env.ALGOLIA_APP_ID
  api_key = $env.ALGOLIA_API_KEY
  index = "products"
  query = $input.search
  filters = "category:electronics AND price<100"
  facets = ["category", "brand"]
  hitsPerPage = 20
  page = $input.page
} as $results
```

### Manage Records

```xs
// Add/update record
cloud.algolia.save_object {
  app_id = $env.ALGOLIA_APP_ID
  api_key = $env.ALGOLIA_ADMIN_KEY
  index = "products"
  object = {
    objectID: $product.id|to_text,
    name: $product.name,
    category: $product.category,
    price: $product.price
  }
}

// Batch save
cloud.algolia.save_objects {
  app_id = $env.ALGOLIA_APP_ID
  api_key = $env.ALGOLIA_ADMIN_KEY
  index = "products"
  objects = $products|map:{
    objectID: $$.id|to_text,
    name: $$.name,
    category: $$.category
  }
}

// Delete record
cloud.algolia.delete_object {
  app_id = $env.ALGOLIA_APP_ID
  api_key = $env.ALGOLIA_ADMIN_KEY
  index = "products"
  objectID = $input.product_id|to_text
}
```

### Configure Index

```xs
cloud.algolia.set_settings {
  app_id = $env.ALGOLIA_APP_ID
  api_key = $env.ALGOLIA_ADMIN_KEY
  index = "products"
  settings = {
    searchableAttributes: ["name", "description", "category"],
    attributesForFaceting: ["category", "brand", "filterOnly(is_active)"],
    ranking: ["typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"]
  }
}
```

---

## Redis

### Key-Value Operations
```xs
// Set value
redis.set {
  key = "user:123:session"
  data = $session_data
  ttl = 3600                            // Expires in 1 hour
}

// Get value
redis.get { key = "user:123:session" } as $session

// Check exists
redis.has { key = "user:123:session" } as $exists

// Delete
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

Make HTTP requests to external APIs.

```xs
api.request {
  url = "https://api.example.com/data"
  method = "POST"
  params = { key: "value" }
  headers = ["Content-Type: application/json", "Authorization: Bearer " ~ $env.API_KEY]
  timeout = 30
} as $api_result
```

> **Note:** The `headers` parameter expects an array of text strings, where each string contains the header name and value separated by a colon (e.g., `["Content-Type: application/json", "X-Custom-Header: value"]`).

### Response Structure

The `api.request` statement returns an object with both request and response details:

```json
{
  "request": {
    "url": "",       // The URL that was requested
    "method": "",    // HTTP method used (GET, POST, etc.)
    "headers": [],   // Array of request headers sent
    "params": []     // Parameters sent with the request
  },
  "response": {
    "headers": [],   // Array of response headers received
    "result": "",    // Response body (can be any format: JSON, string, null, boolean, etc.)
    "status": 200    // HTTP status code
  }
}
```

### Accessing Response Data

```xs
api.request {
  url = "https://api.example.com/users"
  method = "GET"
} as $api_result

// Access the response body
var $data { value = $api_result.response.result }

// Check status code
if ($api_result.response.status != 200) {
  precondition { false } with { message = "API request failed" }
}

// Access a specific header
var $content_type { value = $api_result.response.headers|first }
```

---

## Zip/Archive Operations

Create, modify, and extract ZIP archives.

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

Invoke AWS Lambda functions or other serverless functions.

### api.lambda

```xs
api.lambda {
  provider = "aws"
  region = "us-east-1"
  access_key = $env.AWS_ACCESS_KEY
  secret_key = $env.AWS_SECRET_KEY
  function_name = "process-image"
  payload = {
    image_url: $input.image_url,
    operations: ["resize", "compress"]
  }
  invocation_type = "RequestResponse"
} as $result
```

### Invocation Types

| Type | Description |
|------|-------------|
| `RequestResponse` | Synchronous, wait for response |
| `Event` | Asynchronous, fire and forget |
| `DryRun` | Validate without executing |

### Async Lambda

```xs
// Fire and forget
api.lambda {
  provider = "aws"
  region = "us-east-1"
  access_key = $env.AWS_ACCESS_KEY
  secret_key = $env.AWS_SECRET_KEY
  function_name = "send-notification"
  payload = { user_id: $user.id, message: "Welcome!" }
  invocation_type = "Event"
}
```

### With Timeout

```xs
api.lambda {
  provider = "aws"
  region = "us-east-1"
  access_key = $env.AWS_ACCESS_KEY
  secret_key = $env.AWS_SECRET_KEY
  function_name = "heavy-processing"
  payload = $input.data
  timeout = 60000
} as $result
```

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
