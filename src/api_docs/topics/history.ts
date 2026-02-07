import type { TopicDoc } from "../types.js";

export const historyDoc: TopicDoc = {
  topic: "history",
  title: "Request & Execution History",
  description: `History endpoints provide audit logs for API requests and background executions. Use for debugging, monitoring, and compliance.

## Available History Types
- **Request History**: All API requests with timing and responses
- **Function History**: Function execution logs
- **Task History**: Scheduled task execution logs
- **Middleware History**: Middleware execution logs
- **Tool History**: Agent tool execution logs
- **Trigger History**: Event trigger execution logs

## Common Use Cases
- Debugging failed requests
- Performance monitoring
- Audit compliance
- Error tracking
- Usage analytics`,

  ai_hints: `- Use request history to debug API issues
- Filter by status to find errors (4xx, 5xx)
- Use branch filter to separate dev/prod logs
- Include payload for full request/response data
- History is limited to recent requests (not permanent storage)`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/request_history",
      tool_name: "getRequestHistory",
      description: "Get API request history with pagination.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page (max 500)" },
        { name: "branch", type: "string", description: "Filter by branch name" },
        { name: "api_id", type: "integer", description: "Filter by API endpoint ID" },
        { name: "include_payload", type: "boolean", default: false, description: "Include request/response payloads" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/request_history/search",
      tool_name: "searchRequestHistory",
      description: "Search request history with advanced filters.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          branch: { type: "string", description: "Filter by branch" },
          api_id: { type: "integer", description: "Filter by API ID" },
          status: { type: "array", description: "Filter by status codes (e.g., [200, 201])" },
          verb: { type: "array", description: "Filter by HTTP methods (e.g., ['GET', 'POST'])" },
          from_date: { type: "string", description: "Start date (ISO format)" },
          to_date: { type: "string", description: "End date (ISO format)" }
        }
      }
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/function_history",
      tool_name: "getFunctionHistory",
      description: "Get function execution history.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "function_id", type: "integer", description: "Filter by function ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/task_history",
      tool_name: "getTaskHistory",
      description: "Get scheduled task execution history.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "task_id", type: "integer", description: "Filter by task ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/middleware_history",
      tool_name: "getMiddlewareHistory",
      description: "Get middleware execution history.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "middleware_id", type: "integer", description: "Filter by middleware ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/tool_history",
      tool_name: "getToolHistory",
      description: "Get agent tool execution history.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "tool_id", type: "integer", description: "Filter by tool ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/trigger_history",
      tool_name: "getTriggerHistory",
      description: "Get trigger execution history.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" }
      ]
    }
  ],

  schemas: {
    RequestHistoryItem: {
      type: "object",
      properties: {
        id: { type: "integer" },
        api_id: { type: "integer" },
        verb: { type: "string" },
        path: { type: "string" },
        status: { type: "integer" },
        duration_ms: { type: "integer" },
        branch: { type: "string" },
        request_payload: { type: "object", description: "Only if include_payload=true" },
        response_payload: { type: "object", description: "Only if include_payload=true" },
        created_at: { type: "string", format: "date-time" }
      }
    },
    ExecutionHistoryItem: {
      type: "object",
      properties: {
        id: { type: "integer" },
        resource_id: { type: "integer" },
        status: { type: "string", enum: ["success", "error"] },
        duration_ms: { type: "integer" },
        error: { type: "string" },
        created_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["api", "function", "task"]
};
