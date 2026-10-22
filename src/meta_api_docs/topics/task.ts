import type { TopicDoc } from "../types.js";

export const taskDoc: TopicDoc = {
  topic: "task",
  title: "Scheduled Task Management",
  description: `Tasks are scheduled jobs that run automatically on a schedule: a start time and a repeat frequency in seconds, written in the task's XanoScript. They're used for background processing, periodic data sync, automated maintenance, and more.

## Key Concepts
- Tasks run on the schedule in their XanoScript: \`schedule = [{starts_on: 2026-01-01 03:00:00+0000, freq: 86400}]\` (freq in seconds; add \`ends_on\` to stop; several entries for several times)
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
- Create and update a task by sending its XanoScript as the raw body with \`Content-Type: text/x-xanoscript\`. The schedule, the \`active\` flag and the stack all live in the script; there is no cron field
- A JSON body with a \`xanoscript\` field creates a task with no stack and no schedule (the field is dropped silently), so it never runs
- Schedule frequency is in seconds: 3600 hourly, 86400 daily, 604800 weekly
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
        type: "text/x-xanoscript",
        description: "The task as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`. Its name, description, `active` flag and schedule (`schedule = [{starts_on, freq}]`, freq in seconds) come from the script. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request creates the task without its code."
      },
      example: {
        method: "POST",
        path: "/workspace/1/task",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `task "cleanup_old_sessions" {
  description = "Delete sessions older than 30 days, daily at 03:00 UTC"
  stack {
    var $cutoff { value = now|transform_timestamp:"-30 days" }
    db.bulk.delete "session" {
      where = $db.session.created_at < $cutoff
    } as $deleted
  }
  schedule = [{starts_on: 2026-01-01 03:00:00+0000, freq: 86400}]
}`
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
        type: "text/x-xanoscript",
        description: "The whole task as XanoScript, sent as the raw request body with `Content-Type: text/x-xanoscript`; it replaces the current definition. A JSON body's `xanoscript` field is not read: the route drops fields it does not declare, so a JSON request never changes the task's code."
      },
      example: {
        method: "PUT",
        path: "/workspace/1/task/4",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: `task "cleanup_old_sessions" {
  description = "Delete sessions older than 30 days, every 6 hours, paused"
  active = false
  stack {
    var $cutoff { value = now|transform_timestamp:"-30 days" }
    db.bulk.delete "session" {
      where = $db.session.created_at < $cutoff
    } as $deleted
  }
  schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 21600}]
}`
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
        datasource: { type: "string" },
        active: { type: "boolean" },
        xanoscript: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    },
    ScheduleExamples: {
      "hourly": "schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 3600}]",
      "daily_3am_utc": "schedule = [{starts_on: 2026-01-01 03:00:00+0000, freq: 86400}]",
      "weekly_monday": "schedule = [{starts_on: 2026-01-05 00:00:00+0000, freq: 604800}]",
      "twice_daily": "schedule = [{starts_on: 2026-01-01 09:00:00+0000, freq: 86400}, {starts_on: 2026-01-01 21:00:00+0000, freq: 86400}]",
      "until_year_end": "schedule = [{starts_on: 2026-01-01 08:00:00+0000, freq: 3600, ends_on: 2026-12-31 23:59:59+0000}]"
    }
  },

  related_topics: ["function", "history"]
};
