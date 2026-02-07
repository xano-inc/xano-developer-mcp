import type { TopicDoc } from "../types.js";

export const mcpServerDoc: TopicDoc = {
  topic: "mcp_server",
  title: "MCP Server Management",
  description: `MCP (Model Context Protocol) Servers expose tools to external AI clients like Claude Desktop, Cursor, or other MCP-compatible applications.

## Key Concepts
- MCP Servers expose Xano tools via the MCP protocol
- External AI clients can discover and call these tools
- Supports authentication for secure access
- Can have triggers for event-driven invocation
- Standardized interface for AI tool discovery

## Use Cases
- Expose Xano functionality to Claude Desktop
- Integrate with AI IDEs like Cursor
- Build custom AI assistants with Xano backend
- Provide tools to any MCP-compatible client`,

  ai_hints: `- MCP Servers expose existing tools to external clients
- Create tools first, then create MCP server to expose them
- Authentication settings control who can access the server
- Use triggers to invoke actions when MCP events occur
- Check documentation endpoint for client setup instructions`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/mcp_server",
      tool_name: "listMcpServers",
      description: "List all MCP servers in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by name" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript definition" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/mcp_server/{mcp_server_id}",
      tool_name: "getMcpServer",
      description: "Get details of a specific MCP server.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "mcp_server_id", type: "integer", required: true, in: "path", description: "MCP Server ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript definition" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/mcp_server",
      tool_name: "createMcpServer",
      description: "Create a new MCP server to expose tools.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "MCP server name", required: true },
          description: { type: "string", description: "MCP server description" },
          xanoscript: { type: "string", description: "XanoScript MCP server definition", required: true }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/mcp_server",
        body: {
          name: "my_tools",
          description: "MCP server exposing customer support tools",
          xanoscript: `mcp_server my_tools {
  tools = [lookup_order, update_ticket, send_notification]
  authentication {
    type = "bearer"
    token = env.MCP_TOKEN
  }
}`
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/mcp_server/{mcp_server_id}",
      tool_name: "updateMcpServer",
      description: "Update an existing MCP server.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "mcp_server_id", type: "integer", required: true, in: "path", description: "MCP Server ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "MCP server name" },
          description: { type: "string", description: "MCP server description" },
          xanoscript: { type: "string", description: "XanoScript MCP server definition" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/mcp_server/{mcp_server_id}",
      tool_name: "deleteMcpServer",
      description: "Delete an MCP server.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "mcp_server_id", type: "integer", required: true, in: "path", description: "MCP Server ID" }
      ]
    },
    {
      method: "GET",
      path: "/mcp_server/documentation",
      tool_name: "getMcpDocumentation",
      description: "Get MCP documentation for setup and syntax reference.",
      parameters: [
        { name: "type", type: "string", enum: ["start", "api", "function", "task", "mcp", "agent", "tool", "fs-syntax", "table", "database"], description: "Documentation type to retrieve" }
      ]
    }
  ],

  schemas: {
    McpServer: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        tools: { type: "array", items: { type: "string" } },
        authentication: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["none", "bearer", "basic"] },
            token: { type: "string" }
          }
        },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["tool", "agent", "authentication"]
};
