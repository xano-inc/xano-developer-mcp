import type { TopicDoc } from "../types.js";

export const startDoc: TopicDoc = {
  topic: "start",
  title: "Xano CLI - Getting Started",
  description: `The Xano CLI provides command-line access to manage your Xano workspaces, resources, branches, releases, and multi-tenant deployments.

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

**Option 1: Browser login (recommended)**
\`\`\`bash
xano auth
\`\`\`
Opens your browser for Xano login, then creates a profile automatically.

**Option 2: Interactive wizard**
\`\`\`bash
xano profile wizard
\`\`\`
Prompts for your access token (from Settings > Account > Metadata API in dashboard), selects your instance, and creates a profile.

**Option 3: Direct creation**
\`\`\`bash
xano profile create my-profile -i https://your-instance.xano.io -t <access_token>
\`\`\`

## Credential Storage

Credentials are stored in \`~/.xano/credentials.yaml\`.

## Global Flags

All commands support:
- \`-p, --profile <name>\` - Use a specific profile (overrides default)
- \`-v, --verbose\` - Show detailed request/response information

## Environment Variables

- \`XANO_PROFILE\` - Override the default profile
- \`XANO_VERBOSE\` - Enable verbose output

## Discovering Commands

The CLI is self-documenting:

\`\`\`bash
xano --help                    # List all command categories
xano <topic> --help            # List subcommands for a topic
xano <topic> <command> --help  # Detailed flags, args, and examples
\`\`\`

## Command Categories

| Category | Description |
|----------|-------------|
| \`profile\` | Manage authentication profiles |
| \`workspace\` | Manage workspaces (create, edit, delete, pull, push) |
| \`branch\` | Manage branches (create, edit, delete, set live) |
| \`function\` | Manage reusable functions |
| \`sandbox\` | Sandbox environment for safe development and testing |
| \`release\` | Manage versioned releases for deployment |
| \`tenant\` | Manage multi-tenant deployments (enterprise) |
| \`platform\` | View platform details |
| \`static_host\` | Manage static site hosting and builds |
| \`unit_test\` | Run unit tests |
| \`workflow_test\` | Manage and run workflow tests |
| \`auth\` | Browser-based authentication |
| \`update\` | Update the CLI to latest version |
| \`plugins\` | List installed plugins |

## Recommended Development Workflow

The safest way to make changes is through the **sandbox**:

1. Pull your workspace: \`xano workspace pull ./my-workspace\`
2. Edit XanoScript files locally
3. Push to sandbox: \`xano sandbox push ./my-workspace\`
4. Review and promote: \`xano sandbox review\`

> **Warning:** Direct \`workspace push\` can overwrite production data. Use the sandbox workflow unless you specifically need direct push and understand the risks.`,

  ai_hints: `**Important:** The CLI is optional - not all users will have it installed. Before suggesting CLI commands, check if the user has it available.

**Getting started workflow:**
1. Install: \`npm install -g @xano/cli\`
2. Authenticate: \`xano auth\` (browser) or \`xano profile wizard\` (token)
3. Verify: \`xano profile me\`
4. Explore: \`xano workspace list\` then \`xano workspace pull ./my-workspace\`

**Recommended change workflow (safe):**
1. \`xano workspace pull ./local-dir\` — pull current state
2. Edit .xs files locally
3. \`xano sandbox push ./local-dir\` — push to sandbox
4. \`xano sandbox review\` — review and promote changes

**Self-documenting:** The CLI has built-in help at every level:
- \`xano --help\` for all categories
- \`xano <topic> --help\` for subcommands
- \`xano <topic> <command> --help\` for full details

**Profile selection priority:**
1. \`-p\` flag on command
2. \`XANO_PROFILE\` environment variable
3. Default profile in credentials.yaml`,

  related_topics: ["profile", "workspace", "sandbox", "integration"],

  workflows: [
    {
      name: "Initial Setup",
      description: "Set up the CLI for first use",
      steps: [
        "Install: `npm install -g @xano/cli`",
        "Authenticate: `xano auth` (opens browser)",
        "Verify: `xano profile me`",
        "List workspaces: `xano workspace list`",
        "Pull workspace: `xano workspace pull ./my-workspace`"
      ],
      example: `npm install -g @xano/cli
xano auth
xano profile me
xano workspace list`
    }
  ]
};
