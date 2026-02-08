---
applyTo: "workspace.xs"
---

# Workspace Configuration

Configure workspace-level settings including environment variables, preferences, and realtime configuration.

## Quick Reference

```xs
workspace "<name>" {
  description = "Workspace description"
  env = { ... }
  acceptance = { ... }
  preferences = { ... }
  realtime = { ... }
}
```

### Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | text | No | Human-readable workspace description |
| `env` | object | No | Environment variable definitions |
| `acceptance` | object | No | Terms and acceptance settings |
| `preferences` | object | No | Workspace behavior preferences |
| `realtime` | object | No | Realtime channel configuration |

---

## Basic Structure

```xs
workspace "my_project" {
  description = "My XanoScript project workspace"
}
```

---

## Environment Variables

Define environment variables accessible via `$env.<name>` in your code.

```xs
workspace "my_project" {
  env = {
    API_KEY: "your-api-key",
    DATABASE_URL: "postgresql://...",
    REDIS_URL: "redis://...",
    ENVIRONMENT: "production"
  }
}
```

### Accessing Environment Variables

```xs
// In any function, query, or task
stack {
  var $key { value = $env.API_KEY }

  api.call "external_api" {
    url = $env.DATABASE_URL ~ "/endpoint"
    headers = {
      "Authorization": "Bearer " ~ $env.API_KEY
    }
  }
}
```

---

## Acceptance Settings

Configure terms and acceptance requirements.

```xs
workspace "my_project" {
  acceptance = {
    ai_terms: true
  }
}
```

### Acceptance Options

| Option | Type | Description |
|--------|------|-------------|
| `ai_terms` | boolean | Accept AI feature terms of service |

---

## Preferences

Configure workspace behavior and features.

```xs
workspace "my_project" {
  preferences = {
    internal_docs: true,
    sql_columns: true,
    sql_names: true,
    track_performance: true
  }
}
```

### Preference Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `internal_docs` | boolean | false | Enable internal documentation generation |
| `sql_columns` | boolean | false | Include SQL column names in output |
| `sql_names` | boolean | false | Include SQL table names in output |
| `track_performance` | boolean | false | Enable performance tracking and metrics |

---

## Realtime Configuration

Configure realtime channel settings.

```xs
workspace "my_project" {
  realtime = {
    canonical: "my-project"
  }
}
```

### Realtime Options

| Option | Type | Description |
|--------|------|-------------|
| `canonical` | text | Base URL path for realtime channels |

---

## Complete Example

```xs
workspace "ecommerce_platform" {
  description = "E-commerce backend workspace"

  env = {
    STRIPE_KEY: "sk_live_...",
    SENDGRID_KEY: "SG...",
    AWS_REGION: "us-east-1",
    S3_BUCKET: "ecommerce-assets",
    REDIS_URL: "redis://cache.example.com:6379"
  }

  acceptance = {
    ai_terms: true
  }

  preferences = {
    internal_docs: true,
    track_performance: true
  }

  realtime = {
    canonical: "ecommerce"
  }
}
```

---

## File Location

Workspace configuration is stored in `workspace.xs` at the root of your project.

```
project/
├── workspace.xs           // Workspace configuration
├── branch.xs              // Branch configuration
├── tables/
├── functions/
└── apis/
```

---

## Built-in Environment Variables

These variables are automatically available without configuration:

| Variable | Description |
|----------|-------------|
| `$env.$remote_ip` | Client IP address |
| `$env.$http_headers` | Request headers array |
| `$env.$request_uri` | Request URI |
| `$env.$request_method` | HTTP method (GET, POST, etc.) |
| `$env.$request_querystring` | Query string |
| `$env.$datasource` | Current datasource |
| `$env.$branch` | Current branch name |

---

## Best Practices

1. **Never commit secrets** - Use environment variables for API keys and credentials
2. **Use descriptive names** - Environment variable names should be self-documenting
3. **Enable performance tracking** - Helps identify bottlenecks in production
4. **Set meaningful canonical paths** - Makes realtime channel URLs predictable
5. **Document your workspace** - Use the description field for team reference
