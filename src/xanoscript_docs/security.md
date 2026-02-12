---
applyTo: "function/**/*.xs, api/**/*.xs"
---

# Security

Best practices for building secure XanoScript applications.

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

```xs
function "refresh_auth" {
  input {
    text refresh_token
  }
  stack {
    // Verify refresh token
    db.query "refresh_token" {
      where = $db.refresh_token.token == $input.refresh_token
            && $db.refresh_token.expires_at > now
            && $db.refresh_token.revoked == false
      return = { type: "single" }
    } as $stored_token

    precondition ($stored_token != null) {
      error_type = "accessdenied"
      error = "Invalid or expired refresh token"
    }

    // Get user
    db.get "user" {
      field_name = "id"
      field_value = $stored_token.user_id
    } as $user

    // Generate new access token
    security.create_auth_token {
      table = "user"
      id = $user.id
      extras = { role: $user.role }
      expiration = 3600
    } as $new_token

    // Rotate refresh token
    var $new_refresh { value = |uuid }

    db.edit "refresh_token" {
      field_name = "id"
      field_value = $stored_token.id
      data = {
        token: $new_refresh,
        expires_at: now|transform_timestamp:"+30 days"
      }
    }
  }
  response = {
    access_token: $new_token,
    refresh_token: $new_refresh
  }
}
```

### Session Management

```xs
function "create_session" {
  input { int user_id }
  stack {
    var $session_id { value = |uuid }

    db.add "session" {
      data = {
        id: $session_id,
        user_id: $input.user_id,
        ip_address: $env.$remote_ip,
        user_agent: $env.$http_headers|get:"user-agent",
        created_at: now,
        last_activity: now,
        expires_at: now|transform_timestamp:"+7 days"
      }
    }
  }
  response = $session_id
}

function "validate_session" {
  input { text session_id }
  stack {
    db.query "session" {
      where = $db.session.id == $input.session_id
            && $db.session.expires_at > now
      return = { type: "single" }
    } as $session

    precondition ($session != null) {
      error_type = "accessdenied"
      error = "Invalid or expired session"
    }

    // Update last activity
    db.edit "session" {
      field_name = "id"
      field_value = $session.id
      data = { last_activity: now }
    }
  }
  response = $session
}
```

### Multi-Factor Authentication

```xs
function "verify_mfa" {
  input {
    int user_id
    text code filters=digitOk|min:6|max:6
  }
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    // Verify TOTP code
    security.verify_totp {
      secret = $user.mfa_secret
      code = $input.code
      window = 1
    } as $is_valid

    precondition ($is_valid) {
      error_type = "accessdenied"
      error = "Invalid MFA code"
    }
  }
  response = { verified: true }
}
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
function "check_permission" {
  input {
    text permission
  }
  stack {
    var $has_permission {
      value = $auth.permissions|contains:$input.permission
    }

    precondition ($has_permission) {
      error_type = "accessdenied"
      error = "Missing permission: " ~ $input.permission
    }
  }
}

// Usage
function.run "check_permission" {
  input = { permission: "users.delete" }
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

```xs
function "can_access_resource" {
  input {
    int resource_id
    text action
  }
  stack {
    // Check direct ownership
    db.query "resource" {
      where = $db.resource.id == $input.resource_id
            && $db.resource.owner_id == $auth.id
      return = { type: "exists" }
    } as $is_owner

    // Check team membership
    db.query "team_member" {
      join = {
        resource: {
          table: "resource",
          where: $db.resource.team_id == $db.team_member.team_id
        }
      }
      where = $db.resource.id == $input.resource_id
            && $db.team_member.user_id == $auth.id
      return = { type: "exists" }
    } as $is_team_member

    // Check permissions
    var $can_access {
      value = $is_owner || ($is_team_member && $input.action != "delete")
    }
  }
  response = $can_access
}
```

---

## Input Validation

### Type Enforcement

```xs
input {
  email email filters=trim|lower
  text password filters=min:8|max:128
  int age filters=min:0|max:150
  text username filters=trim|lower|min:3|max:20|alphaNumOk
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

### XSS Prevention

```xs
// Escape HTML content before storage or display
var $safe_content {
  value = $input.content|escape
}

// For rich text, use allowlist sanitization
var $sanitized {
  value = $input.html|html_sanitize:["p", "b", "i", "a"]
}
```

### Path Traversal Prevention

```xs
// Validate file paths
precondition (!($input.filename|contains:"..")) {
  error_type = "inputerror"
  error = "Invalid filename"
}

precondition ($input.filename|regex_matches:"/^[a-zA-Z0-9_.-]+$/") {
  error_type = "inputerror"
  error = "Filename contains invalid characters"
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

### Encryption at Rest

```xs
// Encrypt sensitive data before storage
security.encrypt {
  data = $input.ssn
  algorithm = "aes-256-cbc"
  key = $env.ENCRYPTION_KEY
  iv = $env.ENCRYPTION_IV
} as $encrypted_ssn

db.add "user" {
  data = { ssn_encrypted: $encrypted_ssn }
}

// Decrypt when needed
security.decrypt {
  data = $user.ssn_encrypted
  algorithm = "aes-256-cbc"
  key = $env.ENCRYPTION_KEY
  iv = $env.ENCRYPTION_IV
} as $ssn
```

### Secrets Management

```xs
// Store secrets in environment variables
$env.API_SECRET_KEY
$env.DATABASE_URL
$env.ENCRYPTION_KEY

// NEVER hardcode secrets
// api_key = "sk_live_abc123"  // BAD

// Mark sensitive inputs
input {
  text api_key {
    sensitive = true                       // Masked in logs
  }
}
```

### JWT Security

```xs
// Sign with strong algorithm
security.jws_encode {
  claims = {
    sub: $user.id|to_text,
    role: $user.role,
    iat: now|to_seconds,
    exp: (now|to_seconds) + 3600
  }
  key = $env.JWT_SECRET
  signature_algorithm = "HS256"
} as $token

// Verify with algorithm check
security.jws_decode {
  token = $input.token
  key = $env.JWT_SECRET
  signature_algorithm = "HS256"
} as $claims
```

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

```xs
function "check_login_attempts" {
  input { text email }
  stack {
    var $key { value = "login_attempts:" ~ $input.email|md5 }

    redis.get { key = $key } as $attempts

    precondition (($attempts|to_int ?? 0) < 5) {
      error_type = "accessdenied"
      error = "Too many login attempts. Try again in 15 minutes."
    }
  }
}

function "record_failed_login" {
  input { text email }
  stack {
    var $key { value = "login_attempts:" ~ $input.email|md5 }
    redis.incr { key = $key, by = 1 }
    redis.expire { key = $key, ttl = 900 }
  }
}

function "clear_login_attempts" {
  input { text email }
  stack {
    redis.del { key = "login_attempts:" ~ $input.email|md5 }
  }
}
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

### Log Security Events

```xs
function "audit_log" {
  input {
    text action
    text resource_type
    int? resource_id
    json? details
  }
  stack {
    db.add "audit_log" {
      data = {
        user_id: $auth.id,
        action: $input.action,
        resource_type: $input.resource_type,
        resource_id: $input.resource_id,
        details: $input.details,
        ip_address: $env.$remote_ip,
        user_agent: $env.$http_headers|get:"user-agent",
        created_at: now
      }
    }
  }
}

// Usage
function.run "audit_log" {
  input = {
    action: "delete",
    resource_type: "user",
    resource_id: $deleted_user.id,
    details: { reason: $input.reason }
  }
}
```

---

## Best Practices Summary

1. **Validate all inputs** - Use types and filters
2. **Check authorization** - Verify permissions for every operation
3. **Use parameterized queries** - Never concatenate user input into SQL
4. **Hash passwords** - Use built-in password type
5. **Encrypt sensitive data** - SSN, payment info, etc.
6. **Store secrets in env vars** - Never hardcode
7. **Rate limit APIs** - Prevent abuse
8. **Log security events** - Audit trail for compliance
9. **Use HTTPS** - Always (handled by platform)
10. **Rotate tokens** - Implement refresh token flow
