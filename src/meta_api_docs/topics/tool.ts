import type { TopicDoc } from "../types.js";
import { debugDescription } from "./mcp_primitive.js";

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
- MCP metadata in XanoScript: \`title\`, \`annotations\` (read_only_hint, destructive_hint, idempotent_hint, open_world_hint), \`icons\` (https or png/jpeg/webp data URIs only) and an \`output\` schema, which makes MCP servers return validated \`structuredContent\`

## Tool Design Best Practices
- Clear, descriptive names (e.g., "lookup_customer", "send_email")
- Well-defined input schemas
- Specific, focused functionality
- Good error handling`,

  ai_hints: `- Create tools before creating agents that use them
- Tool names should be descriptive verbs (lookup, create, update, send)
- Keep tools focused on single responsibilities
- Use \`include_xanoscript=true\` to see tool implementation
- Tools can call other functions for code reuse
- Use debugTool to test a tool, including simulated mcp.elicit answers`,

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
        type: "text/x-xanoscript",
        description: "The tool as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`. Its name, instructions, inputs and response come from the script. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request creates the tool without its code."
      },
      example: {
        method: "POST",
        path: "/workspace/1/tool",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `tool "get_order_status" {
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
}`
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
        type: "text/x-xanoscript",
        description: "The whole tool as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`; it replaces the current definition. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request never changes the tool's code."
      },
      example: {
        method: "PUT",
        path: "/workspace/1/tool/5",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `tool "get_order_status" {
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
}`
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
      method: "POST",
      path: "/workspace/{workspace_id}/tool/{tool_id}/debug",
      tool_name: "debugTool",
      description: debugDescription("tool"),
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "tool_id", type: "integer", required: true, in: "path", description: "Tool ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          input: { type: "object", description: "The tool's input" },
          elicit: { type: "object", description: "Simulated mcp.elicit answers, keyed by elicit key: {action: accept|decline|cancel, content?}" },
          toolset_id: { type: "integer", description: "An MCP server the tool is assigned to; that assignment's auth then applies" },
          token: { type: "string", description: "Bearer token for an auth-protected assignment" }
        }
      }
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

  related_topics: ["agent", "mcp_server", "prompt", "resource", "function"]
};
