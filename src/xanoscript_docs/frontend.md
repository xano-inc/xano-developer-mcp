---
applyTo: "static/**/*"
---

# Frontend

Static frontend development and Lovable/Supabase migration.

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

## Lovable Migration

Migrate from Supabase to Xano using the compatibility SDK.

### 1. Install SDK
```bash
npm install @xano/supabase-compat
```

### 2. Create Xano Client
```typescript
// src/integrations/xano/client.ts
import { createClient } from '@xano/supabase-compat';

export const xano = createClient(
  import.meta.env.VITE_XANO_URL,
  import.meta.env.VITE_XANO_AUTH_ENDPOINT,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
```

### 3. Update Environment
```env
VITE_XANO_URL=https://your-instance.xano.io
VITE_XANO_AUTH_ENDPOINT=/api:groupId/auth
```

### 4. Update Auth Hooks

Before (Supabase):
```typescript
import { supabase } from '@/integrations/supabase/client';

supabase.auth.signInWithPassword({ email, password });
supabase.auth.signUp({ email, password });
supabase.auth.signOut();
```

After (Xano):
```typescript
import { xano } from '@/integrations/xano/client';

xano.auth.signInWithPassword({ email, password });
xano.auth.signUp({ email, password });
xano.auth.signOut();
```

### 5. Update Data Hooks

Before (Supabase):
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'electronics')
  .order('created_at', { ascending: false });
```

After (Xano):
```typescript
const { data, error } = await xano
  .endpoint('/api:group/products')
  .get({
    category: 'electronics',
    sort: 'created_at',
    order: 'desc'
  });
```

---

## Common Patterns

### Pagination
```javascript
async function getProducts(page = 1, perPage = 20) {
  return api.get(`/products?page=${page}&per_page=${perPage}`);
}
```

### Filtering
```javascript
async function searchProducts(query, category) {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (category) params.append('category', category);
  return api.get(`/products?${params}`);
}
```

### File Upload
```javascript
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: formData
  });

  return response.json();
}
```

---

## Migration Checklist

### Backend (Xano)
- [ ] Create tables matching Supabase schema
- [ ] Create CRUD endpoints for each resource
- [ ] Set up authentication endpoints
- [ ] Push changes: `push_all_changes_to_xano`
- [ ] Get API specs: `get_xano_api_specifications`

### Frontend
- [ ] Install `@xano/supabase-compat`
- [ ] Create Xano client
- [ ] Update environment variables
- [ ] Update auth hooks (minimal changes)
- [ ] Update data fetching (table → endpoint)
- [ ] Test all operations
- [ ] Remove Supabase dependencies

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
4. **Test incrementally** - Migrate one feature at a time
