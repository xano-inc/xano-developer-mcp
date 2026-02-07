import type { TopicDoc } from "../types.js";

export const authenticationDoc: TopicDoc = {
  topic: "authentication",
  title: "Authentication & Authorization",
  description: `The Xano Meta API uses Access Tokens for authentication and a scope-based system for authorization.

## Access Tokens
Create access tokens in the Xano dashboard under Settings > Access Tokens.

Include the token in all requests:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

## Scope System
Access is controlled through hierarchical scopes:

| Scope | Values | Description |
|-------|--------|-------------|
| \`instance:workspace\` | read, update, create | Workspace-level permissions |
| \`workspace:api\` | read, create, update | API management |
| \`workspace:requesthistory\` | read | Audit/history access |
| \`workspace:file\` | read, create | File management |
| \`workspace:action:export\` | enabled | Export functionality |

## Role Types
- **explore**: Limited free/explore tier role
- **paid**: Full access to all features

## Current User
Get the authenticated user's info:
\`\`\`
GET /auth/me
\`\`\`

Returns: id, name, email, and extras (including role and workspace access).`,

  ai_hints: `- Always include Authorization header with Bearer token
- Check user role before attempting paid-only operations (tasks, some exports)
- Scope errors return 403 - check if token has required permissions
- Use \`GET /auth/me\` to verify token and see accessible workspaces`,

  endpoints: [
    {
      method: "GET",
      path: "/auth/me",
      tool_name: "getAuthMe",
      description: "Get the authenticated user's information including ID, name, email, and role.",
      response: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          extras: {
            type: "object",
            description: "Contains instance.membership with role and workspace access"
          }
        }
      }
    }
  ],

  related_topics: ["start", "workspace"]
};
