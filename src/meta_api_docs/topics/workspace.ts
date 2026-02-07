import type { TopicDoc } from "../types.js";

export const workspaceDoc: TopicDoc = {
  topic: "workspace",
  title: "Workspace Management",
  description: `Workspaces are the top-level container for all Xano resources. Each workspace contains databases, APIs, functions, tasks, agents, and more.

## Key Operations
- List/get workspaces
- Export/import workspace data
- Generate workspace context for AI
- Get OpenAPI specifications
- Convert between XanoScript and JSON`,

  ai_hints: `- Use \`getWorkspaceContext\` first to understand workspace structure
- Export before making major changes (backup)
- Check branch before modifying (prod vs dev)
- \`export-schema\` is lighter than \`export\` (schema only vs full data)
- OpenAPI spec useful for understanding available endpoints`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace",
      tool_name: "listWorkspaces",
      description: "List all accessible workspaces with pagination and filtering.",
      parameters: [
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page (max 10000)" },
        { name: "search", type: "string", description: "Search by workspace name" },
        { name: "sort", type: "string", enum: ["id", "name", "created_at"], default: "created_at", description: "Sort field" },
        { name: "order", type: "string", enum: ["asc", "desc"], default: "desc", description: "Sort direction" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}",
      tool_name: "getWorkspace",
      description: "Get details of a specific workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/export-schema",
      tool_name: "exportWorkspaceSchema",
      description: "Export database schemas and branch configuration only (lighter than full export).",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "password", type: "string", description: "Optional encryption password" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/export",
      tool_name: "exportWorkspace",
      description: "Export complete workspace data and configuration including APIs, functions, data.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "password", type: "string", description: "Optional encryption password" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/import",
      tool_name: "importWorkspace",
      description: "Import and restore workspace content from an export file.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "multipart/form-data",
        properties: {
          file: { type: "file", description: "Export file to import", required: true },
          password: { type: "string", description: "Decryption password if encrypted" }
        }
      }
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/import-schema",
      tool_name: "importWorkspaceSchema",
      description: "Import database schema into a new branch.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "multipart/form-data",
        properties: {
          file: { type: "file", description: "Schema export file", required: true },
          password: { type: "string", description: "Decryption password if encrypted" }
        }
      }
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/openapi",
      tool_name: "getWorkspaceOpenAPI",
      description: "Get OpenAPI v3 specification for all APIs in the workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/context",
      tool_name: "getWorkspaceContext",
      description: "Generate complete workspace context map for AI agents. Essential for understanding workspace structure.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "format", type: "string", enum: ["json", "yaml"], default: "json", description: "Output format" },
        { name: "user_descriptions", type: "boolean", default: false, description: "Include user-provided descriptions" },
        { name: "ai_descriptions", type: "boolean", default: false, description: "Include AI-generated descriptions" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/convert/fromXS",
      tool_name: "convertFromXanoScript",
      description: "Convert XanoScript code to JSON format for programmatic manipulation.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "XanoScript code to convert"
      }
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/convert/toXS",
      tool_name: "convertToXanoScript",
      description: "Convert JSON to XanoScript format for human-readable code.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        description: "JSON structure to convert to XanoScript"
      }
    }
  ],

  schemas: {
    Workspace: {
      type: "object",
      properties: {
        id: { type: "integer", description: "Unique workspace ID" },
        name: { type: "string", description: "Workspace name" },
        description: { type: "string", description: "Workspace description" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["apigroup", "table", "function", "branch"]
};
