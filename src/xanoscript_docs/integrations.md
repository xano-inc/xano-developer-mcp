---
applyTo: "function/**/*.xs, api/**/*.xs, task/**/*.xs"
---

# Integrations

> **TL;DR:** External service integrations. Use specific sub-topics for detailed documentation.

## Integration Topics

| Topic | Command | Contents |
|-------|---------|----------|
| Cloud Storage | `xanoscript_docs({ topic: "integrations/cloud-storage" })` | AWS S3, Azure Blob, GCP Storage |
| Search | `xanoscript_docs({ topic: "integrations/search" })` | Elasticsearch, OpenSearch, Algolia |
| Redis | `xanoscript_docs({ topic: "integrations/redis" })` | Caching, rate limiting, queues |
| External APIs | `xanoscript_docs({ topic: "integrations/external-apis" })` | api.request patterns |
| Utilities | `xanoscript_docs({ topic: "integrations/utilities" })` | Local storage, security, email, zip, Lambda |

---

## Quick Reference

### By Task

| Task | Operation | Sub-topic |
|------|-----------|-----------|
| Upload to S3 | `cloud.aws.s3.upload_file` | cloud-storage |
| Upload to Azure | `cloud.azure.storage.upload_file` | cloud-storage |
| Upload to GCP | `cloud.google.storage.upload_file` | cloud-storage |
| Search Elasticsearch | `cloud.elasticsearch.query` | search |
| Search Algolia | `cloud.algolia.search` | search |
| Cache value | `redis.set` / `redis.get` | redis |
| Rate limit | `redis.ratelimit` | redis |
| HTTP request | `api.request` | external-apis |
| Send email | `util.send_email` | utilities |
| Create ZIP | `zip.create_archive` | utilities |
| Invoke Lambda | `api.lambda` | utilities |
| Hash password | `security.check_password` | utilities |
| Sign JWT | `security.jws_encode` | utilities |

### By Prefix

| Prefix | Purpose | Sub-topic |
|--------|---------|-----------|
| `cloud.aws.s3.*` | AWS S3 storage | cloud-storage |
| `cloud.azure.storage.*` | Azure Blob storage | cloud-storage |
| `cloud.google.storage.*` | GCP Storage | cloud-storage |
| `cloud.elasticsearch.*` | Elasticsearch | search |
| `cloud.aws.opensearch.*` | AWS OpenSearch | search |
| `cloud.algolia.*` | Algolia search | search |
| `redis.*` | Redis caching | redis |
| `api.request` | External HTTP | external-apis |
| `api.lambda` | Lambda | utilities |
| `storage.*` | Local storage | utilities |
| `security.*` | Security operations | utilities |
| `zip.*` | Archive operations | utilities |
| `util.*` | Utilities | utilities |

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `streaming` | Streaming from files and requests |
| `database` | Database operations |
| `performance` | Caching strategies |
