---
applyTo: "function/**/*.xs, api/**/*.xs, task/**/*.xs"
---

# Cloud Storage Integrations

> **TL;DR:** `cloud.aws.s3.*` for AWS, `cloud.azure.storage.*` for Azure, `cloud.google.storage.*` for GCP. All support upload, read, delete, and signed URLs.

## Quick Reference

| Provider | Prefix | Operations |
|----------|--------|------------|
| AWS S3 | `cloud.aws.s3.*` | upload_file, read_file, sign_url, list_directory, delete_file |
| Azure Blob | `cloud.azure.storage.*` | upload_file, read_file, sign_url |
| Google Cloud | `cloud.google.storage.*` | upload_file, read_file, sign_url |

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

## Related Topics

| Topic | Description |
|-------|-------------|
| `streaming` | Streaming large files |
| `integrations` | All integrations index |
| `integrations/utilities` | Local storage operations |
