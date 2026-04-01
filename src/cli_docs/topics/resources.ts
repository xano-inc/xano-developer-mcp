import type { TopicDoc } from "../types.js";

export const resourcesDoc: TopicDoc = {
  topic: "resources",
  title: "Xano CLI - Resource Management Reference",
  description: `The Xano CLI manages many resource types. Most follow the same CRUD pattern with consistent flags.

## Common Pattern

Most resources support these subcommands:

\`\`\`bash
xano <resource> list [-w <workspace>] [-o summary|json] [--search <term>]
xano <resource> get <id> [-w <workspace>] [-o summary|json|xs]
xano <resource> create [-w <workspace>] -f <file.xs> [-o summary|json]
xano <resource> edit <id> [-w <workspace>] -f <file.xs>
xano <resource> delete <id> [-w <workspace>] [--force]
xano <resource> security <id> [-w <workspace>]
\`\`\`

## Common Flags

| Flag | Short | Description |
|------|-------|-------------|
| \`--workspace\` | \`-w\` | Workspace ID (optional if set in profile) |
| \`--output\` | \`-o\` | Output format: summary (default), json, xs |
| \`--profile\` | \`-p\` | Profile to use |
| \`--file\` | \`-f\` | XanoScript file path for create/edit |
| \`--force\` | | Skip confirmation on delete |
| \`--search\` | \`-s\` | Filter list results |
| \`--page\` | | Page number for pagination |
| \`--per_page\` | | Items per page |

## Resource Types

### Standard CRUD Resources (list, get, create, edit, delete, security)

| Resource | CLI Command | Description |
|----------|------------|-------------|
| **Function** | \`xano function\` | Reusable business logic |
| **Middleware** | \`xano middleware\` | Request/response processing |
| **Task** | \`xano task\` | Scheduled background jobs (cron) |
| **Trigger** | \`xano trigger\` | Event-driven workspace triggers |
| **Addon** | \`xano addon\` | Reusable query components for tables |
| **Tool** | \`xano tool\` | AI tools for agents and MCP servers |
| **Workflow Test** | \`xano workflow-test\` | Workflow test definitions |

### Resources with Sub-resources

#### Table (\`xano table\`)
The most complex resource. Has sub-command groups:

| Sub-group | Commands | Purpose |
|-----------|----------|---------|
| Core | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\` | Table CRUD |
| \`table schema\` | \`get\`, \`replace\`, \`column add\`, \`column delete\`, \`column get\`, \`column rename\` | Schema management |
| \`table content\` | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\`, \`search\`, \`truncate\`, \`bulk-create\`, \`bulk-delete\`, \`bulk-patch\` | Record CRUD |
| \`table index\` | \`list\`, \`create\`, \`delete\`, \`replace\` | Index management |
| \`table trigger\` | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\`, \`security\` | Table-level triggers |

For XanoScript table syntax: \`xano docs table\`

#### Agent (\`xano agent\`)
AI agents with LLM integration. Standard CRUD plus:

| Sub-group | Commands |
|-----------|----------|
| Core | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\` |
| \`agent trigger\` | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\`, \`security\` |

For XanoScript agent syntax: \`xano docs agent\`

#### MCP Server (\`xano mcp-server\`)
Model Context Protocol servers that expose tools. Standard CRUD plus:

| Sub-group | Commands |
|-----------|----------|
| Core | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\` |
| \`mcp-server trigger\` | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\`, \`security\` |

For XanoScript MCP server syntax: \`xano docs mcp-server\`

#### Realtime (\`xano realtime\`)
Real-time channels and their triggers:

| Sub-group | Commands |
|-----------|----------|
| Core | \`get\`, \`edit\` |
| \`realtime channel\` | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\` |
| \`realtime channel trigger\` | \`list\`, \`get\`, \`create\`, \`edit\`, \`delete\`, \`security\` |

### Simpler Resources

| Resource | CLI Command | Commands | Description |
|----------|------------|----------|-------------|
| **API** | \`xano api\` | list, get, create, edit, delete | REST API endpoints (note: \`api list\` requires APIGROUP_ID arg) |
| **API Group** | \`xano apigroup\` | list, get, create, edit, delete | Groups of API endpoints |
| **Datasource** | \`xano datasource\` | list, create, edit, delete | Table organization/grouping |
| **File** | \`xano file\` | list, upload, delete, bulk-delete | File management |

## XanoScript File Input

Most create/edit commands accept a \`-f <file>.xs\` flag to read XanoScript definitions:

\`\`\`bash
# Create a resource from XanoScript
xano table create -w 40 -f my_table.xs
xano function create -w 40 -f my_function.xs
xano agent create -w 40 -f my_agent.xs

# Edit a resource with updated XanoScript
xano function edit 145 -w 40 -f updated_function.xs

# Export resource as XanoScript
xano function get 145 -o xs > my_function.xs
\`\`\`

## Discovering Commands

\`\`\`bash
xano --help                           # List all resource categories
xano <resource> --help                # List subcommands
xano <resource> <command> --help      # Full flags, args, examples
xano docs <topic>                     # XanoScript syntax guides
\`\`\``,

  ai_hints: `**Pattern recognition:** Almost all resources follow the same CRUD pattern. Once you know one, you know them all:
- \`xano <resource> list -w <id>\` to list
- \`xano <resource> get <id> -w <id> -o xs\` to export as XanoScript
- \`xano <resource> create -w <id> -f file.xs\` to create
- \`xano <resource> edit <id> -w <id> -f file.xs\` to update
- \`xano <resource> delete <id> -w <id> --force\` to delete

**Table is the most complex:** It has content, schema, index, and trigger sub-commands. Use \`xano table --help\` to see all options.

**AI-related resources:** agent, tool, mcp-server are the AI/MCP resources. Agents use tools, MCP servers expose tools to external clients.

**Discovery is key:** When unsure about a command's flags:
- Run \`xano <resource> <command> --help\` for full details
- Run \`xano docs <topic>\` for XanoScript syntax guides

**XanoScript workflow:**
1. Get resource as XanoScript: \`xano <resource> get <id> -o xs > file.xs\`
2. Edit the .xs file
3. Push changes: \`xano <resource> edit <id> -f file.xs\``,

  related_topics: ["start", "workspace", "function", "integration"],

  commands: [
    {
      name: "xano <resource> list",
      description: "List resources in a workspace (works for all resource types)",
      usage: "xano <resource> list [-w <workspace>] [-o summary|json] [--search <term>] [--page <n>] [--per_page <n>]",
      examples: [
        "xano table list -w 40",
        "xano function list --search auth",
        "xano agent list -o json",
        "xano api list -w 40"
      ]
    },
    {
      name: "xano <resource> get",
      description: "Get a specific resource by ID (works for all resource types)",
      usage: "xano <resource> get <id> [-w <workspace>] [-o summary|json|xs]",
      examples: [
        "xano table get 123 -w 40",
        "xano function get 145 -o xs > func.xs",
        "xano agent get 10 -o json"
      ]
    },
    {
      name: "xano <resource> create",
      description: "Create a resource from XanoScript file (works for most resource types)",
      usage: "xano <resource> create [-w <workspace>] -f <file.xs> [-o summary|json]",
      examples: [
        "xano table create -w 40 -f table.xs",
        "xano function create -w 40 -f function.xs",
        "xano agent create -w 40 -f agent.xs"
      ]
    },
    {
      name: "xano <resource> edit",
      description: "Edit a resource with updated XanoScript (works for most resource types)",
      usage: "xano <resource> edit <id> [-w <workspace>] -f <file.xs>",
      examples: [
        "xano function edit 145 -w 40 -f updated.xs",
        "xano table edit 123 -w 40 -f table.xs"
      ]
    },
    {
      name: "xano <resource> delete",
      description: "Delete a resource (works for all resource types)",
      usage: "xano <resource> delete <id> [-w <workspace>] [--force]",
      examples: [
        "xano function delete 145 --force",
        "xano table delete 123 -w 40 --force"
      ]
    }
  ],

  workflows: [
    {
      name: "Edit a Resource via XanoScript",
      description: "Export, edit, and re-import a resource using XanoScript files",
      steps: [
        "Export: `xano function get 145 -o xs > func.xs`",
        "Edit the .xs file in your editor",
        "Import: `xano function edit 145 -f func.xs`"
      ],
      example: `xano function get 145 -o xs > auth_check.xs
# Edit auth_check.xs...
xano function edit 145 -f auth_check.xs`
    },
    {
      name: "Create Resources in Order",
      description: "Create dependent resources (tables first, then addons, then functions)",
      steps: [
        "Create table: `xano table create -w 40 -f user_activity.xs`",
        "Create addon: `xano addon create -w 40 -f activity_count.xs`",
        "Create function: `xano function create -w 40 -f get_stats.xs`"
      ]
    }
  ]
};
