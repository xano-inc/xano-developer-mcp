import type { TopicDoc } from "../types.js";

export const workspaceDoc: TopicDoc = {
  topic: "workspace",
  title: "Xano CLI - Workspace Operations",
  description: `Workspace commands let you manage Xano workspaces, export/import configurations, and access comprehensive workspace context.

## Key Concepts

- **Workspace Context**: Get a full dump of all tables, APIs, functions, tasks, triggers, etc. in a workspace. Especially useful for AI assistants to understand workspace structure.
- **Export/Import**: Full workspace backup and restore via archive files (.xano format).
- **Schema Export/Import**: Database schema-only operations for migration between branches.
- **OpenAPI**: Generate Swagger/OpenAPI specs for your workspace APIs.

## Available Commands

| Command | Purpose |
|---------|---------|
| \`workspace list\` | List all accessible workspaces |
| \`workspace get\` | Get workspace details |
| \`workspace context\` | Get full workspace context (tables, APIs, functions, etc.) |
| \`workspace export\` | Export workspace as archive |
| \`workspace export-schema\` | Export database schemas only |
| \`workspace import\` | Import workspace from archive |
| \`workspace import-schema\` | Import schema into a new branch |
| \`workspace openapi\` | Get OpenAPI/Swagger specification |

Run \`xano workspace <command> --help\` for detailed flags and arguments.`,

  ai_hints: `**Most useful for AI agents:**
- \`xano workspace context [workspace_id]\` dumps everything in a workspace - use this to understand the workspace structure before making changes
- \`xano workspace openapi -w <id>\` gets the API spec - useful for understanding available endpoints

**Export/Import workflow:**
- \`xano workspace export <id> -f backup.xano\` for full backup
- \`xano workspace import <id> -f backup.xano\` to restore
- \`xano workspace export-schema\` / \`import-schema\` for schema-only operations

**Discovery:**
- Run \`xano workspace <command> --help\` for detailed usage of any command

**Note:** The CLI does NOT have workspace pull/push or workspace create/edit/delete commands. Use the Meta API for creating/editing/deleting workspaces.`,

  related_topics: ["start", "branch", "resources", "integration"],

  commands: [
    {
      name: "workspace list",
      description: "List all workspaces accessible to your account",
      usage: "xano workspace list [-p <profile>] [-o summary|json]",
      examples: ["xano workspace list", "xano workspace list -o json"]
    },
    {
      name: "workspace get",
      description: "Get details of a specific workspace",
      usage: "xano workspace get [workspace_id] [-p <profile>] [-o summary|json]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID (uses profile default if not specified)" }
      ],
      examples: [
        "xano workspace get 40",
        "xano workspace get 40 -o json"
      ]
    },
    {
      name: "workspace context",
      description: "Get comprehensive context about all workspace resources (tables, APIs, functions, tasks, triggers, etc.)",
      usage: "xano workspace context [workspace_id] [-p <profile>]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID (uses profile default if not specified)" }
      ],
      examples: [
        "xano workspace context 40",
        "xano workspace context 40 > context.txt",
        "xano workspace context 40 | pbcopy  # macOS clipboard"
      ]
    },
    {
      name: "workspace export",
      description: "Export complete workspace data and configuration as an archive",
      usage: "xano workspace export [workspace_id] [-f <output_file>] [-p <profile>]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID (uses profile default if not specified)" }
      ],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Output file path (default: workspace-<id>-<timestamp>.xano)" }
      ],
      examples: [
        "xano workspace export 40 -f backup.xano",
        "xano workspace export 40"
      ]
    },
    {
      name: "workspace export-schema",
      description: "Export database table schemas and branch configuration",
      usage: "xano workspace export-schema [workspace_id] [-f <output_file>] [-p <profile>]",
      examples: [
        "xano workspace export-schema 40 -f schema.json"
      ]
    },
    {
      name: "workspace import",
      description: "Replace workspace content and configuration with imported archive",
      usage: "xano workspace import [workspace_id] -f <archive_file> [--force] [-o summary|json] [-p <profile>]",
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Input file path containing export data" },
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace import 40 -f backup.xano",
        "xano workspace import 40 -f backup.xano --force"
      ]
    },
    {
      name: "workspace import-schema",
      description: "Import database schema into a new branch with optional deployment",
      usage: "xano workspace import-schema [workspace_id] -f <schema_file> [--force] [-o summary|json] [-p <profile>]",
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Input file path containing schema export data" },
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace import-schema 40 -f schema.json",
        "xano workspace import-schema 40 -f schema.json --force"
      ]
    },
    {
      name: "workspace openapi",
      description: "Get workspace-wide OpenAPI (Swagger) specification",
      usage: "xano workspace openapi [workspace_id] [-p <profile>]",
      examples: [
        "xano workspace openapi 40",
        "xano workspace openapi 40 > openapi.json"
      ]
    }
  ],

  workflows: [
    {
      name: "Backup and Restore",
      description: "Create a workspace backup and restore it",
      steps: [
        "Export: `xano workspace export 40 -f backup.xano`",
        "Restore: `xano workspace import 41 -f backup.xano`"
      ]
    },
    {
      name: "Schema Migration",
      description: "Migrate database schema between workspaces or branches",
      steps: [
        "Export schema: `xano workspace export-schema 40 -f schema.json`",
        "Import to new branch: `xano workspace import-schema 41 -f schema.json --branch migrated`"
      ]
    },
    {
      name: "AI Context Gathering",
      description: "Get full workspace context for AI-assisted development",
      steps: [
        "Get context: `xano workspace context 40`",
        "Or save to file: `xano workspace context 40 > context.txt`",
        "Use the output to understand tables, APIs, functions, etc."
      ]
    }
  ]
};
