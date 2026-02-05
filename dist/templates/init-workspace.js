/**
 * Template for init_workspace tool documentation
 * Edit this file to update the workspace initialization guide
 */
export function generateInitWorkspaceTemplate(objectTypes) {
    const objectTypesTable = objectTypes
        .map(({ type, path, endpoint }) => `| \`${type}\` | \`${path}/\` | \`${endpoint}\` |`)
        .join("\n");
    return `# Xano Workspace Initialization Guide

This guide explains how to set up a local development workspace that syncs with the Xano Headless API.

## Directory Structure

Initialize your workspace with these directories:

\`\`\`
your-project/
├── .xano/
│   └── registry.json      # Tracks all objects and their sync state
├── functions/             # Custom reusable functions
│   ├── calculate_total.xs
│   └── validate_email.xs
├── tables/                # Database table schemas
│   ├── user.xs
│   └── order.xs
├── tasks/                 # Scheduled background tasks
│   └── cleanup_sessions.xs
├── apis/                  # API groups and endpoints
│   └── auth/              # API group directory
│       ├── api_group.xs   # Group definition
│       ├── POST_login.xs  # Endpoint: POST /auth/login
│       └── GET_me.xs      # Endpoint: GET /auth/me
├── tools/                 # AI-callable tools
├── agents/                # AI agents
├── middlewares/           # Request/response middleware
├── addons/                # Query addons
├── mcp_servers/           # MCP servers
└── realtime/              # Realtime channels
\`\`\`

## Object Types

| Type | Directory | API Endpoint |
|------|-----------|--------------|
${objectTypesTable}

## File Naming Convention

Files should follow snake_case naming with the \`.xs\` extension:
- \`{name}.xs\` - Basic format (e.g., \`calculate_total.xs\`)
- \`{id}_{name}.xs\` - With ID prefix for disambiguation (e.g., \`42_calculate_total.xs\`)
- API endpoints: \`{VERB}_{path}.xs\` (e.g., \`POST_login.xs\`, \`GET_users_id.xs\`)

## Registry Format

The \`.xano/registry.json\` file tracks the sync state between local files and the Xano API:

\`\`\`json
{
  "workspace_id": 12345,
  "workspace_name": "My Project",
  "branch": "",
  "base_url": "https://your-instance.xano.io/api:headless",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "objects": [
    {
      "id": 1,
      "type": "function",
      "name": "calculate_total",
      "path": "functions/calculate_total.xs",
      "sha256": "abc123...",
      "status": "unchanged",
      "original": "ZnVuY3Rpb24gY2FsY3VsYXRlX3RvdGFsIHsgLi4uIH0=",
      "updated_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": 0,
      "type": "function",
      "name": "new_function",
      "path": "functions/new_function.xs",
      "status": "new"
    }
  ]
}
\`\`\`

### Registry Record Fields

| Field | Description |
|-------|-------------|
| \`id\` | Xano object ID (0 = new, not yet synced) |
| \`type\` | Object type (function, table, task, etc.) |
| \`name\` | Object name extracted from XanoScript |
| \`path\` | Relative file path from workspace root |
| \`sha256\` | SHA256 hash of file content for change detection |
| \`status\` | Sync status: "new", "unchanged", "changed", "deleted" |
| \`original\` | Base64-encoded original content (for conflict detection) |
| \`updated_at\` | Last sync timestamp |

### Status Values

| Status | Description |
|--------|-------------|
| \`new\` | Created locally, not yet pushed to Xano |
| \`unchanged\` | In sync with remote |
| \`changed\` | Modified locally since last sync |
| \`deleted\` | Marked for deletion (file removed locally) |

## Fetching Objects from the API

Use the Headless API to fetch objects. For detailed endpoint documentation, use \`api_docs({ object: "function" })\` etc.

### List Objects

\`\`\`
GET /workspace/{workspace_id}/{type}
Headers:
  Authorization: Bearer {token}

Query Parameters:
  - branch: Branch label (empty = live branch)
  - page: Page number (default: 1)
  - per_page: Items per page (default: 50, max: 10000)
  - search: Text search filter
  - sort: Sort field (created_at, updated_at, name)
  - order: asc or desc
\`\`\`

### Get Single Object with XanoScript

\`\`\`
GET /workspace/{workspace_id}/{type}/{id}
Headers:
  Authorization: Bearer {token}

Query Parameters:
  - branch: Branch label
\`\`\`

The response includes the \`xanoscript\` field with the code content:
\`\`\`json
{
  "id": 1,
  "name": "calculate_total",
  "xanoscript": {
    "status": "ok",
    "value": "function calculate_total { ... }"
  }
}
\`\`\`

### API Endpoints (Nested Under API Groups)

**Important:** API endpoints are nested resources under API groups. You must first fetch API groups to obtain their IDs, then use those IDs to fetch the endpoints within each group.

\`\`\`
# 1. First, list API groups
GET /workspace/{workspace_id}/apigroup

# 2. Then, list endpoints for each group using the apigroup_id
GET /workspace/{workspace_id}/apigroup/{apigroup_id}/api

# 3. Get a single endpoint
GET /workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}
\`\`\`

This hierarchical structure is reflected in the local directory layout:
\`\`\`
apis/
└── auth/                  # API group (apigroup_id required)
    ├── api_group.xs       # Group definition
    ├── POST_login.xs      # Endpoint within this group
    └── GET_me.xs          # Another endpoint
\`\`\`

See \`api_docs({ object: "api_group" })\` for complete API group and endpoint documentation.

## Pull Workflow

1. **Fetch object list** from API (paginated)
2. **For each object**, get the full definition including XanoScript
3. **Generate file path** based on type and name
4. **Write file** to the appropriate directory
5. **Update registry** with object metadata and SHA256 hash

### Example Pull Request Sequence

\`\`\`javascript
// 1. List all functions
const response = await fetch(
  \`\${baseUrl}/workspace/\${workspaceId}/function?branch=\${branch}&per_page=100\`,
  { headers: { Authorization: \`Bearer \${token}\` } }
);
const { items, nextPage } = await response.json();

// 2. For each function, save to file
for (const func of items) {
  const xanoscript = func.xanoscript?.value || '';
  const fileName = \`\${snakeCase(func.name)}.xs\`;
  const filePath = \`functions/\${fileName}\`;

  // Write file
  await writeFile(filePath, xanoscript);

  // Add to registry
  registry.objects.push({
    id: func.id,
    type: 'function',
    name: func.name,
    path: filePath,
    sha256: sha256(xanoscript),
    status: 'unchanged',
    original: btoa(xanoscript),
    updated_at: func.updated_at
  });
}
\`\`\`

## Push Workflow

1. **Read registry** to find changed/new objects
2. **For each changed file**, read content and detect changes
3. **Create or update** via API with XanoScript content
4. **Update registry** with new IDs and hashes

### Example Push Request

\`\`\`javascript
// Create new function
const response = await fetch(
  \`\${baseUrl}/workspace/\${workspaceId}/function?branch=\${branch}\`,
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'text/x-xanoscript'
    },
    body: xanoscriptContent
  }
);

// Update existing function
const response = await fetch(
  \`\${baseUrl}/workspace/\${workspaceId}/function/\${functionId}?publish=true\`,
  {
    method: 'PUT',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'text/x-xanoscript'
    },
    body: xanoscriptContent
  }
);
\`\`\`

## API Documentation References

For detailed API documentation on each object type, use:

- \`api_docs()\` - Overview of all endpoints
- \`api_docs({ object: "workspace" })\` - Workspace management
- \`api_docs({ object: "function" })\` - Functions API
- \`api_docs({ object: "table" })\` - Tables API
- \`api_docs({ object: "task" })\` - Tasks API
- \`api_docs({ object: "api_group" })\` - API groups and endpoints
- \`api_docs({ object: "agent" })\` - AI agents
- \`api_docs({ object: "tool" })\` - AI tools
- \`api_docs({ object: "authentication" })\` - Auth and user info

## XanoScript Documentation References

For writing XanoScript code, use:

- \`xanoscript_docs()\` - Full documentation index
- \`xanoscript_docs({ keyword: "function" })\` - Function syntax
- \`xanoscript_docs({ keyword: "table" })\` - Table schema syntax
- \`xanoscript_docs({ keyword: "api_query" })\` - API endpoint syntax
- \`xanoscript_docs({ keyword: "syntax" })\` - Language reference

## Validating XanoScript

Before pushing changes, validate the XanoScript syntax:

\`\`\`
validate_xanoscript({ code: "function foo { ... }" })
\`\`\`

This will check for syntax errors and return line/column positions for any issues.
`;
}
