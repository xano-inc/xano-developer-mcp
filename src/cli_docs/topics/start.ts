import type { TopicDoc } from "../types.js";

export const startDoc: TopicDoc = {
  topic: "start",
  title: "Xano CLI - Getting Started",
  description: `The Xano CLI provides command-line access to manage your Xano workspaces, execute XanoScript, and interact with the Run API.

> **Note:** The CLI is optional but recommended for local development workflows. Not all Xano users will have it installed. You can accomplish most tasks using the Meta API directly, but the CLI provides a more convenient developer experience for code sync and local editing.

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
xano profile:wizard
\`\`\`

This will prompt you for:
1. Your Xano access token (from Settings > Access Tokens in dashboard)
2. Select your instance
3. Select a workspace
4. Select a branch
5. Select a Run project (optional)

## Credential Storage

Credentials are stored in \`~/.xano/credentials.yaml\`:

\`\`\`yaml
profiles:
  default:
    instance_origin: https://your-instance.xano.io
    access_token: <your-token>
    workspace: 1
    branch: 1
    project: abc123
default: default
\`\`\`

## Global Flags

All commands support:
- \`-p, --profile <name>\` - Use a specific profile (overrides default)
- \`-v, --verbose\` - Show detailed HTTP request/response logs

## Environment Variables

- \`XANO_PROFILE\` - Override the default profile
- \`XANO_VERBOSE\` - Enable verbose logging

## Command Categories

| Category | Description |
|----------|-------------|
| \`profile:*\` | Manage authentication profiles |
| \`workspace:*\` | Sync workspaces (pull/push) |
| \`function:*\` | Manage functions |
| \`run:*\` | Execute code and manage Run projects |
| \`static_host:*\` | Deploy static sites |`,

  ai_hints: `**Important:** The CLI is optional - not all users will have it installed. Before suggesting CLI commands, check if the user has it available or ask if they'd like to install it. The Meta API can accomplish the same tasks programmatically.

**When to use CLI vs Meta API:**
- Use CLI for: local development, code sync, quick execution, scripting
- Use Meta API for: programmatic management, integrations, automation from code
- If CLI not installed: Use Meta API endpoints directly

**Getting started workflow (if CLI is installed):**
1. Run \`xano profile:wizard\` to set up authentication
2. Use \`xano workspace:pull ./code\` to download workspace code
3. Edit .xs files locally
4. Use \`xano workspace:push ./code\` to deploy changes

**Profile selection priority:**
1. \`-p\` flag on command
2. \`XANO_PROFILE\` environment variable
3. Default profile in credentials.yaml`,

  related_topics: ["profile", "workspace", "integration"],

  workflows: [
    {
      name: "Initial Setup",
      description: "Set up the CLI for first use",
      steps: [
        "Install: `npm install -g @xano/cli`",
        "Run wizard: `xano profile:wizard`",
        "Enter your access token when prompted",
        "Select your instance, workspace, and branch",
        "Verify: `xano profile:me`"
      ],
      example: `npm install -g @xano/cli
xano profile:wizard
xano profile:me`
    }
  ]
};
