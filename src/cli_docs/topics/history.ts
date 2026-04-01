import type { TopicDoc } from "../types.js";

export const historyDoc: TopicDoc = {
  topic: "history",
  title: "Xano CLI - Execution History & Audit Logs",
  description: `Commands for viewing execution history and audit logs. Useful for debugging, monitoring, and compliance.

## Execution History

Track runtime executions across different resource types:

\`\`\`bash
xano history <type> list [-w <workspace>] [-o summary|json]
xano history <type> search [-w <workspace>] [search flags]
\`\`\`

### History Types

| Type | Command | What It Tracks |
|------|---------|---------------|
| Request | \`xano history request\` | API endpoint executions |
| Function | \`xano history function\` | Function executions |
| Task | \`xano history task\` | Scheduled task runs |
| Trigger | \`xano history trigger\` | Trigger executions |
| Middleware | \`xano history middleware\` | Middleware executions |
| Tool | \`xano history tool\` | AI tool executions |

Each type supports \`list\` and \`search\` subcommands.

## Audit Logs

Track configuration changes (who changed what, when):

| Command | Purpose |
|---------|---------|
| \`audit-log list\` | List workspace audit logs |
| \`audit-log search\` | Search workspace audit logs |
| \`audit-log global-list\` | List audit logs across all workspaces |
| \`audit-log global-search\` | Search audit logs across all workspaces |

Run \`xano history <type> <command> --help\` or \`xano audit-log <command> --help\` for detailed flags.`,

  ai_hints: `**When to use:**
- \`history request\` - debugging API errors, performance issues
- \`history function\` / \`history task\` / \`history trigger\` - debugging background processes
- \`history tool\` - debugging AI tool execution
- \`audit-log\` - tracking configuration changes (who changed what)

**Key search flags (vary by type):**
- \`--status\` - filter by HTTP status code (request history)
- Request history search supports method, path, and status filters
- Other types support filtering by resource ID

**Discovery:** Run \`xano history <type> search --help\` for available search filters.`,

  related_topics: ["resources", "workspace"],

  commands: [
    {
      name: "history request list",
      description: "List API request execution history",
      usage: "xano history request list [-w <workspace>] [-o summary|json] [--page <n>] [--per_page <n>]",
      examples: [
        "xano history request list -w 40",
        "xano history request list -o json"
      ]
    },
    {
      name: "history request search",
      description: "Search API request history with filters",
      usage: "xano history request search [-w <workspace>] [--status <code>] [-o summary|json]",
      examples: [
        "xano history request search -w 40 --status 500",
        "xano history request search -w 40 -o json"
      ]
    },
    {
      name: "history <type> list",
      description: "List execution history for any resource type (function, task, trigger, middleware, tool)",
      usage: "xano history <type> list [-w <workspace>] [-o summary|json]",
      examples: [
        "xano history function list -w 40",
        "xano history task list -w 40",
        "xano history tool list -w 40 -o json"
      ]
    },
    {
      name: "history <type> search",
      description: "Search execution history for any resource type",
      usage: "xano history <type> search [-w <workspace>] [search flags] [-o summary|json]",
      examples: [
        "xano history function search -w 40",
        "xano history task search -w 40",
        "xano history trigger search -w 40"
      ]
    },
    {
      name: "audit-log list",
      description: "List workspace configuration change audit logs",
      usage: "xano audit-log list [-w <workspace>] [-o summary|json] [--page <n>] [--per_page <n>]",
      examples: [
        "xano audit-log list -w 40",
        "xano audit-log list -w 40 -o json"
      ]
    },
    {
      name: "audit-log search",
      description: "Search workspace audit logs with filters",
      usage: "xano audit-log search [-w <workspace>] [--action <type>] [--resource-type <type>] [-o summary|json]",
      examples: [
        "xano audit-log search -w 40 --action DELETE",
        "xano audit-log search -w 40 --resource-type table"
      ]
    },
    {
      name: "audit-log global-list",
      description: "List audit logs across all workspaces",
      usage: "xano audit-log global-list [-o summary|json]",
      examples: ["xano audit-log global-list -o json"]
    },
    {
      name: "audit-log global-search",
      description: "Search audit logs across all workspaces",
      usage: "xano audit-log global-search [--action <type>] [-o summary|json]",
      examples: ["xano audit-log global-search --action DELETE"]
    }
  ],

  workflows: [
    {
      name: "Debug Failed Requests",
      description: "Find and investigate API errors",
      steps: [
        "Search for errors: `xano history request search -w 40 --status 500`",
        "Get details: `xano history request list -w 40 -o json`"
      ]
    },
    {
      name: "Track Configuration Changes",
      description: "See who changed what in the workspace",
      steps: [
        "List recent changes: `xano audit-log list -w 40`",
        "Search for deletions: `xano audit-log search -w 40 --action DELETE`"
      ]
    }
  ]
};
