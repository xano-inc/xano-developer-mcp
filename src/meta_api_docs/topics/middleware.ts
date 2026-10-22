import type { TopicDoc } from "../types.js";

export const middlewareDoc: TopicDoc = {
  topic: "middleware",
  title: "Middleware Management",
  description: `Middleware are request/response interceptors that run before or after API endpoints. They handle cross-cutting concerns like authentication, logging, rate limiting, and request transformation.

## Key Concepts
- Middleware runs before (pre) or after (post) API endpoints
- Can modify requests, responses, or halt execution
- Used for: auth validation, logging, rate limiting, CORS, etc.
- Can be applied to specific endpoints or entire API groups
- Support draft/publish workflow

## Common Middleware Patterns
- Authentication/authorization checks
- Request logging and timing
- Rate limiting
- Request/response transformation
- CORS handling
- Input validation`,

  ai_hints: `- Middleware runs on every matching request - keep it fast
- Pre-middleware can halt execution (auth checks)
- Post-middleware can transform responses
- Check existing middleware before creating duplicates
- Security settings control which endpoints use the middleware`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/middleware",
      tool_name: "listmiddlewares",
      description: "List all middleware in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by name" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft versions" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/middleware/{middleware_id}",
      tool_name: "getMiddleware",
      description: "Get details of a specific middleware.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "middleware_id", type: "integer", required: true, in: "path", description: "Middleware ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft version" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/middleware",
      tool_name: "createMiddleware",
      description: "Create a new middleware.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "The middleware as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`. Its name, policies, inputs and response come from the script. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request creates the middleware without its code."
      },
      example: {
        method: "POST",
        path: "/workspace/1/middleware",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `middleware "wrap_response" {
  exception_policy = "rethrow"
  response_strategy = "replace"
  input {
    json vars
    enum type {
      values = ["pre", "post"]
    }
  }
  stack {
    var $payload { value = $input.vars.result }
  }
  response = {success: true, payload: $payload}
}`
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/middleware/{middleware_id}",
      tool_name: "updateMiddleware",
      description: "Update an existing middleware.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "middleware_id", type: "integer", required: true, in: "path", description: "Middleware ID" },
        { name: "publish", type: "boolean", default: true, description: "Publish changes immediately" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "The whole middleware as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`; it replaces the current definition. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request never changes the middleware's code."
      },
      example: {
        method: "PUT",
        path: "/workspace/1/middleware/3",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `middleware "wrap_response" {
  exception_policy = "rethrow"
  response_strategy = "replace"
  input {
    json vars
    enum type {
      values = ["pre", "post"]
    }
  }
  stack {
    var $payload { value = $input.vars.result }
  }
  response = {success: true, payload: $payload}
}`
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/middleware/{middleware_id}",
      tool_name: "deleteMiddleware",
      description: "Delete a middleware.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "middleware_id", type: "integer", required: true, in: "path", description: "Middleware ID" }
      ]
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/middleware/{middleware_id}/security",
      tool_name: "updateMiddlewareSecurity",
      description: "Update security settings for the middleware.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "middleware_id", type: "integer", required: true, in: "path", description: "Middleware ID" }
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
    Middleware: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        type: { type: "string", enum: ["pre", "post"] },
        xanoscript: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["api", "apigroup", "authentication"]
};
