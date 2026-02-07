import type { TopicDoc } from "../types.js";

export const functionDoc: TopicDoc = {
  topic: "function",
  title: "Reusable Function Management",
  description: `Functions are reusable pieces of logic that can be called from APIs, tasks, other functions, or anywhere in your Xano workspace.

## Key Concepts
- Functions encapsulate reusable business logic
- Can be called from APIs, tasks, other functions, agents, tools
- Support input parameters and return values
- Can be cached for performance
- Support draft/publish workflow

## Caching Options
Functions can cache results based on:
- TTL (time-to-live)
- Input parameters
- Authenticated user
- Datasource
- IP address
- Headers
- Environment variables`,

  ai_hints: `- Functions are reusable across APIs and tasks
- Use \`include_xanoscript=true\` to see implementation
- Draft changes won't affect production until published
- Caching can significantly improve performance for expensive operations
- Check existing functions before creating duplicates`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/function",
      tool_name: "listFunctions",
      description: "List all functions in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by function name" },
        { name: "sort", type: "string", enum: ["id", "name", "created_at"], default: "created_at", description: "Sort field" },
        { name: "order", type: "string", enum: ["asc", "desc"], default: "desc", description: "Sort direction" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft versions" },
        { name: "branch", type: "string", description: "Filter by branch name" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/function/{function_id}",
      tool_name: "getFunction",
      description: "Get details of a specific function.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "function_id", type: "integer", required: true, in: "path", description: "Function ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft version" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/function",
      tool_name: "createFunction",
      description: "Create a new reusable function.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Function name", required: true },
          description: { type: "string", description: "Function description" },
          xanoscript: { type: "string", description: "XanoScript function definition", required: true }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/function",
        body: {
          name: "calculate_total",
          description: "Calculate order total with tax",
          xanoscript: `function calculate_total {
  input {
    decimal subtotal
    decimal tax_rate = 0.08
  }
  stack {
    var $tax {
      value = $input.subtotal * $input.tax_rate
    }
    var $total {
      value = $input.subtotal + $tax
    }
  }
  response = $total
}`
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/function/{function_id}",
      tool_name: "updateFunction",
      description: "Update an existing function.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "function_id", type: "integer", required: true, in: "path", description: "Function ID" },
        { name: "publish", type: "boolean", default: true, description: "Publish changes immediately (false saves as draft)" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Function name" },
          description: { type: "string", description: "Function description" },
          xanoscript: { type: "string", description: "XanoScript function definition" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/function/{function_id}",
      tool_name: "deleteFunction",
      description: "Delete a function. Ensure no other resources depend on it.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "function_id", type: "integer", required: true, in: "path", description: "Function ID" }
      ]
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/function/{function_id}/security",
      tool_name: "updateFunctionSecurity",
      description: "Update security settings for the function.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "function_id", type: "integer", required: true, in: "path", description: "Function ID" }
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
    Function: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        xanoscript: { type: "string", description: "Only included if include_xanoscript=true" },
        cache: {
          type: "object",
          properties: {
            enabled: { type: "boolean" },
            ttl: { type: "integer", description: "Cache TTL in seconds" }
          }
        },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["api", "task", "tool"]
};
