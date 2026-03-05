---
applyTo: "static/**/*"
---

# Frontend

Static frontend development with Xano APIs.

## Quick Reference

### Directory Structure
```
static/
├── index.html              // Main entry point
├── css/
├── js/
│   └── api.js              // Centralized API calls
└── assets/
```

### Key Tools
| Tool | Purpose |
|------|---------|
| `get_xano_api_specifications` | Get OpenAPI specs before frontend work |
| `upload_static_files_to_xano` | Deploy to Xano CDN |

---

## Base Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My App</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
  <div id="app"></div>
  <script src="js/api.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

---

## API Client

### Basic Setup (api.js)
```javascript
const API_BASE = 'https://your-instance.xano.io/api:group';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// CRUD helpers
const api = {
  get: (endpoint) => apiCall(endpoint),
  post: (endpoint, data) => apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  patch: (endpoint, data) => apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' })
};
```

---

## Authentication

### Login
```javascript
async function login(email, password) {
  const { authToken } = await api.post('/auth/login', { email, password });
  localStorage.setItem('auth_token', authToken);
  return authToken;
}
```

### Signup
```javascript
async function signup(email, password, name) {
  const { authToken } = await api.post('/auth/signup', {
    email, password, name
  });
  localStorage.setItem('auth_token', authToken);
  return authToken;
}
```

### Logout
```javascript
function logout() {
  localStorage.removeItem('auth_token');
  window.location.href = '/login.html';
}
```

### Get Current User
```javascript
async function getCurrentUser() {
  return api.get('/auth/me');
}
```

---

## Deployment

Deploy static files to Xano CDN:

```
invoke upload_static_files_to_xano
```

The tool will:
1. Bundle files from `static/`
2. Upload to Xano CDN
3. Return hosted URL

---

## Best Practices

1. **Get API specs first** - Use `get_xano_api_specifications` before coding
2. **Centralize API calls** - Single `api.js` file
3. **Store tokens securely** - localStorage for web, secure storage for mobile

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `apis` | Backend API endpoints |
| `workspace` | Workspace configuration |
| `security` | CORS and authentication |
