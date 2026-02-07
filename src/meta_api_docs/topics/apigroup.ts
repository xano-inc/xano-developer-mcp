import type { TopicDoc } from "../types.js";

export const apigroupDoc: TopicDoc = {
  topic: "apigroup",
  title: "API Group Management",
  description: `API Groups are collections of related REST endpoints. They provide logical grouping, shared authentication, and generate Swagger/OpenAPI documentation.

## Key Concepts
- Each workspace has one or more API groups
- API groups contain individual API endpoints
- Groups can have shared authentication settings
- Each group generates its own OpenAPI/Swagger spec`,

  ai_hints: `- List existing API groups before creating new ones
- Use meaningful names (e.g., "public", "admin", "webhooks")
- Security settings apply to all endpoints in the group
- Get OpenAPI spec to understand available endpoints in a group`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/apigroup",
      tool_name: "listApiGroups",
      description: "List all API groups in a workspace with filtering and sorting.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by name" },
        { name: "sort", type: "string", enum: ["id", "name", "created_at"], default: "created_at", description: "Sort field" },
        { name: "order", type: "string", enum: ["asc", "desc"], default: "desc", description: "Sort direction" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}",
      tool_name: "getApiGroup",
      description: "Get details of a specific API group.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/apigroup",
      tool_name: "createApiGroup",
      description: "Create a new API group in the workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "API group name", required: true },
          description: { type: "string", description: "API group description" }
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}",
      tool_name: "updateApiGroup",
      description: "Update an existing API group.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "API group name" },
          description: { type: "string", description: "API group description" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}",
      tool_name: "deleteApiGroup",
      description: "Delete an API group and all its endpoints.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/openapi",
      tool_name: "getApiGroupOpenAPI",
      description: "Get OpenAPI v3 specification for this API group's endpoints.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" }
      ]
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/security",
      tool_name: "updateApiGroupSecurity",
      description: "Update security/authentication settings for the API group.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" }
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
    ApiGroup: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        swagger: { type: "boolean", description: "Whether Swagger docs are enabled" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["api", "workspace", "authentication"]
};
