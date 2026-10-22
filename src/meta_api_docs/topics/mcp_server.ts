import type { TopicDoc } from "../types.js";

export const mcpServerDoc: TopicDoc = {
  topic: "mcp_server",
  title: "MCP Server Management",
  description: `MCP (Model Context Protocol) Servers expose tools, prompts and resources to external AI clients like Claude Desktop, Cursor, or other MCP-compatible applications.

## Key Concepts
- MCP Servers expose Xano tools via the MCP protocol
- External AI clients can discover and call these tools
- Supports authentication for secure access
- Can have triggers for event-driven invocation
- Standardized interface for AI tool discovery
- First-class prompts and resources are attached with \`prompts = [...]\` and \`resources = [...]\` blocks (\`name\`, \`active\`, \`auth\`); agents cannot have these blocks
- Serves MCP 2026-07-28 and older clients (2024-11-05 through 2025-11-25) on one URL; elicitation input is only collected from 2026-07-28 clients, and list-changed notifications need a Swoole instance

## Use Cases
- Expose Xano functionality to Claude Desktop
- Integrate with AI IDEs like Cursor
- Build custom AI assistants with Xano backend
- Provide tools to any MCP-compatible client`,

  ai_hints: `- MCP Servers expose existing tools to external clients
- Create tools first, then create MCP server to expose them
- Authentication settings control who can access the server
- Use triggers to invoke actions when MCP events occur
- Check documentation endpoint for client setup instructions
- Create prompts (createPrompt) and resources (createResource) before listing them on a server
- The \`type: "resource"\` tool reference is legacy; use a resource object for new work`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/mcp_server",
      tool_name: "listMCPServers",
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
      tool_name: "getMCPServer",
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
      tool_name: "createMCPServer",
      description: "Create a new MCP server to expose tools.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "The MCP server as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`. Its name and the tools, prompts and resources it exposes come from the script. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request creates the MCP server without its code."
      },
      example: {
        method: "POST",
        path: "/workspace/1/mcp_server",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `mcp_server "Orders" {
  canonical = "orders-mcp"
  tools = [{ name: "get_order_status" }]
}`
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/mcp_server/{mcp_server_id}",
      tool_name: "updateMCPServer",
      description: "Update an existing MCP server.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "mcp_server_id", type: "integer", required: true, in: "path", description: "MCP Server ID" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "The whole MCP server as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`; it replaces the current definition. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request never changes the MCP server's code."
      },
      example: {
        method: "PUT",
        path: "/workspace/1/mcp_server/1",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `mcp_server "Orders" {
  canonical = "orders-mcp"
  tools = [{ name: "get_order_status" }]
}`
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/mcp_server/{mcp_server_id}",
      tool_name: "deleteMCPServer",
      description: "Delete an MCP server.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "mcp_server_id", type: "integer", required: true, in: "path", description: "MCP Server ID" }
      ]
    },
    {
      method: "GET",
      path: "/mcp_server/documentation",
      tool_name: "documentation",
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
