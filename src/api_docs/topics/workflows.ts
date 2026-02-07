import type { TopicDoc } from "../types.js";

export const workflowsDoc: TopicDoc = {
  topic: "workflows",
  title: "Common Workflows",
  description: `Step-by-step guides for common multi-step tasks using the Xano Meta API.

## Quick Reference
- **Create API Endpoint**: workspace → apigroup → api
- **Create Database Table**: workspace → table → schema → index
- **Set Up AI Agent**: tool → agent → (optional) mcp_server
- **Deploy Changes**: draft → test → publish`,

  ai_hints: `- Always start by listing existing resources
- Use workspace context to understand current state
- Create dependencies first (tables before APIs, tools before agents)
- Test in development branch before production
- Export backup before major changes`,

  patterns: [
    {
      name: "Create a Complete REST API",
      description: "Set up a table with CRUD endpoints",
      steps: [
        "1. `GET /workspace` - Find your workspace ID",
        "2. `POST /workspace/{id}/table` - Create the database table",
        "3. `POST /workspace/{id}/table/{id}/schema` - Add fields to the table",
        "4. `POST /workspace/{id}/table/{id}/index` - Add indexes for query performance",
        "5. `GET /workspace/{id}/apigroup` - Find or create an API group",
        "6. `POST /workspace/{id}/apigroup/{id}/api` - Create GET (list) endpoint",
        "7. `POST /workspace/{id}/apigroup/{id}/api` - Create GET (single) endpoint",
        "8. `POST /workspace/{id}/apigroup/{id}/api` - Create POST endpoint",
        "9. `POST /workspace/{id}/apigroup/{id}/api` - Create PUT endpoint",
        "10. `POST /workspace/{id}/apigroup/{id}/api` - Create DELETE endpoint"
      ],
      example: `// Example: Create users table and list endpoint

// 1. Create table
POST /workspace/1/table
{
  "name": "users",
  "xanoscript": "table users {\\n  id int [pk, auto]\\n  email text [unique]\\n  name text\\n  created_at timestamp [default:now]\\n}"
}

// 2. Create list endpoint
POST /workspace/1/apigroup/1/api
{
  "name": "listUsers",
  "path": "/users",
  "verb": "GET",
  "xanoscript": "query listUsers {\\n  response = db.users.query().all()\\n}"
}`
    },
    {
      name: "Set Up an AI Agent with Tools",
      description: "Create tools and an agent that uses them",
      steps: [
        "1. `GET /workspace` - Find your workspace ID",
        "2. `POST /workspace/{id}/tool` - Create first tool",
        "3. `POST /workspace/{id}/tool` - Create additional tools as needed",
        "4. `POST /workspace/{id}/agent` - Create agent with tool references",
        "5. `POST /workspace/{id}/mcp_server` (optional) - Expose via MCP"
      ],
      example: `// 1. Create a lookup tool
POST /workspace/1/tool
{
  "name": "lookup_customer",
  "description": "Look up customer by email or ID",
  "xanoscript": "tool lookup_customer {\\n  input { text email? int id? }\\n  response = db.customers.query().where('email', '=', $input.email).or('id', '=', $input.id).first()\\n}"
}

// 2. Create agent
POST /workspace/1/agent
{
  "name": "support_bot",
  "xanoscript": "agent support_bot {\\n  llm {\\n    type = \\"anthropic\\"\\n    model = \\"claude-4-sonnet-20250514\\"\\n    system_prompt = \\"You help customers with their orders.\\"\\n  }\\n  tools = [lookup_customer]\\n}"
}`
    },
    {
      name: "Deploy Function Changes Safely",
      description: "Use draft/publish workflow for safe deployments",
      steps: [
        "1. `GET /workspace/{id}/function/{id}?include_xanoscript=true` - Get current function",
        "2. `PUT /workspace/{id}/function/{id}?publish=false` - Save changes as draft",
        "3. Test the draft version in development",
        "4. `PUT /workspace/{id}/function/{id}?publish=true` - Publish to production"
      ]
    },
    {
      name: "Create a Scheduled Data Cleanup Task",
      description: "Set up automated data maintenance",
      steps: [
        "1. `GET /workspace` - Find workspace ID",
        "2. `POST /workspace/{id}/task` - Create the task with schedule",
        "3. Monitor via `GET /workspace/{id}/task_history`"
      ],
      example: `POST /workspace/1/task
{
  "name": "cleanup_old_sessions",
  "schedule": "0 3 * * *",
  "active": true,
  "xanoscript": "task cleanup_old_sessions {\\n  stack {\\n    db.sessions.query().where('created_at', '<', now() - 30.days).delete()\\n  }\\n}"
}`
    },
    {
      name: "Export and Import Workspace",
      description: "Backup or migrate workspace data",
      steps: [
        "1. `POST /workspace/{id}/export` - Export complete workspace",
        "2. Download the export file",
        "3. `POST /workspace/{target_id}/import` - Import to target workspace"
      ]
    },
    {
      name: "Add Authentication to API Group",
      description: "Secure API endpoints with authentication",
      steps: [
        "1. `GET /workspace/{id}/apigroup/{id}` - Get API group details",
        "2. `PUT /workspace/{id}/apigroup/{id}/security` - Set security GUID",
        "3. Individual endpoints inherit group security unless overridden"
      ]
    },
    {
      name: "Debug a Failing API Endpoint",
      description: "Use history to troubleshoot issues",
      steps: [
        "1. `POST /workspace/{id}/request_history/search` - Search for failed requests",
        "2. Filter by status: [400, 401, 403, 404, 500]",
        "3. Use include_payload=true to see request/response details",
        "4. `GET /workspace/{id}/apigroup/{id}/api/{id}?include_xanoscript=true` - Review endpoint code"
      ]
    }
  ],

  related_topics: ["start", "api", "table", "function", "agent"]
};
