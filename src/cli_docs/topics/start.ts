import type { TopicDoc } from "../types.js";

export const startDoc: TopicDoc = {
  topic: "start",
  title: "Xano CLI - Getting Started",
  description: `The Xano CLI provides command-line access to manage your Xano workspaces, resources, and execute XanoScript.

> **Note:** The CLI is optional but recommended for local development workflows. You can accomplish most tasks using the Meta API directly, but the CLI provides a more convenient developer experience.

## Installation

**Via npm (recommended):**
\`\`\`bash
npm install -g @xano/cli
\`\`\`

**Via GitHub:**
\`\`\`bash
git clone https://github.com/xano-inc/cli.git
cd cli
npm install
npm link
\`\`\`

**Links:**
- npm: https://www.npmjs.com/package/@xano/cli
- GitHub: https://github.com/xano-inc/cli

## Quick Setup

Use the interactive wizard to configure your first profile:

\`\`\`bash
xano profile wizard
\`\`\`

This will prompt you for:
1. Your Xano access token (from Settings > Account > Metadata API in dashboard)
2. Select your instance
3. Choose a profile name
4. Optionally set default workspace

## Credential Storage

Credentials are stored in \`~/.xano/credentials.yaml\`.

## Global Flags

All commands support:
- \`-p, --profile <name>\` - Use a specific profile (overrides default)

## Environment Variables

- \`XANO_PROFILE\` - Override the default profile

## Discovering Commands

The CLI is self-documenting:

\`\`\`bash
xano --help                    # List all command categories
xano <topic> --help            # List subcommands for a topic
xano <topic> <command> --help  # Detailed flags, args, and examples
xano docs                      # View detailed documentation topics
xano docs <topic>              # View specific topic guide (e.g., xano docs table)
\`\`\`

## Command Categories

| Category | Description |
|----------|-------------|
| \`profile\` | Manage authentication profiles |
| \`workspace\` | Export/import workspaces, get context |
| \`branch\` | List and delete branches |
| \`table\` | Manage tables, schemas, content, indexes |
| \`api\` | Manage API endpoints |
| \`apigroup\` | Manage API groups |
| \`function\` | Manage reusable functions |
| \`middleware\` | Manage request/response middleware |
| \`task\` | Manage scheduled tasks |
| \`trigger\` | Manage workspace triggers |
| \`addon\` | Manage reusable query components |
| \`agent\` | Manage AI agents |
| \`tool\` | Manage AI tools |
| \`mcp-server\` | Manage MCP protocol servers |
| \`datasource\` | Manage table datasources |
| \`file\` | Upload and manage files |
| \`history\` | View execution history |
| \`audit-log\` | View change audit logs |
| \`realtime\` | Manage realtime channels |
| \`run\` | Execute XanoScript jobs and services |
| \`static_host\` | Manage static site hosting |
| \`workflow-test\` | Manage workflow tests |
| \`template\` | Apply templates to workspaces |
| \`docs\` | View detailed CLI documentation |`,

  ai_hints: `**Important:** The CLI is optional - not all users will have it installed. Before suggesting CLI commands, check if the user has it available.

**Getting started workflow:**
1. Install: \`npm install -g @xano/cli\`
2. Run wizard: \`xano profile wizard\`
3. Verify: \`xano profile me\`
4. Explore: \`xano workspace list\` then \`xano workspace context <id>\`

**Self-documenting:** The CLI has built-in help at every level:
- \`xano --help\` for all categories
- \`xano <topic> --help\` for subcommands
- \`xano <topic> <command> --help\` for full details
- \`xano docs <topic>\` for XanoScript guides

**Profile selection priority:**
1. \`-p\` flag on command
2. \`XANO_PROFILE\` environment variable
3. Default profile in credentials.yaml`,

  related_topics: ["profile", "workspace", "resources", "integration"],

  workflows: [
    {
      name: "Initial Setup",
      description: "Set up the CLI for first use",
      steps: [
        "Install: `npm install -g @xano/cli`",
        "Run wizard: `xano profile wizard`",
        "Enter your access token when prompted",
        "Select your instance and workspace",
        "Verify: `xano profile me`"
      ],
      example: `npm install -g @xano/cli
xano profile wizard
xano profile me`
    }
  ]
};
