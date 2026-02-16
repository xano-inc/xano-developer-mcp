---
applyTo: "function/**/*.xs, api/**/*.xs, task/**/*.xs"
---

# External APIs

> **TL;DR:** Use `api.request` for HTTP requests to external APIs. The `params` parameter is for the **request body** (not query params). Response in `$result.response.result`.

## Quick Reference

```xs
api.request {
  url = "https://api.example.com/endpoint"
  method = "POST"                    // GET, POST, PUT, PATCH, DELETE
  params = $payload                  // Request body for POST/PUT/PATCH
  headers = ["Content-Type: application/json", "Authorization: Bearer " ~ $env.API_KEY]
  timeout = 30                       // Timeout in seconds
} as $api_result

// Access response
$api_result.response.status          // HTTP status code (200, 404, etc.)
$api_result.response.result          // Response body (auto-parsed JSON)
$api_result.response.headers         // Response headers array
```

> **Important:** The `params` parameter is used for the **request body** (POST/PUT/PATCH), not query parameters. This naming is counterintuitive but consistent across XanoScript.

> **Note:** The `headers` parameter expects an array of text strings, where each string contains the header name and value separated by a colon (e.g., `["Content-Type: application/json", "X-Custom-Header: value"]`).

---

## GET Request

```xs
api.request {
  url = "https://api.example.com/users?page=1&limit=10"
  method = "GET"
  headers = ["Authorization: Bearer " ~ $env.API_KEY]
} as $api_result

var $users { value = $api_result.response.result }
```

---

## POST Request with JSON Body

```xs
var $payload {
  value = {
    name: $input.name,
    email: $input.email
  }
}

api.request {
  url = "https://api.example.com/users"
  method = "POST"
  params = $payload
  headers = ["Content-Type: application/json", "Authorization: Bearer " ~ $env.API_KEY]
} as $api_result

// Check for success
precondition ($api_result.response.status == 201) {
  error_type = "standard"
  error = "Failed to create user: " ~ ($api_result.response.result|json_encode)
}
```

---

## Error Handling Pattern

```xs
api.request {
  url = "https://api.example.com/data"
  method = "GET"
  timeout = 30
} as $api_result

conditional {
  if ($api_result.response.status >= 200 && $api_result.response.status < 300) {
    var $data { value = $api_result.response.result }
  }
  elseif ($api_result.response.status == 404) {
    throw { name = "NotFound", value = "Resource not found" }
  }
  else {
    throw {
      name = "APIError",
      value = "API returned status " ~ ($api_result.response.status|to_text)
    }
  }
}
```

---

## Response Structure

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

---

## Accessing Response Data

```xs
api.request {
  url = "https://api.example.com/users"
  method = "GET"
} as $api_result

// Access the response body
var $data { value = $api_result.response.result }

// Check status code
precondition ($api_result.response.status == 200) {
  error_type = "standard"
  error = "API request failed"
}

// Access a specific header
var $content_type { value = $api_result.response.headers|first }
```

---

## Common Patterns

### Retry Logic

```xs
var $retries { value = 0 }
var $success { value = false }

while ($retries < 3 && $success == false) {
  try_catch {
    try {
      api.request {
        url = "https://api.example.com/data"
        method = "GET"
        timeout = 10
      } as $api_result

      conditional {
        if ($api_result.response.status == 200) {
          var.update $success { value = true }
        }
      }
    }
    catch {
      var.update $retries { value = $retries + 1 }
      util.sleep { value = 2 }
    }
  }
}
```

### Webhook Callback

```xs
api.request {
  url = $env.WEBHOOK_URL
  method = "POST"
  params = {
    event: "order.created",
    data: $order,
    timestamp: now
  }
  headers = [
    "Content-Type: application/json",
    "X-Webhook-Signature: " ~ $signature
  ]
}
```

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `syntax` | Error handling with try_catch |
| `integrations/utilities` | Lambda invocation |
| `integrations` | All integrations index |
