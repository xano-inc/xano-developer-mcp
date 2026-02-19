---
applyTo: "function/**/*.xs, api/**/*.xs, task/**/*.xs"
---

# Search Integrations

> **TL;DR:** `cloud.elasticsearch.*` for Elasticsearch, `cloud.aws.opensearch.*` for AWS OpenSearch, `cloud.algolia.*` for Algolia. Full-text search, document operations, and bulk indexing.

## Quick Reference

| Provider | Prefix | Operations |
|----------|--------|------------|
| Elasticsearch | `cloud.elasticsearch.*` | query, document, request, bulk |
| AWS OpenSearch | `cloud.aws.opensearch.*` | query, document, request |
| Algolia | `cloud.algolia.*` | search, request, save_object, save_objects, delete_object, set_settings |

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

### Raw Request

```xs
cloud.elasticsearch.request {
  auth_type = "API Key"
  key_id = $env.ES_KEY_ID
  access_key = $env.ES_ACCESS_KEY
  method = "GET"
  url = "https://my-cluster.es.io/posts/_search"
  query = { query: { match: { category: "tech" } } }
} as $search_results
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

// Raw request
cloud.aws.opensearch.request {
  auth_type = "IAM"
  key_id = $env.AWS_ACCESS_KEY
  access_key = $env.AWS_SECRET_KEY
  region = "us-east-1"
  method = "POST"
  url = "https://search-domain.us-east-1.es.amazonaws.com/_search"
  query = { query: { term: { status: "active" } } }
} as $active_items

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

### Raw Request

```xs
cloud.algolia.request {
  application_id = $env.ALGOLIA_APP_ID
  api_key = $env.ALGOLIA_API_KEY
  url = "https://my-algolia-app.algolia.net/1/indexes/posts/query"
  method = "POST"
  payload = { query: "tech" }
} as $tech_posts
```

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

## Related Topics

| Topic | Description |
|-------|-------------|
| `database` | Built-in database queries |
| `integrations` | All integrations index |
| `performance` | Caching search results |
