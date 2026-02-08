import type { TopicDoc } from "../../meta_api_docs/types.js";

export const runDoc: TopicDoc = {
  topic: "run",
  title: "Run Execution",
  description: `Endpoints for executing XanoScript runs. Runs are executable XanoScript documents that can be jobs (one-time execution) or services (long-running processes).

## Run Types
- **Job**: Executes once and terminates. Use for data processing, migrations, one-time tasks.
- **Service**: Runs persistently in a tenant. Use for APIs, webhooks, background workers.

## Execution Flow
1. Submit XanoScript document via \`/run/exec\`
2. System creates a session to track execution
3. Session progresses through states: pending → processing → running → complete/error
4. Retrieve results from the session

## Templates
The \`template\` parameter controls resource allocation:
- \`small\`: Default, suitable for most workloads
- Additional templates may be available for larger workloads`,

  ai_hints: `- Include complete XanoScript in the 'doc' parameter
- Use 'args' to pass dynamic data to runs (available as $args in XanoScript)
- Use 'env' to override environment variables for this execution
- Template affects resource allocation - use "small" for typical workloads
- Re-executing a run reuses its stored configuration with optional overrides
- Check the session state after execution to verify success`,

  endpoints: [
    {
      method: "POST",
      path: "/project/{project_id}/run/exec",
      tool_name: "run",
      description: "Execute a new XanoScript run. Creates a session to track execution and returns the result.",
      parameters: [
        { name: "project_id", type: "uuid", required: true, in: "path", description: "Project UUID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          doc: { type: "text", required: true, description: "XanoScript document content" },
          args: { type: "json", description: "Arguments passed to the job (default: {})" },
          env: { type: "json", description: "Environment variable overrides (default: {})" },
          template: { type: "text", description: "Execution template (default: 'small')" },
          logs: { type: "json[]", description: "Execution logs array (default: [])" }
        }
      },
      example: {
        method: "POST",
        path: "/project/abc123-uuid/run/exec",
        body: {
          doc: "job process_data {\n  input { json items }\n  response = $input.items.map(i => i.value * 2)\n}",
          args: { items: [{ value: 1 }, { value: 2 }, { value: 3 }] },
          template: "small"
        }
      }
    },
    {
      method: "POST",
      path: "/project/{project_id}/run/{run_id}/exec",
      description: "Re-execute an existing run by its ID. Uses the stored run configuration with optional argument and environment overrides.",
      parameters: [
        { name: "project_id", type: "uuid", required: true, in: "path", description: "Project UUID" },
        { name: "run_id", type: "uuid", required: true, in: "path", description: "Run UUID to re-execute" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          args: { type: "json", description: "Override arguments (default: {})" },
          env: { type: "json", description: "Override environment variables (default: {})" },
          template: { type: "text", description: "Execution template (default: 'small')" },
          logs: { type: "json[]", description: "Execution logs array (default: [])" }
        }
      },
      example: {
        method: "POST",
        path: "/project/abc123-uuid/run/run456-uuid/exec",
        body: {
          args: { updated_value: 100 },
          template: "small"
        }
      }
    }
  ],

  schemas: {
    Run: {
      type: "object",
      properties: {
        id: { type: "uuid", description: "Unique run identifier" },
        name: { type: "text", description: "Run name" },
        type: { type: "enum", enum: ["job", "service"], description: "Run type" },
        doc: { type: "text", description: "XanoScript document content" },
        args: { type: "json", description: "Stored arguments" },
        project_id: { type: "uuid", description: "Associated project" },
        user_id: { type: "integer", description: "Owner user ID" },
        sig: { type: "text", description: "Document signature/hash" },
        created_at: { type: "timestamp", description: "Creation time" },
        updated_at: { type: "timestamp", description: "Last update time" }
      }
    },
    ExecutionResult: {
      type: "object",
      properties: {
        session_id: { type: "uuid", description: "Created session ID" },
        state: { type: "enum", enum: ["pending", "processing", "running", "error", "complete"] },
        response: { type: "any", description: "Execution result" },
        error_msg: { type: "text", description: "Error message if failed" },
        logs: { type: "json[]", description: "Execution logs" }
      }
    }
  },

  related_topics: ["session", "history", "workflows"]
};
