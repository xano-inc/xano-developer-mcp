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
      example: `// Example: create a users table and a list endpoint.
// Each object is sent as XanoScript: the raw body, Content-Type: text/x-xanoscript.

// 1. Create the table
POST /workspace/1/table
Content-Type: text/x-xanoscript

table "user" {
  auth = true
  schema {
    int id
    timestamp created_at?=now
    text name filters=trim
    email email filters=trim|lower {
      sensitive = true
    }
    password password
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "email"}]}
  ]
}

// 2. Create the list endpoint
POST /workspace/1/apigroup/1/api
Content-Type: text/x-xanoscript

query "orders" verb=GET {
  description = "List orders, 20 a page"
  input {
    int page?=1
  }
  stack {
    db.query "order" {
      return = {type: "list", paging: {page: $input.page, per_page: 20}}
    } as $orders
  }
  response = $orders
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
      example: `// 1. Create a tool (XanoScript body, Content-Type: text/x-xanoscript)
POST /workspace/1/tool
Content-Type: text/x-xanoscript

tool "get_order_status" {
  instructions = "Check the current status of an order by its ID."
  input {
    int order_id { description = "Order ID to check" }
  }
  stack {
    db.get "order" {
      field_name = "id"
      field_value = $input.order_id
    } as $order
  }
  response = {
    order_id: $order.id,
    status: $order.status,
    updated_at: $order.updated_at
  }
}

// 2. Create the agent that uses it
POST /workspace/1/agent
Content-Type: text/x-xanoscript

agent "Customer Support" {
  canonical = "support-agent-v1"
  description = "Handles customer inquiries"
  llm = {
    type: "xano-free"
    system_prompt: "You are a helpful customer support agent."
    prompt: "{{ $args.user_message }}"
    max_steps: 5
    temperature: 0.7
  }
  tools = [
    { name: "get_order_status" }
  ]
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
        "2. `POST /workspace/{id}/task` - Create the task: its XanoScript, schedule included, as a `text/x-xanoscript` body",
        "3. Monitor via `GET /workspace/{id}/task_history`"
      ],
      example: `// The schedule lives in the XanoScript (freq in seconds); there is no cron field.
POST /workspace/1/task
Content-Type: text/x-xanoscript

task "cleanup_old_sessions" {
  description = "Delete sessions older than 30 days, daily at 03:00 UTC"
  stack {
    var $cutoff { value = now|transform_timestamp:"-30 days" }
    db.bulk.delete "session" {
      where = $db.session.created_at < $cutoff
    } as $deleted
  }
  schedule = [{starts_on: 2026-01-01 03:00:00+0000, freq: 86400}]
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
        "3. Use include_output=true to see each request's output (the input is always returned)",
        "4. `GET /workspace/{id}/apigroup/{id}/api/{id}?include_xanoscript=true` - Review endpoint code"
      ]
    }
  ],

  related_topics: ["start", "api", "table", "function", "agent"]
};
