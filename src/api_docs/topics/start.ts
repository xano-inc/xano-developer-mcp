import type { TopicDoc } from "../types.js";

export const startDoc: TopicDoc = {
  topic: "start",
  title: "Xano Meta API - Getting Started",
  description: `The Xano Meta API provides programmatic access to manage your Xano instance. Use it to create, modify, and manage workspaces, databases, APIs, functions, scheduled tasks, AI agents, and more.

## Base URL
\`\`\`
https://<your-instance-subdomain>.xano.io/api:meta/<endpoint>
\`\`\`

**Example:** If your Xano instance is \`https://x8ki-letl-twmt.n7.xano.io\`, the full URL to list workspaces would be:
\`\`\`
https://x8ki-letl-twmt.n7.xano.io/api:meta/workspace
\`\`\`

Your instance URL can be found in the Xano dashboard URL or in your API endpoint URLs.

## Authentication
Include your Access Token in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

Access tokens are created in the Xano dashboard under Settings > Access Tokens.

## Quick Start
1. **Get your workspaces:** \`GET /workspace\`
2. **List tables in a workspace:** \`GET /workspace/{id}/table\`
3. **Create an API endpoint:** \`POST /workspace/{id}/apigroup/{id}/api\`

## Resource Hierarchy
\`\`\`
workspace/
  ├── apigroup/         # API groups (REST endpoint collections)
  │   └── api/          # Individual endpoints
  ├── table/            # Database tables
  │   ├── schema/       # Table schema definitions
  │   ├── index/        # Database indexes
  │   └── trigger/      # Table triggers
  ├── function/         # Reusable functions
  ├── task/             # Scheduled tasks
  ├── agent/            # AI agents
  │   └── trigger/      # Agent triggers
  ├── tool/             # Agent tools
  ├── mcp_server/       # MCP servers
  │   └── trigger/      # MCP triggers
  ├── middleware/       # Request interceptors
  ├── realtime/         # WebSocket channels
  │   └── trigger/      # Realtime triggers
  ├── branch/           # Environment branches
  └── file/             # File storage
\`\`\`

## Common Parameters
Most list endpoints support:
- \`page\`: Page number (default: 1)
- \`per_page\`: Items per page (default: 50, max: 10000)
- \`search\`: Search by name
- \`sort\`: Sort field (usually: id, name, created_at)
- \`order\`: Sort direction (asc, desc)
- \`branch\`: Filter by branch name

## XanoScript Integration
Many endpoints accept XanoScript code for logic definition:
- Use \`include_xanoscript=true\` to get code in responses
- POST/PUT bodies can include XanoScript directly
- Use \`/convert/fromXS\` and \`/convert/toXS\` for format conversion`,

  ai_hints: `- Start by calling \`GET /workspace\` to get workspace IDs
- Use \`GET /workspace/{id}/context\` to get a full workspace map for AI understanding
- Always check existing resources before creating new ones
- Use \`include_xanoscript=true\` to see implementation details
- Draft/publish workflow: changes are drafts until published`,

  related_topics: ["authentication", "workspace", "workflows"],

  examples: [
    {
      title: "List all workspaces",
      description: "Get a list of all accessible workspaces",
      request: {
        method: "GET",
        path: "/workspace",
        headers: { "Authorization": "Bearer <token>" }
      },
      response: {
        curPage: 1,
        nextPage: null,
        prevPage: null,
        items: [
          { id: 1, name: "My App", description: "Production workspace" }
        ]
      }
    },
    {
      title: "Get workspace context for AI",
      description: "Generate complete workspace context for AI agents",
      request: {
        method: "GET",
        path: "/workspace/1/context?format=json",
        headers: { "Authorization": "Bearer <token>" }
      },
      response: {
        tables: ["users", "posts", "comments"],
        api_groups: [{ name: "public", endpoints: 12 }],
        functions: ["auth_check", "send_email"]
      }
    }
  ]
};
