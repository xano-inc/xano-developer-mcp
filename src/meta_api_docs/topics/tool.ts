import type { TopicDoc } from "../types.js";

export const toolDoc: TopicDoc = {
  topic: "tool",
  title: "Agent Tool Management",
  description: `Tools are callable functions that AI agents can use to perform actions. They define inputs, outputs, and the logic to execute.

## Key Concepts
- Tools are used by agents to interact with data and external systems
- Each tool has defined inputs and outputs
- Tools contain XanoScript logic
- Can be shared across multiple agents
- Support draft/publish workflow

## Tool Design Best Practices
- Clear, descriptive names (e.g., "lookup_customer", "send_email")
- Well-defined input schemas
- Specific, focused functionality
- Good error handling`,

  ai_hints: `- Create tools before creating agents that use them
- Tool names should be descriptive verbs (lookup, create, update, send)
- Keep tools focused on single responsibilities
- Use \`include_xanoscript=true\` to see tool implementation
- Tools can call other functions for code reuse`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/tool",
      tool_name: "listTools",
      description: "List all tools in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by tool name" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft versions" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/tool/{tool_id}",
      tool_name: "getTool",
      description: "Get details of a specific tool.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "tool_id", type: "integer", required: true, in: "path", description: "Tool ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft version" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/tool",
      tool_name: "createTool",
      description: "Create a new tool for agents to use.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Tool name", required: true },
          description: { type: "string", description: "Tool description (shown to AI)" },
          xanoscript: { type: "string", description: "XanoScript tool definition", required: true }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/tool",
        body: {
          name: "lookup_order",
          description: "Look up an order by order ID or customer email",
          xanoscript: `tool lookup_order {
  input {
    int order_id?
    text email?
  }
  stack {
    var $order {
      value = db.orders.query()
        .where("id", "=", $input.order_id)
        .or("customer_email", "=", $input.email)
        .first()
    }
  }
  response = $order
}`
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/tool/{tool_id}",
      tool_name: "updateTool",
      description: "Update an existing tool.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "tool_id", type: "integer", required: true, in: "path", description: "Tool ID" },
        { name: "publish", type: "boolean", default: true, description: "Publish changes immediately" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Tool name" },
          description: { type: "string", description: "Tool description" },
          xanoscript: { type: "string", description: "XanoScript tool definition" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/tool/{tool_id}",
      tool_name: "deleteTool",
      description: "Delete a tool. Ensure no agents depend on it.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "tool_id", type: "integer", required: true, in: "path", description: "Tool ID" }
      ]
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/tool/{tool_id}/security",
      tool_name: "updateToolSecurity",
      description: "Update security settings for the tool.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "tool_id", type: "integer", required: true, in: "path", description: "Tool ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          guid: { type: "string", description: "Security group GUID" }
        }
      }
    }
  ],

  schemas: {
    Tool: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        xanoscript: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["agent", "mcp_server", "function"]
};
