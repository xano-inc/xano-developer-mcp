import type { TopicDoc } from "../types.js";

export const taskDoc: TopicDoc = {
  topic: "task",
  title: "Scheduled Task Management",
  description: `Tasks are scheduled jobs that run automatically based on a cron schedule. They're used for background processing, periodic data sync, automated maintenance, and more.

## Key Concepts
- Tasks run on a schedule (cron syntax)
- No HTTP trigger - runs automatically
- Can access databases, call functions, make external requests
- Support draft/publish workflow
- Restricted to paid accounts

## Common Use Cases
- Data cleanup and archiving
- Report generation
- External API sync
- Notification sending
- Cache warming`,

  ai_hints: `- Tasks require paid account (will fail on free tier)
- Use cron syntax for scheduling (e.g., "0 * * * *" for hourly)
- Tasks have no HTTP inputs - all data comes from database or environment
- Draft changes won't affect running schedule until published
- Check task history to debug execution issues`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/task",
      tool_name: "listTasks",
      description: "List all scheduled tasks in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by task name" },
        { name: "sort", type: "string", enum: ["id", "name", "created_at"], default: "created_at", description: "Sort field" },
        { name: "order", type: "string", enum: ["asc", "desc"], default: "desc", description: "Sort direction" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft versions" },
        { name: "branch", type: "string", description: "Filter by branch name" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/task/{task_id}",
      tool_name: "getTask",
      description: "Get details of a specific scheduled task.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "task_id", type: "integer", required: true, in: "path", description: "Task ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript code" },
        { name: "include_draft", type: "boolean", default: false, description: "Include draft version" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/task",
      tool_name: "createTask",
      description: "Create a new scheduled task. Requires paid account.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Task name", required: true },
          description: { type: "string", description: "Task description" },
          schedule: { type: "string", description: "Cron expression (e.g., '0 * * * *' for hourly)", required: true },
          active: { type: "boolean", description: "Whether task is active", required: true },
          xanoscript: { type: "string", description: "XanoScript task definition", required: true }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/task",
        body: {
          name: "cleanup_old_sessions",
          description: "Delete sessions older than 30 days",
          schedule: "0 3 * * *",
          active: true,
          xanoscript: `task cleanup_old_sessions {
  stack {
    var $cutoff {
      value = now() - 30.days
    }
    db.sessions.query()
      .where("created_at", "<", $cutoff)
      .delete()
  }
}`
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/task/{task_id}",
      tool_name: "updateTask",
      description: "Update an existing scheduled task.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "task_id", type: "integer", required: true, in: "path", description: "Task ID" },
        { name: "publish", type: "boolean", default: true, description: "Publish changes immediately" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Task name" },
          description: { type: "string", description: "Task description" },
          schedule: { type: "string", description: "Cron expression" },
          active: { type: "boolean", description: "Whether task is active" },
          xanoscript: { type: "string", description: "XanoScript task definition" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/task/{task_id}",
      tool_name: "deleteTask",
      description: "Delete a scheduled task.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "task_id", type: "integer", required: true, in: "path", description: "Task ID" }
      ]
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/task/{task_id}/security",
      tool_name: "updateTaskSecurity",
      description: "Update security settings for the task.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "task_id", type: "integer", required: true, in: "path", description: "Task ID" }
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
    Task: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        schedule: { type: "string", description: "Cron expression" },
        active: { type: "boolean" },
        xanoscript: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    },
    CronExamples: {
      "every_minute": "* * * * *",
      "every_hour": "0 * * * *",
      "every_day_midnight": "0 0 * * *",
      "every_day_3am": "0 3 * * *",
      "every_monday": "0 0 * * 1",
      "first_of_month": "0 0 1 * *"
    }
  },

  related_topics: ["function", "history"]
};
