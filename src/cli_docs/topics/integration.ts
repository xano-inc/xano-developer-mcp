import type { TopicDoc } from "../types.js";

export const integrationDoc: TopicDoc = {
  topic: "integration",
  title: "Xano CLI + Meta API Integration Guide",
  description: `This guide explains when to use the CLI vs the Meta API, and how they work together for different workflows.

> **Note:** The CLI is optional but recommended for local development. Everything the CLI does can also be accomplished via the Meta API and Run API directly.

## CLI Installation (Optional)

\`\`\`bash
npm install -g @xano/cli
\`\`\`

- npm: https://www.npmjs.com/package/@xano/cli
- GitHub: https://github.com/xano-inc/cli

## CLI vs Meta API

| Task | Use CLI | Use Meta API |
|------|---------|--------------|
| Quick resource edits (function, api, etc.) | Yes | - |
| Export/import workspaces | Yes | - |
| Get workspace context | Yes | - |
| Execute XanoScript (jobs/services) | Yes | Yes (Run API) |
| CI/CD automation | Both | Both |
| Programmatic management | - | Yes |
| Create/edit tables/schemas | Yes | Yes |
| Build integrations | - | Yes |
| Manage branches (create/edit) | - | Yes |
| Generate OpenAPI specs | Yes | Yes |

## Authentication

Both use the same access token from your Xano dashboard:

**CLI:** Stored in \`~/.xano/credentials.yaml\`
\`\`\`bash
xano profile wizard  # Interactive setup
\`\`\`

**Meta API:** Bearer token in Authorization header
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## API URLs

| API | Base URL | Purpose |
|-----|----------|---------|
| Meta API | \`https://<instance>.xano.io/api:meta\` | Manage resources |
| Run API | \`https://app.dev.xano.com/api:run\` | Execute code |

The CLI uses both APIs internally.`,

  ai_hints: `**Important:** The CLI is optional. Before suggesting CLI commands, verify the user has it installed or offer to help them install it.

**Decision tree for AI:**

1. **User wants to understand workspace structure?** → \`xano workspace context <id>\`
2. **User wants to edit code (functions, APIs, etc.)?**
   - With CLI: \`xano <resource> get <id> -o xs > file.xs\`, edit, then \`xano <resource> edit <id> -f file.xs\`
   - Without CLI: Use Meta API endpoints
3. **User wants to execute XanoScript?**
   - With CLI: \`xano run job -f script.xs\`
   - Without CLI: Use Run API directly
4. **User wants to create/modify tables?** → CLI: \`xano table create -f table.xs\` or Meta API
5. **User wants to backup/migrate?** → CLI: \`xano workspace export/import\`
6. **User wants automation in code?** → Meta API (HTTP calls)
7. **User wants shell scripting?** → CLI commands (if installed)

**Discovery:** The CLI is self-documenting:
- \`xano --help\` lists all categories
- \`xano <topic> --help\` lists subcommands
- \`xano <topic> <command> --help\` shows full details
- \`xano docs <topic>\` shows XanoScript syntax guides

**Token reuse (if CLI is installed):**
\`\`\`bash
TOKEN=$(xano profile token)
curl -H "Authorization: Bearer $TOKEN" https://instance.xano.io/api:meta/workspace
\`\`\``,

  related_topics: ["start", "profile", "workspace", "resources"],

  workflows: [
    {
      name: "Local Development with Version Control",
      description: "Full workflow using CLI for resource management and git for versioning",
      steps: [
        "Setup: `xano profile wizard`",
        "Get context: `xano workspace context <id>` to understand workspace structure",
        "Export resource: `xano function get <id> -o xs > my_function.xs`",
        "Edit .xs files in your IDE",
        "Validate with MCP: Use `validate_xanoscript` tool",
        "Push changes: `xano function edit <id> -f my_function.xs`",
        "Test in Xano dashboard"
      ]
    },
    {
      name: "CI/CD Pipeline",
      description: "Automated deployment using CLI in CI/CD",
      steps: [
        "Store XANO_TOKEN as CI secret",
        "Create profile in CI: `xano profile create --name ci --token $XANO_TOKEN`",
        "Run operations: e.g., `xano workspace import <id> -f backup.xano -p ci`"
      ],
      example: `# GitHub Actions example
- name: Deploy to Xano
  env:
    XANO_TOKEN: \${{ secrets.XANO_TOKEN }}
  run: |
    npm install -g @xano/cli
    xano profile create --name deploy --token $XANO_TOKEN
    xano workspace import 40 -f workspace.xano -p deploy`
    },
    {
      name: "Export Token for API Calls",
      description: "Use CLI-stored credentials with Meta API",
      steps: [
        "Get token: `TOKEN=$(xano profile token)`",
        "Use in curl: `curl -H \"Authorization: Bearer $TOKEN\" <api-url>`"
      ],
      example: `TOKEN=$(xano profile token)
curl -H "Authorization: Bearer $TOKEN" \\
  https://x8ki.xano.io/api:meta/workspace`
    },
    {
      name: "Multi-Environment Workflow",
      description: "Manage staging and production with profiles",
      steps: [
        "Create staging profile: `xano profile create --name staging --token <token>`",
        "Create production profile: `xano profile create --name prod --token <token>`",
        "Work on staging: `xano table list -p staging`",
        "Work on production: `xano table list -p prod`"
      ]
    }
  ]
};
