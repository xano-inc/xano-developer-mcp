import type { TopicDoc } from "../types.js";

export const apiDoc: TopicDoc = {
  topic: "api",
  title: "API Endpoint Management",
  description: `API endpoints define individual HTTP routes within an API group. Each endpoint has a path, HTTP method, inputs, and XanoScript logic.

## Key Concepts
- Endpoints belong to API groups
- Each endpoint has: method (GET/POST/PUT/DELETE), path, inputs, and stack (logic)
- Supports path parameters like \`/users/{id}\`
- XanoScript defines the endpoint logic`,

  ai_hints: `- Use \`include_xanoscript=true\` to see the endpoint's implementation
- Check existing endpoints before creating to avoid duplicates
- Path parameters use \`{param_name}\` syntax
- Common patterns: CRUD operations, search, authentication
- Security settings can override group-level settings`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api",
      tool_name: "listApis",
      description: "List all API endpoints in an API group.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by name or path" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code in response" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft versions" },
        { name: "branch", type: "string", description: "Filter by branch name" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}",
      tool_name: "getApi",
      description: "Get details of a specific API endpoint.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" },
        { name: "api_id", type: "integer", required: true, in: "path", description: "API ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft version" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api",
      tool_name: "createApi",
      description: "Create a new API endpoint with XanoScript logic.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Endpoint name", required: true },
          path: { type: "string", description: "URL path (e.g., /users/{id})", required: true },
          verb: { type: "string", description: "HTTP method: GET, POST, PUT, DELETE", required: true },
          description: { type: "string", description: "Endpoint description" },
          xanoscript: { type: "string", description: "XanoScript code defining the endpoint logic" }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/apigroup/2/api",
        body: {
          name: "getUsers",
          path: "/users",
          verb: "GET",
          xanoscript: "query getUsers {\n  response = db.users.query().all()\n}"
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}",
      tool_name: "updateApi",
      description: "Update an existing API endpoint.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" },
        { name: "api_id", type: "integer", required: true, in: "path", description: "API ID" },
        { name: "publish", type: "boolean", default: true, description: "Publish changes immediately" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Endpoint name" },
          path: { type: "string", description: "URL path" },
          verb: { type: "string", description: "HTTP method" },
          description: { type: "string", description: "Endpoint description" },
          xanoscript: { type: "string", description: "XanoScript code" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}",
      tool_name: "deleteApi",
      description: "Delete an API endpoint.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" },
        { name: "api_id", type: "integer", required: true, in: "path", description: "API ID" }
      ]
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}/security",
      tool_name: "updateApiSecurity",
      description: "Update security settings for a specific endpoint (overrides group settings).",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" },
        { name: "api_id", type: "integer", required: true, in: "path", description: "API ID" }
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
    Api: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        path: { type: "string" },
        verb: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"] },
        description: { type: "string" },
        xanoscript: { type: "string", description: "Only included if include_xanoscript=true" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  examples: [
    {
      title: "Create a GET endpoint",
      description: "Create a simple endpoint to list all users",
      request: {
        method: "POST",
        path: "/workspace/1/apigroup/2/api",
        body: {
          name: "listUsers",
          path: "/users",
          verb: "GET",
          xanoscript: `query listUsers {
  input {
    int page = 1
    int per_page = 20
  }
  stack {
    var $users {
      value = db.users.query().paginate($input.page, $input.per_page)
    }
  }
  response = $users
}`
        }
      },
      response: {
        id: 123,
        name: "listUsers",
        path: "/users",
        verb: "GET"
      }
    }
  ],

  related_topics: ["apigroup", "function", "table"]
};
