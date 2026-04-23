---
applyTo: "function/**/*.xs, api/**/*.xs"
---

# Security

Best practices for building secure XanoScript applications.

> **TL;DR:** Always check `$auth.id` for protected endpoints. Use `security.create_auth_token` for JWT. Validate all inputs with `filters=`. Hash passwords with `password` type. Use `$env.SECRET_NAME` for secrets.

## Quick Reference

| Area | Key Practices |
|------|---------------|
| Authentication | Tokens, sessions, MFA |
| Authorization | Role checks, resource ownership |
| Input Validation | Type enforcement, sanitization |
| Data Protection | Encryption, hashing, secrets |

---

## Authentication

### Auth Token Generation

```xs
security.create_auth_token {
  table = "user"
  id = $user.id
  extras = {
    role: $user.role,
    permissions: $user.permissions
  }
  expiration = 86400                      // 24 hours
} as $token
```

**Note:** The `extras` parameter is required even if you don't need to store additional claims (`extras = { }`).

### Token Verification

```xs
// $auth is automatically populated from valid token
precondition ($auth.id != null) {
  error_type = "accessdenied"
  error = "Authentication required"
}
```

### Refresh Tokens

Pattern: Store refresh tokens in a `refresh_token` table. On refresh, verify the token hasn't expired or been revoked, generate a new access token via `security.create_auth_token`, rotate the refresh token with `security.create_uuid`, and update the stored token.

```xs
// Key operations in a refresh flow:
db.query "refresh_token" {
  where = $db.refresh_token.token == $input.refresh_token && $db.refresh_token.expires_at > now && $db.refresh_token.revoked == false
  return = { type: "single" }
} as $stored_token

security.create_auth_token {
  table = "user"
  id = $user.id
  extras = { role: $user.role }
  expiration = 3600
} as $new_token
```

### Session Management

Pattern: Use `security.create_uuid` for session IDs. Store in a `session` table with `user_id`, `ip_address` (`$env.$remote_ip`), `expires_at`, and `last_activity`. Validate by querying where `expires_at > now`.

```xs
// Create session
security.create_uuid as $session_id
db.add "session" {
  data = {
    id: $session_id,
    user_id: $input.user_id,
    expires_at: now|transform_timestamp:"+7 days"
  }
}

// Validate session
db.query "session" {
  where = $db.session.id == $input.session_id && $db.session.expires_at > now
  return = { type: "single" }
} as $session
```

---

## Authorization

### Role-Based Access Control

```xs
precondition ($auth.role == "admin") {
  error_type = "accessdenied"
  error = "Admin access required"
}
```

### Permission Checks

```xs
precondition ($auth.permissions|contains:"users.delete") {
  error_type = "accessdenied"
  error = "Missing permission: users.delete"
}
```

### Resource Ownership

```xs
// Verify user owns the resource
db.get "document" {
  field_name = "id"
  field_value = $input.document_id
} as $document

precondition ($document.owner_id == $auth.id) {
  error_type = "accessdenied"
  error = "You do not own this document"
}
```

### Hierarchical Access

Check ownership first, then team membership via `join`. Combine with action-specific logic:

```xs
db.query "resource" {
  where = $db.resource.id == $input.resource_id && $db.resource.owner_id == $auth.id
  return = { type: "exists" }
} as $is_owner

db.query "team_member" {
  join = { resource: { table: "resource", where: $db.resource.team_id == $db.team_member.team_id } }
  where = $db.resource.id == $input.resource_id && $db.team_member.user_id == $auth.id
  return = { type: "exists" }
} as $is_team_member
```

---

## Input Validation

### Type Enforcement

```xs
input {
  email email filters=trim|lower
  text password filters=min:8|max:128
  int age filters=min:0|max:150
  text username filters=trim|lower|min:3|max:20|alphaOk|digitOk
}
```

### SQL Injection Prevention

```xs
// Safe: Use parameterized queries (default behavior)
db.query "user" {
  where = $db.user.email == $input.email
} as $user

// If using direct_query, use arg parameter
db.direct_query {
  sql = "SELECT * FROM users WHERE email = ? AND status = ?"
  arg = [$input.email, "active"]
} as $users

// NEVER: String concatenation in SQL
// sql = "SELECT * FROM users WHERE email = '" ~ $input.email ~ "'"
```

### XSS / Path Traversal Prevention

```xs
var $safe_content { value = $input.content|escape }             // Escape HTML

precondition (!($input.filename|contains:"..")) {               // Validate paths
  error_type = "inputerror"
  error = "Invalid filename"
}
```

---

## Data Protection

### Password Hashing

```xs
// Passwords are automatically hashed when using password type
db.add "user" {
  data = {
    email: $input.email,
    password: $input.password              // Auto-hashed
  }
}

// Verify password
security.check_password {
  text_password = $input.password
  hash_password = $user.password
} as $is_valid
```

### Encryption

```xs
// Encrypt/decrypt sensitive data
security.encrypt {
  data = $input.ssn
  algorithm = "aes-256-cbc"
  key = $env.ENCRYPTION_KEY
  iv = $env.ENCRYPTION_IV
} as $encrypted

security.decrypt {
  data = $encrypted
  algorithm = "aes-256-cbc"
  key = $env.ENCRYPTION_KEY
  iv = $env.ENCRYPTION_IV
} as $decrypted
```

### Secrets Management

```xs
// Use $env for secrets — NEVER hardcode
$env.API_SECRET_KEY
$env.ENCRYPTION_KEY

// Mark sensitive inputs
input {
  text api_key { sensitive = true }       // Masked in logs
}
```

### JWT (JWS/JWE)

```xs
// Sign JWT
security.jws_encode {
  claims = { sub: $user.id|to_text, role: $user.role }
  key = $env.JWT_SECRET
  signature_algorithm = "HS256"
} as $token

// Verify JWT
security.jws_decode {
  token = $input.token
  key = $env.JWT_SECRET
  signature_algorithm = "HS256"
} as $claims
```

> See `xanoscript_docs({ topic: "integrations/utilities" })` for JWE, key generation, and other security utilities.

---

## Rate Limiting & Abuse Prevention

### API Rate Limiting

```xs
redis.ratelimit {
  key = "api:" ~ $auth.id
  max = 100
  ttl = 60
  error = "Rate limit exceeded"
}
```

### Login Attempt Limiting

Use Redis to track failed attempts per email with a TTL-based lockout:

```xs
var $key { value = "login_attempts:" ~ $input.email|md5 }
redis.get { key = $key } as $attempts

precondition (($attempts|to_int ?? 0) < 5) {
  error_type = "accessdenied"
  error = "Too many login attempts. Try again in 15 minutes."
}

// On failure: redis.set { key = $key, data = ($attempts|to_int ?? 0) + 1, ttl = 900 }
// On success: redis.del { key = $key }
```

### Request Size Limits

```xs
// Enforce in input validation
input {
  text content filters=max:10000
  file upload filters=max_size:10485760   // 10MB
}
```

---

## Security Headers

### CORS Configuration

Configure CORS in API settings. For dynamic CORS:

```xs
// Validate origin
var $allowed_origins { value = ["https://app.example.com", "https://admin.example.com"] }

precondition ($allowed_origins|contains:$env.$http_headers|get:"origin") {
  error_type = "accessdenied"
  error = "Origin not allowed"
}
```

---

## Audit Logging

Log security events to an `audit_log` table with `user_id` (`$auth.id`), `action`, `resource_type`, `ip_address` (`$env.$remote_ip`), and `created_at`.

```xs
db.add "audit_log" {
  data = {
    user_id: $auth.id,
    action: $input.action,
    resource_type: $input.resource_type,
    ip_address: $env.$remote_ip,
    created_at: now
  }
}
```

---

## Best Practices Summary

1. **Validate all inputs** - Use types and filters; never concatenate user input into SQL
2. **Check authorization** - Verify `$auth.id` and permissions for every operation
3. **Store secrets in env vars** - Never hardcode; use `$env.SECRET_NAME`

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `apis` | Endpoint authentication |
| `types` | Input validation |
| `middleware` | Request interceptors |
| `integrations/redis` | Rate limiting |
