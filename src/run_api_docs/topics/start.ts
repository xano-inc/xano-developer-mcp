import type { TopicDoc } from "../../meta_api_docs/types.js";

export const startDoc: TopicDoc = {
  topic: "start",
  title: "Xano Run API - Getting Started",
  description: `The Xano Run API provides programmatic access to execute XanoScript, manage runtime sessions, and work with execution environments. Use it to run scripts, manage long-running services, and retrieve execution history.

## Base URL
\`\`\`
https://app.dev.xano.com/api:run/<endpoint>
\`\`\`

**Important:** This is a fixed URL - NOT your Xano instance URL. All Run API requests go to this central endpoint.

## Authentication
Include your Access Token in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

Access tokens are created in the Xano dashboard under Settings > Access Tokens.

## Key Concepts

### Run Types
- **Job**: One-time execution that runs to completion and terminates
- **Service**: Long-running process that persists in a tenant until stopped

### Sessions
Sessions are active runtime execution contexts with isolated state. Each execution creates a session that tracks:
- Execution state (pending, processing, running, error, complete)
- Timing metrics (boot_time, main_time, total_time, etc.)
- Response data and logs
- Access level (public/private)

### Resource Hierarchy
\`\`\`
project/
  └── run/                  # Stored run configurations
      └── session/          # Active execution contexts
          └── backup/sink   # Data snapshots
\`\`\`

## Quick Start
1. **Execute a script:** \`POST /project/{project_id}/run/exec\` with your XanoScript
2. **Check session status:** \`GET /session/{session_id}\`
3. **View run history:** \`GET /project/{project_id}/run\`

## Common Parameters
- \`project_id\`: UUID of your project (required for most endpoints)
- \`run_id\`: UUID of a stored run configuration
- \`session_id\`: UUID of an active session
- \`doc\`: XanoScript document content
- \`args\`: JSON arguments passed to the execution
- \`env\`: Environment variable overrides`,

  ai_hints: `- Use \`POST /project/{id}/run/exec\` to execute new XanoScript
- Sessions are created automatically from executions
- Use "job" type for one-time tasks, "service" for long-running processes
- Check session state before operations (running, error, complete)
- Only "service" type sessions can be re-executed with new documents
- Use \`GET /session/{id}/sink\` to export all data after hibernation`,

  related_topics: ["run", "session", "workflows"],

  examples: [
    {
      title: "Execute a simple XanoScript",
      description: "Run a XanoScript job and get the result",
      request: {
        method: "POST",
        path: "/project/abc123-uuid/run/exec",
        headers: { "Authorization": "Bearer <token>" },
        body: {
          doc: "job hello {\n  response = \"Hello, World!\"\n}",
          args: {},
          template: "small"
        }
      },
      response: {
        session_id: "session-uuid-here",
        state: "complete",
        response: "Hello, World!"
      }
    },
    {
      title: "Check session status",
      description: "Get details about a running or completed session",
      request: {
        method: "GET",
        path: "/session/session-uuid-here",
        headers: { "Authorization": "Bearer <token>" }
      },
      response: {
        id: "session-uuid-here",
        state: "running",
        access: "private",
        created_at: "2024-01-15T10:30:00Z"
      }
    }
  ]
};
