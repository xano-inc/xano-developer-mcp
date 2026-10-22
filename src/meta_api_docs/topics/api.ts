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
      tool_name: "listAPIs",
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
      tool_name: "getAPI",
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
      tool_name: "createAPI",
      description: "Create a new API endpoint with XanoScript logic.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "The endpoint as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`. Its name, verb, path, inputs and response come from the script (`query \"<path>\" verb=<VERB> { ... }`). A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request creates the endpoint without its code."
      },
      example: {
        method: "POST",
        path: "/workspace/1/apigroup/2/api",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `query "orders" verb=GET {
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
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}",
      tool_name: "updateAPI",
      description: "Update an existing API endpoint.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "apigroup_id", type: "integer", required: true, in: "path", description: "API Group ID" },
        { name: "api_id", type: "integer", required: true, in: "path", description: "API ID" },
        { name: "publish", type: "boolean", default: true, description: "Publish changes immediately" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "The whole endpoint as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`; it replaces the current definition. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request never changes the endpoint's code."
      },
      example: {
        method: "PUT",
        path: "/workspace/1/apigroup/2/api/7",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `query "orders" verb=GET {
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
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/apigroup/{apigroup_id}/api/{api_id}",
      tool_name: "deleteAPI",
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
      tool_name: "updateAPISecurity",
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
      description: "Create an endpoint that lists orders, 20 a page. The endpoint is the request body, as XanoScript.",
      request: {
        method: "POST",
        path: "/workspace/1/apigroup/2/api",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `query "orders" verb=GET {
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
      response: {
        id: 123,
        name: "orders",
        verb: "GET"
      }
    }
  ],

  related_topics: ["apigroup", "function", "table"]
};
