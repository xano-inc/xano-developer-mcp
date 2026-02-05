## Using Xano with Lovable Projects (Agent Instructions)

Goal: Migrate a Lovable-generated project from Supabase to Xano using the SDK, while keeping the frontend behavior equivalent. Follow the steps in order. Use the listed tools where marked REQUIRED.

References:

- Tables: `table_guideline.md`, `table_examples.md`
- Functions: `function_guideline.md`, `function_examples.md`
- APIs: `api_query_guideline.md`, `api_query_examples.md`
- DB Queries: `db_query_guideline.md`
- Tips: `tips_and_tricks.md`

Tools you may need:

- REQUIRED during frontend work: `get_xano_api_specifications`
- REQUIRED when syncing backend: `push_all_changes_to_xano`
- Optional for safe experiments: `publish_ephemeral_environment`

### 1. Install the Adapter

In your Lovable project directory:

```bash
npm install @xano/supabase-compat
```

### 2. Create Xano Client

Create `src/integrations/xano/client.ts`:

```typescript
import { createClient } from "@xano/supabase-compat";

export const xano = createClient(
  import.meta.env.VITE_XANO_URL,
  import.meta.env.VITE_XANO_AUTH_ENDPOINT, // e.g., '/api:qoUCtLER/auth'
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

How to find your auth endpoint:

1. In Xano, go to your Authentication API group
2. Look at any auth endpoint (login, signup, me)
3. The path will be like `/api:qoUCtLER/auth/login` or `/api:qoUCtLER/auth/signup` or `/api:qoUCtLER/auth/me`
4. Your auth endpoint is `/api:qoUCtLER/auth` (everything before `/login`, make sure you include the `/auth` part)

### 3. Update Environment Variables

In your `.env` file:

```env
# Add these
VITE_XANO_URL=https://your-instance.xano.io
VITE_XANO_AUTH_ENDPOINT=/api:qoUCtLER/auth  # Replace qoUCtLER with your API group ID

# Keep Supabase vars during migration (optional)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### 4. Update useAuth Hook

Before (`src/hooks/useAuth.ts`):

```typescript
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  // ... rest of the code
  supabase.auth.onAuthStateChange(...)
  supabase.auth.getSession()
}
```

After:

```typescript
import { xano } from "@/integrations/xano/client";

export function useAuth() {
  // ... exact same code!
  xano.auth.onAuthStateChange(...)
  xano.auth.getSession()
}
```

### 5. Update Data Hooks

This is where you'll need to map Supabase table queries to Xano endpoints.

Before (`src/hooks/useChores.ts`):

```typescript
import { supabase } from "@/integrations/supabase/client";

const loadData = async () => {
  const { data: choresData, error } = await supabase
    .from("chores")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
};
```

After:

```typescript
import { xano } from "@/integrations/xano/client";

const loadData = async () => {
  const { data: choresData, error } = await xano
    .endpoint("/api:your-api/chores")
    .get({
      user_id: user.id,
      sort: "created_at",
      order: "desc",
    });
};
```

### 6. Update Components

AuthForm.tsx — Minimal changes:

```typescript
// Before
import { supabase } from "@/integrations/supabase/client";

const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { display_name: displayName } },
});

// After
import { xano } from "@/integrations/xano/client";

const { error } = await xano.auth.signUp({
  email,
  password,
  options: { data: { display_name: displayName } },
});
```

## Backend Work in Xano (Tables + Endpoints)

Follow this section before or alongside the frontend changes.

1. Extract schema from the Lovable project (if available)

- If the project has Supabase types (e.g., `static/src/integrations/supabase/types.ts`), list tables, fields, and relationships.
- Use `int` for primary keys; Xano does not support string primary keys.
- Avoid creating cross-table references until all base tables exist; add relationships after tables are created.

2. Create or edit Xano Tables

- Create tables as per extracted schema (see table guidelines).

3. Create Xano Endpoints

- Create CRUD endpoints that match your required frontend operations (see API guidelines).
- Implement filtering/sorting/pagination via inputs as needed.

4. REQUIRED — Push backend changes to Xano

- Invoke `push_all_changes_to_xano` to ensure backend is in sync before frontend work.

For each Supabase table operation, create a corresponding Xano endpoint:

### Example: Chores CRUD

1. List Chores (`GET /api:xxx/chores`)

```
Inputs:
- user_id (number)
- sort (text, optional)
- order (text, optional)

Function:
- Query chores table
- Filter by user_id
- Order by sort field
- Return results
```

2. Create Chore (`POST /api:xxx/chores`)

```
Inputs:
- title (text)
- description (text)
- points (number)
- user_id (number)

Function:
- Insert into chores table
- Return created record
```

3. Update Chore (`PATCH /api:xxx/chores/{chore_id}`)

```
Inputs:
- chore_id (number, from path)
- completed (boolean)
- completed_at (datetime)

Function:
- Update chore record
- Return updated record
```

4. Delete Chore (`DELETE /api:xxx/chores/{chore_id}`)

```
Inputs:
- chore_id (number, from path)

Function:
- Delete from chores table
- Return success message
```

## Frontend Work (SDK + Mapping)

Before modifying frontend calls, perform this step:

- REQUIRED — Pull current API specs from Xano
  - Invoke `get_xano_api_specifications` to retrieve latest endpoints, groups, and base URLs.
  - Use the returned auth API group path for `VITE_XANO_AUTH_ENDPOINT`.

Then implement the SDK client, update `useAuth` import, and map data hooks to the Xano endpoints you created.

## Migration Checklist (Agent)

- [ ] Install `@xano/supabase-compat`
- [ ] Create Xano account and workspace
- [ ] Set up authentication in Xano (signup, login, me endpoints)
- [ ] Create database tables in Xano
- [ ] Create CRUD endpoints for each resource
- [ ] Create `src/integrations/xano/client.ts`
- [ ] Update `.env` with `VITE_XANO_URL`
- [ ] REQUIRED: Invoke `push_all_changes_to_xano` after backend edits
- [ ] REQUIRED: Invoke `get_xano_api_specifications` before frontend edits
- [ ] Update `useAuth` hook (change import)
- [ ] Update data hooks (map tables to endpoints)
- [ ] Update components (change imports)
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Remove Supabase dependencies (optional)

## Common Patterns

### Pagination

Lovable/Supabase:

```typescript
.from('chores')
.select('*')
.range(0, 9)
```

Xano:

```typescript
.endpoint('/api:xxx/chores')
.get({ page: 1, per_page: 10 })
```

### Filtering

Lovable/Supabase:

```typescript
.from('chores')
.select('*')
.eq('user_id', userId)
.eq('completed', false)
```

Xano:

```typescript
.endpoint('/api:xxx/chores')
.get({
  user_id: userId,
  completed: false
})
```

### Insert

Lovable/Supabase:

```typescript
.from('chores')
.insert({ title, points, user_id })
.select()
.single()
```

Xano:

```typescript
.endpoint('/api:xxx/chores')
.post({ title, points, user_id })
```

## Tips (Agent)

1. Start with Auth: Get authentication working first — it's nearly identical!
2. One Resource at a Time: Migrate one data resource at a time
3. Keep Supabase During Migration: You can use both simultaneously
4. Test Thoroughly: Test each endpoint as you create it in Xano
5. Look for and convert all edge functions or custom queries into Xano queries (check the `static/supabase/functions` folder if available)
6. Optional: Use `run_xano_function` to test functions directly from VSCode within your Xano workspace context.

## Example: Complete Lovable Migration

You'll find a series of examples in the `supabase-compat` package, under the `examples/` (`node_modules/@xano/supabase-compat/examples/`) directory demonstrating Lovable projects migrated to Xano.

## Need Help?

- Check the main README for API reference
- Review the migration guide for detailed steps
- See comparison docs for side-by-side code examples
- Open an issue on GitHub

---

# Migration Guide: Supabase to Xano

This guide helps you migrate from Supabase to Xano using the Xano SDK. Follow in order. Use REQUIRED tools where indicated.

## Overview

Architectural differences:

- Supabase: Direct database access via PostgREST (table-based)
- Xano: API endpoints with backend logic (endpoint-based)

## Step-by-Step Migration

### 1. Install the Xano SDK

```bash
npm install @xano/supabase-compat
```

Optional: If you want to remove Supabase dependencies:

```bash
npm uninstall @supabase/supabase-js
```

### 2. Update Client Initialization

Before (Supabase):

```typescript
// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

After (Xano):

```typescript
// src/integrations/xano/client.ts
import { createClient } from "@xano/supabase-compat";

export const xano = createClient(
  process.env.VITE_XANO_URL, // e.g., 'https://x62j-rlqn-vpsk.dev.xano.io'
  process.env.VITE_XANO_AUTH_ENDPOINT, // e.g., '/api:qoUCtLER/auth'
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

### 3. Update Authentication Code

The authentication API is nearly identical, requiring minimal changes:

Before (Supabase):

```typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { display_name: displayName },
  },
});

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Sign Out
await supabase.auth.signOut();

// Auth State Listener
supabase.auth.onAuthStateChange((event, session) => {
  // ...
});
```

After (Xano):

```typescript
// Sign Up (almost identical!)
const { data, error } = await xano.auth.signUp({
  email,
  password,
  options: {
    data: {
      display_name: displayName,
      // Add any additional fields required by your Xano signup endpoint
      username: username,
    },
  },
});

// Sign In (identical!)
const { data, error } = await xano.auth.signInWithPassword({
  email,
  password,
});

// Sign Out (identical!)
await xano.auth.signOut();

// Auth State Listener (identical!)
xano.auth.onAuthStateChange((event, session) => {
  // ...
});
```

### 4. Update Data Fetching

This is where the main changes occur. Supabase uses table-based queries, while Xano uses endpoints.

Before (Supabase):

```typescript
// useChores.ts
const { data: choresData, error } = await supabase
  .from("chores")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

// Insert
const { data, error } = await supabase
  .from("chores")
  .insert({
    title,
    description,
    points,
    user_id: user.id,
  })
  .select()
  .single();

// Update
const { error } = await supabase
  .from("chores")
  .update({ completed: true })
  .eq("id", choreId);
```

After (Xano):

```typescript
// useChores.ts
// You need to create corresponding Xano endpoints first

// Fetch chores
const { data: choresData, error } = await xano
  .endpoint("/api:your-api/chores")
  .get({
    user_id: user.id,
    sort: "created_at",
    order: "desc",
  });

// Insert
const { data, error } = await xano.endpoint("/api:your-api/chores").post({
  title,
  description,
  points,
  user_id: user.id,
});

// Update
const { error } = await xano
  .endpoint(`/api:your-api/chores/${choreId}`)
  .patch({ completed: true });
```

### 5. Create Xano Endpoints (Backend)

For each Supabase table query, you'll need to create corresponding Xano endpoints:

1. List/Query: `GET /api:xxx/chores`

   - Add filters as query parameters
   - Implement pagination (page, per_page)
   - Add sorting options

2. Get Single: `GET /api:xxx/chores/{id}`

   - Return single record

3. Create: `POST /api:xxx/chores`

   - Accept data in request body
   - Return created record

4. Update: `PATCH /api:xxx/chores/{id}`

   - Accept partial data in request body
   - Return updated record

5. Delete: `DELETE /api:xxx/chores/{id}`
   - Return success message

REQUIRED: After creating or editing endpoints/tables, invoke `push_all_changes_to_xano`.

### 6. Update React Hooks (Frontend)

Before (useAuth with Supabase):

```typescript
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  // ... same implementation, just change the import
  supabase.auth.onAuthStateChange(...)
  supabase.auth.getSession()
}
```

After (useAuth with Xano):

```typescript
import { xano } from '@/integrations/xano/client';

export function useAuth() {
  // ... same implementation!
  xano.auth.onAuthStateChange(...)
  xano.auth.getSession()
}
```

Before (useChores with Supabase):

```typescript
const { data, error } = await supabase
  .from("chores")
  .select("*")
  .eq("user_id", user.id);
```

After (useChores with Xano):

```typescript
const { data, error } = await xano
  .endpoint("/api:xxx/chores")
  .get({ user_id: user.id });
```

### 7. Environment Variables

Update your `.env` file:

Before:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
```

After:

```env
VITE_XANO_URL=https://x62j-rlqn-vpsk.dev.xano.io
VITE_XANO_AUTH_ENDPOINT=/api:qoUCtLER/auth  # Replace with your auth API group endpoint
```

REQUIRED: Before editing frontend code, invoke `get_xano_api_specifications` and confirm the auth group path matches `VITE_XANO_AUTH_ENDPOINT`.

## Common Patterns

### Pagination

Supabase:

```typescript
.range(0, 9) // First 10 items
```

Xano:

```typescript
.get({ page: 1, per_page: 10 })
```

### Filtering

Supabase:

```typescript
.eq('status', 'active')
.gt('points', 10)
```

Xano:

```typescript
// Implement filtering in your Xano endpoint
.get({ status: 'active', min_points: 10 })
```

### Sorting

Supabase:

```typescript
.order('created_at', { ascending: false })
```

Xano:

```typescript
// Implement in Xano endpoint
.get({ sort_by: 'created_at', order: 'desc' })
```

## Checklist

- [ ] Install Xano SDK
- [ ] Update client initialization
- [ ] Create Xano endpoints for each table query
- [ ] Create Xano endpoints for each edge function
- [ ] Update authentication code (minimal changes)
- [ ] Update data fetching code (main work)
- [ ] Update React hooks
- [ ] Update environment variables
- [ ] REQUIRED: `push_all_changes_to_xano`
- [ ] REQUIRED: `get_xano_api_specifications`
- [ ] Test authentication flow
- [ ] Test all data operations
- [ ] Update error handling if needed
- [ ] Remove Supabase dependencies

## Benefits of Xano

After migration, you'll gain:

1. Backend Logic: Built-in business logic in endpoints
2. Visual Builder: No-code/low-code endpoint creation
3. Better Performance: Optimized API endpoints
4. Flexibility: More control over data transformations
5. Cost: Potentially better pricing for your use case

## Need Help?

- Review the Xano Documentation: https://docs.xano.com
- Check the examples directory
- Open an issue on GitHub

## Gradual Migration

You can use both Supabase and Xano simultaneously during migration:

```typescript
// Keep both clients during transition
import { supabase } from "@/integrations/supabase/client";
import { xano } from "@/integrations/xano/client";

// Migrate endpoints one at a time
const useSupabaseForAuth = false;
const authClient = useSupabaseForAuth ? supabase : xano;
```

Important: Once migration is complete, remove all Supabase dependencies from the project, including the `supabase` package in `package.json` and any Supabase-specific integrations.
