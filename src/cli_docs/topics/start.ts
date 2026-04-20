import type { TopicDoc } from "../types.js";

export const startDoc: TopicDoc = {
  topic: "start",
  title: "Xano CLI - Getting Started",
  description: `The Xano CLI provides command-line access to manage your Xano workspaces, sandbox environments, branches, releases, and tenants.

> **Note:** The CLI is optional but recommended for local development workflows. Not all Xano users will have it installed. You can accomplish most tasks using the Meta API directly, but the CLI provides a more convenient developer experience for code sync and local editing.

## Installation

**Requirements:** Node.js >= 20.12.0

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
Opens your browser to log in. Automatically creates a profile.

**Option 2: Interactive wizard**
\`\`\`bash
xano profile wizard
\`\`\`
Prompts you for your access token, instance, workspace, and branch.

## Credential Storage

Credentials are stored in \`~/.xano/credentials.yaml\` by default (override with \`-c/--config\` or \`XANO_CONFIG\`):

\`\`\`yaml
profiles:
  default:
    account_origin: https://app.xano.com   # optional, for custom/self-hosted accounts
    instance_origin: https://your-instance.xano.io
    access_token: <your-token>
    workspace: 1
    branch: v1
    insecure: false                        # optional, skip TLS verification
default: default
\`\`\`

## Global Flags

All commands support:
- \`-p, --profile <name>\` - Use a specific profile (overrides default)
- \`-c, --config <path>\` - Path to credentials file (default: \`~/.xano/credentials.yaml\`)
- \`-v, --verbose\` - Show detailed HTTP request/response logs

## Environment Variables

- \`XANO_PROFILE\` - Override the default profile (same effect as \`-p\`)
- \`XANO_CONFIG\` - Override the credentials file path (same effect as \`-c\`)
- \`XANO_VERBOSE\` - Enable verbose logging (same effect as \`-v\`)

## Command Categories

| Category | Description |
|----------|-------------|
| \`auth\` | Browser-based OAuth login |
| \`profile\` | Manage authentication profiles |
| \`workspace\` | Sync workspaces (pull/push), git integration |
| \`sandbox\` | Personal auto-provisioned dev environment (free-tier friendly) |
| \`branch\` | Manage workspace branches |
| \`function\` | Manage individual functions |
| \`release\` | Create and manage named releases |
| \`tenant\` | Manage tenants, deployments, backups, env vars |
| \`unit_test\` | Run unit tests |
| \`workflow_test\` | Run workflow tests |
| \`platform\` | View available platform versions |
| \`static_host\` | Deploy static sites |
| \`update\` | Update CLI to latest version |`,

  ai_hints: `**Important:** The CLI is optional - not all users will have it installed. Before suggesting CLI commands, check if the user has it available or ask if they'd like to install it. The Meta API can accomplish the same tasks programmatically.

**When to use CLI vs Meta API:**
- Use CLI for: local development, code sync, quick execution, scripting
- Use Meta API for: programmatic management, integrations, automation from code
- If CLI not installed: Use Meta API endpoints directly

**Getting started workflow (if CLI is installed):**
1. Run \`xano auth\` (browser login) or \`xano profile wizard\` (token-based) to set up authentication
2. Use \`xano workspace pull -d ./code\` to download workspace code (or \`xano sandbox pull -d ./code\` for the personal dev sandbox)
3. Edit .xs files locally
4. Use \`xano workspace push -d ./code\` to deploy changes (or \`xano sandbox push --review\`)

**Profile selection priority:**
1. \`-p\` flag on command
2. \`XANO_PROFILE\` environment variable
3. Default profile in credentials.yaml`,

  related_topics: ["auth", "profile", "workspace", "sandbox", "integration"],

  workflows: [
    {
      name: "Initial Setup",
      description: "Set up the CLI for first use",
      steps: [
        "Install: `npm install -g @xano/cli`",
        "Run wizard: `xano profile wizard`",
        "Enter your access token when prompted",
        "Select your instance, workspace, and branch",
        "Verify: `xano profile me`"
      ],
      example: `npm install -g @xano/cli
xano profile wizard
xano profile me`
    }
  ]
};
