import type { TopicDoc } from "../../meta_api_docs/types.js";

export const workflowsDoc: TopicDoc = {
  topic: "workflows",
  title: "Common Workflows",
  description: `Step-by-step guides for common multi-step tasks using the Xano Run API.

## Quick Reference
- **Execute Script**: validate doc → execute → check session
- **Monitor Session**: list sessions → get details → check state
- **Export Data**: execute service → wait for hibernate → get sink
- **Re-execute**: get history → re-execute with overrides`,

  ai_hints: `- Always validate scripts with doc/info before execution
- Monitor session state changes for long-running services
- Clean up unused sessions to conserve resources
- Use the fixed base URL: https://app.dev.xano.com/api:run/<endpoint>
- Sessions auto-hibernate after project timeout
- Export data via /sink only after hibernation`,

  patterns: [
    {
      name: "Execute New XanoScript",
      description: "Validate, execute, and monitor a XanoScript job",
      steps: [
        "1. `POST /project/{project_id}/doc/info` - Validate script structure",
        "2. `POST /project/{project_id}/run/exec` - Execute the script",
        "3. `GET /session/{session_id}` - Check execution status",
        "4. (if running) Poll session until state is 'complete' or 'error'"
      ],
      example: `// 1. Validate document
POST https://app.dev.xano.com/api:run/project/abc123/doc/info
{
  "doc": "job process_data {\\n  response = db.items.query().all()\\n}"
}

// 2. Execute
POST https://app.dev.xano.com/api:run/project/abc123/run/exec
{
  "doc": "job process_data {\\n  response = db.items.query().all()\\n}",
  "args": {},
  "template": "small"
}

// 3. Check status
GET https://app.dev.xano.com/api:run/session/{returned_session_id}`
    },
    {
      name: "Run a Persistent Service",
      description: "Start a long-running service and manage its lifecycle",
      steps: [
        "1. `POST /project/{project_id}/run/exec` - Start service (type: service)",
        "2. `GET /session/{session_id}` - Verify service is running",
        "3. `POST /session/{session_id}/access` - Optionally make public",
        "4. `POST /session/{session_id}/exec` - Re-execute with new code if needed",
        "5. `POST /project/{project_id}/run/{run_id}/session/{session_id}/stop` - Stop when done"
      ],
      example: `// 1. Start service
POST https://app.dev.xano.com/api:run/project/abc123/run/exec
{
  "doc": "service my_api {\\n  endpoint GET /hello {\\n    response = 'Hello!'\\n  }\\n}",
  "args": {}
}

// 2. Stop service when done
POST https://app.dev.xano.com/api:run/project/abc123/run/{run_id}/session/{session_id}/stop`
    },
    {
      name: "Export Session Data",
      description: "Export all data from a session after hibernation",
      steps: [
        "1. Execute a run (job or service)",
        "2. Wait for session to hibernate (auto or via stop)",
        "3. `GET /session/{session_id}/sink` - Export all data"
      ],
      example: `// 1. After session has run and hibernated
GET https://app.dev.xano.com/api:run/session/{session_id}/sink

// Response includes all tables and records as JSON`
    },
    {
      name: "Re-execute with Modified Arguments",
      description: "Run an existing script again with different inputs",
      steps: [
        "1. `GET /project/{project_id}/run` - Get run history",
        "2. Find the run_id you want to re-execute",
        "3. `POST /project/{project_id}/run/{run_id}/exec` - Re-execute with new args"
      ],
      example: `// 1. Get history
GET https://app.dev.xano.com/api:run/project/abc123/run

// 2. Re-execute with different args
POST https://app.dev.xano.com/api:run/project/abc123/run/{run_id}/exec
{
  "args": {
    "batch_size": 100,
    "mode": "production"
  }
}`
    },
    {
      name: "Monitor Active Sessions",
      description: "List and monitor running sessions for a project",
      steps: [
        "1. `GET /project/{project_id}/run/session` - List all sessions",
        "2. Filter by state (running, pending, etc.)",
        "3. `GET /session/{session_id}` - Get details for specific session",
        "4. Take action based on state (stop, re-execute, export)"
      ],
      example: `// 1. List sessions
GET https://app.dev.xano.com/api:run/project/abc123/run/session?page=1

// 2. Check specific session
GET https://app.dev.xano.com/api:run/session/{session_id}

// 3. Stop if needed
POST https://app.dev.xano.com/api:run/project/abc123/run/{run_id}/session/{session_id}/stop`
    },
    {
      name: "Debug Failed Execution",
      description: "Investigate why a run failed",
      steps: [
        "1. `GET /session/{session_id}` - Check session state and error_msg",
        "2. Review the 'logs' field for execution details",
        "3. `POST /project/{project_id}/doc/info` - Validate the script syntax",
        "4. Fix issues and re-execute"
      ],
      example: `// 1. Get session details
GET https://app.dev.xano.com/api:run/session/{session_id}

// Response includes:
// - state: "error"
// - error_msg: "Detailed error message"
// - logs: [...execution logs...]

// 2. Validate fixed script
POST https://app.dev.xano.com/api:run/project/abc123/doc/info
{
  "doc": "job fixed_script {\\n  // corrected code\\n}"
}`
    }
  ],

  related_topics: ["start", "run", "session", "data"]
};
