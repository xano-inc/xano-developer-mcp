import type { TopicDoc } from "../../meta_api_docs/types.js";

export const sessionDoc: TopicDoc = {
  topic: "session",
  title: "Session Management",
  description: `Sessions are active runtime execution contexts with isolated state. Each run execution creates a session that tracks the execution lifecycle, timing metrics, and results.

## Session States
- \`pending\`: Awaiting execution
- \`processing\`: Setting up execution environment
- \`running\`: Active execution in progress
- \`error\`: Execution failed
- \`complete\`: Execution finished successfully

## Access Levels
- \`private\`: Requires authentication and project ownership
- \`public\`: Accessible without authentication

## Session Lifecycle
1. **Creation**: Session created when a run is executed
2. **Execution**: Session progresses through states
3. **Hibernation**: Long-running services may hibernate after timeout
4. **Termination**: Sessions can be stopped manually or auto-cleanup

## Timing Metrics
Sessions track detailed timing information:
- \`boot_time\`: Environment setup time
- \`pre_time\`: Pre-execution processing
- \`main_time\`: Main execution duration
- \`post_time\`: Post-execution cleanup
- \`total_time\`: Complete execution time`,

  ai_hints: `- Check session state before performing operations
- Only "service" type sessions can be re-executed with new documents
- Public sessions are accessible without auth - use for sharing results
- Sessions auto-hibernate after project timeout (default: 1 hour)
- Use /stop endpoint to gracefully terminate running sessions
- Cannot stop sessions already in "error" or "complete" state`,

  endpoints: [
    {
      method: "GET",
      path: "/project/{project_id}/run/session",
      tool_name: "getProjectSessions",
      description: "List all active sessions for a project with pagination.",
      parameters: [
        { name: "project_id", type: "uuid", required: true, in: "path", description: "Project UUID" },
        { name: "page", type: "integer", default: 1, description: "Page number (min: 1)" }
      ]
    },
    {
      method: "GET",
      path: "/project/{project_id}/run/{run_id}/session",
      tool_name: "getRunSessions",
      description: "List all sessions for a specific run.",
      parameters: [
        { name: "project_id", type: "uuid", required: true, in: "path", description: "Project UUID" },
        { name: "run_id", type: "uuid", required: true, in: "path", description: "Run UUID" },
        { name: "page", type: "integer", default: 1, description: "Page number (min: 1)" }
      ]
    },
    {
      method: "GET",
      path: "/session/{session_id}",
      tool_name: "getSession",
      description: "Get detailed information about a session including status, run config, and timing metrics. Public sessions don't require authentication.",
      parameters: [
        { name: "session_id", type: "uuid", required: true, in: "path", description: "Session UUID" }
      ]
    },
    {
      method: "POST",
      path: "/session/{session_id}/access",
      tool_name: "setSessionAccess",
      description: "Update the access level of a session (public or private).",
      parameters: [
        { name: "session_id", type: "uuid", required: true, in: "path", description: "Session UUID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          access: { type: "enum", required: true, description: "Access level: 'public' or 'private'" }
        }
      },
      example: {
        method: "POST",
        path: "/session/session-uuid/access",
        body: { access: "public" }
      }
    },
    {
      method: "POST",
      path: "/session/{session_id}/exec",
      description: "Re-execute on an existing service session with a new XanoScript document. Reuses the session's resources (tenant). Only works on 'service' type sessions with a valid tenant.",
      parameters: [
        { name: "session_id", type: "uuid", required: true, in: "path", description: "Session UUID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          doc: { type: "text", required: true, description: "New XanoScript document" },
          args: { type: "json", description: "Arguments (default: {})" },
          env: { type: "json", description: "Environment overrides (default: {})" }
        }
      },
      example: {
        method: "POST",
        path: "/session/session-uuid/exec",
        body: {
          doc: "job updated_logic {\n  response = \"New execution on existing session\"\n}",
          args: {}
        }
      }
    },
    {
      method: "PATCH",
      path: "/session/{session_id}",
      tool_name: "updateSessionRun",
      description: "Update the run name associated with a session.",
      parameters: [
        { name: "session_id", type: "uuid", required: true, in: "path", description: "Session UUID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "text", required: true, description: "New run name (min 1 character)" }
        }
      }
    },
    {
      method: "POST",
      path: "/project/{project_id}/run/{run_id}/session/{session_id}/stop",
      tool_name: "stopSession",
      description: "Stop and tear down a running session. Creates a backup before deletion. Cannot stop sessions already in 'error' or 'complete' state.",
      parameters: [
        { name: "project_id", type: "uuid", required: true, in: "path", description: "Project UUID" },
        { name: "run_id", type: "uuid", required: true, in: "path", description: "Run UUID" },
        { name: "session_id", type: "uuid", required: true, in: "path", description: "Session UUID" }
      ]
    }
  ],

  schemas: {
    Session: {
      type: "object",
      properties: {
        id: { type: "uuid", description: "Session identifier" },
        run_id: { type: "uuid", description: "Associated run" },
        state: { type: "enum", enum: ["pending", "processing", "running", "error", "complete"], description: "Current state" },
        access: { type: "enum", enum: ["private", "public"], description: "Access level" },
        doc: { type: "text", description: "Executed XanoScript" },
        version: { type: "integer", description: "Document version" },
        response: { type: "json", description: "Execution response" },
        error_msg: { type: "text", description: "Error message if failed" },
        logs: { type: "json[]", description: "Execution logs" },
        label: { type: "text", description: "Session label" },
        tenant_id: { type: "integer", description: "Runtime tenant reference" },
        hibernate_at: { type: "timestamp", description: "Hibernation timestamp" },
        pre_time: { type: "decimal", description: "Pre-execution time" },
        post_time: { type: "decimal", description: "Post-execution time" },
        main_time: { type: "decimal", description: "Main execution time" },
        boot_time: { type: "decimal", description: "Boot time" },
        total_time: { type: "decimal", description: "Total execution time" },
        backup: { type: "object", description: "Backup info with resource and size" },
        created_at: { type: "timestamp", description: "Creation time" },
        updated_at: { type: "timestamp", description: "Last update time" }
      }
    }
  },

  related_topics: ["run", "data", "workflows"]
};
