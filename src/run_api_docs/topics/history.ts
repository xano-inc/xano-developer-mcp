import type { TopicDoc } from "../../meta_api_docs/types.js";

export const historyDoc: TopicDoc = {
  topic: "history",
  title: "Run History & Document Analysis",
  description: `Endpoints for viewing run execution history and analyzing XanoScript documents before execution.

## Use Cases
- **Run History**: Review past executions, track patterns, audit usage
- **Document Analysis**: Validate scripts, understand structure before execution

## History Features
- Paginated access to run history
- Sorted by creation time (newest first)
- Includes run metadata and configuration`,

  ai_hints: `- Use doc/info to validate scripts before execution
- History is sorted by created_at descending (newest first)
- Check existing runs before creating duplicates with same script
- Use pagination for large history sets (default 20 per page, max 100)
- Document info reveals functions, services, and jobs defined in a script`,

  endpoints: [
    {
      method: "GET",
      path: "/project/{project_id}/run",
      tool_name: "getRunHistory",
      description: "List run execution history for a project with pagination. Returns runs sorted by creation time (newest first).",
      parameters: [
        { name: "project_id", type: "uuid", required: true, in: "path", description: "Project UUID" },
        { name: "page", type: "integer", default: 1, description: "Page number (min: 1)" },
        { name: "per_page", type: "integer", default: 20, description: "Items per page (1-100)" }
      ],
      example: {
        method: "GET",
        path: "/project/abc123-uuid/run?page=1&per_page=20"
      }
    },
    {
      method: "POST",
      path: "/project/{project_id}/doc/info",
      tool_name: "getDocInfo",
      description: "Parse and analyze a XanoScript document. Returns metadata about the document including defined functions, services, and jobs. Use this to validate scripts before execution.",
      parameters: [
        { name: "project_id", type: "uuid", required: true, in: "path", description: "Project context" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          doc: { type: "text", required: true, description: "XanoScript document content to analyze" }
        }
      },
      example: {
        method: "POST",
        path: "/project/abc123-uuid/doc/info",
        body: {
          doc: "job my_job {\n  input { text name }\n  response = \"Hello, \" + $input.name\n}\n\nservice my_service {\n  // service code\n}"
        }
      }
    }
  ],

  schemas: {
    RunHistoryItem: {
      type: "object",
      properties: {
        id: { type: "uuid", description: "Run identifier" },
        name: { type: "text", description: "Run name" },
        type: { type: "enum", enum: ["job", "service"], description: "Run type" },
        sig: { type: "text", description: "Document signature" },
        project_id: { type: "uuid", description: "Project reference" },
        user_id: { type: "integer", description: "Owner user ID" },
        created_at: { type: "timestamp", description: "Creation time" },
        updated_at: { type: "timestamp", description: "Last update time" }
      }
    },
    DocInfo: {
      type: "object",
      properties: {
        functions: { type: "array", description: "Defined functions" },
        services: { type: "array", description: "Defined services" },
        jobs: { type: "array", description: "Defined jobs" },
        valid: { type: "boolean", description: "Whether document is valid" },
        errors: { type: "array", description: "Parsing errors if any" }
      }
    },
    PaginatedResponse: {
      type: "object",
      properties: {
        items: { type: "array", description: "List of runs" },
        curPage: { type: "integer", description: "Current page number" },
        nextPage: { type: "integer", description: "Next page number or null" },
        prevPage: { type: "integer", description: "Previous page number or null" }
      }
    }
  },

  related_topics: ["run", "session", "workflows"]
};
