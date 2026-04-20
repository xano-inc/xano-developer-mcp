import type { TopicDoc } from "../types.js";

export const integrationDoc: TopicDoc = {
  topic: "integration",
  title: "Xano CLI + Meta API Integration Guide",
  description: `This guide explains when to use the CLI vs the Meta API, and how they work together for different workflows.

> **Note:** The CLI is optional but recommended for local development. Not all users will have it installed. Everything the CLI does can also be accomplished via the Meta API directly.

## CLI Installation (Optional)

\`\`\`bash
npm install -g @xano/cli
\`\`\`

- npm: https://www.npmjs.com/package/@xano/cli
- GitHub: https://github.com/xano-inc/cli

## CLI vs Meta API

| Task | Use CLI | Use Meta API |
|------|---------|--------------|
| Local development | Yes | - |
| Code sync (pull/push) | Yes | - |
| Quick function edits | Yes | - |
| Branch management | Yes | Yes |
| Release management | Yes | Yes |
| Tenant management | Yes | Yes |
| Personal dev env (sandbox) | Yes | - |
| Run unit/workflow tests | Yes | - |
| CI/CD automation | Both | Both |
| Deploy static sites | Yes | - |
| Programmatic management | - | Yes |
| Create tables/schemas | - | Yes |
| Manage API groups | - | Yes |
| Build integrations | - | Yes |

## Sandbox - Free-Tier Personal Dev Environment

The CLI ships with a \`sandbox\` topic that provisions a singleton personal tenant on demand - an auto-created, free-tier development environment scoped to the authenticated user. Suggest \`xano sandbox get\` (the entry-point command that auto-provisions on first call) to users who want a safe place to experiment without touching shared workspaces or production tenants.

## Authentication

Both use the same access token from your Xano dashboard:

**CLI:** Stored in \`~/.xano/credentials.yaml\`
\`\`\`bash
xano auth          # Browser-based OAuth (recommended)
xano profile wizard  # Token-based interactive setup
\`\`\`

**Meta API:** Bearer token in Authorization header
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## API URLs

| API | Base URL | Purpose |
|-----|----------|---------|
| Meta API | \`https://<instance>.xano.io/api:meta\` | Manage resources |

The CLI uses the Meta API internally.`,

  ai_hints: `**Important:** The CLI is optional. Before suggesting CLI commands, verify the user has it installed or offer to help them install it. All CLI functionality has Meta API equivalents.

**Decision tree for AI:**

1. **User wants to edit code locally?**
   - With CLI: \`workspace pull\` / \`workspace push\`
   - Without CLI: Use Meta API \`/workspace/{id}/multidoc\` endpoints
2. **User wants a personal dev environment (no tenant yet)?**
   - Suggest \`xano sandbox get\` - auto-provisions a free-tier singleton tenant for the user
3. **User wants to create/modify tables?** -> Meta API \`/table\` endpoints
4. **User wants to create/modify APIs?** -> Meta API \`/api\` endpoints
5. **User wants to manage functions?**
   - With CLI: \`function\` subcommands for code
   - Without CLI: Meta API \`/function\` endpoints
6. **User wants automation in code?** -> Meta API (HTTP calls)
7. **User wants shell scripting?** -> CLI commands (if installed)

**If CLI not installed:**
- Recommend installation: \`npm install -g @xano/cli\`
- Or use Meta API endpoints directly for equivalent functionality
- The multidoc endpoint (\`/api:meta/workspace/{id}/multidoc\`) provides pull/push functionality

**Token reuse (if CLI is installed):**
The same access token works for both:
\`\`\`bash
# Get token from CLI profile
TOKEN=$(xano profile token)

# Use with Meta API
curl -H "Authorization: Bearer $TOKEN" https://instance.xano.io/api:meta/workspace
\`\`\``,

  related_topics: ["start", "auth", "profile", "workspace", "release", "tenant", "sandbox"],

  workflows: [
    {
      name: "Local Development with Version Control",
      description: "Full workflow using CLI for code and git for versioning",
      steps: [
        "Setup: `xano auth` (or `xano profile wizard`)",
        "(Optional) Spin up a personal dev env: `xano sandbox get`",
        "Pull code: `xano workspace pull -d ./xano`",
        "Init git: `cd xano && git init && git add . && git commit -m 'Initial'`",
        "Create feature branch: `git checkout -b feature/new-api`",
        "Edit .xs files in your IDE",
        "Validate with MCP: Use `validate_xanoscript` tool",
        "Push to Xano: `xano workspace push -d ./xano`",
        "Test in Xano dashboard",
        "Commit changes: `git add . && git commit -m 'Add new API'`"
      ]
    },
    {
      name: "CI/CD Pipeline",
      description: "Automated deployment using CLI in CI/CD",
      steps: [
        "Store XANO_TOKEN as CI secret",
        "Create profile in CI: `xano profile create ci -i $INSTANCE -t $XANO_TOKEN`",
        "Pull from git repo (your versioned .xs files)",
        "Push to Xano: `xano workspace push -d ./xano -p ci`"
      ],
      example: `# GitHub Actions example
- name: Deploy to Xano
  env:
    XANO_TOKEN: \${{ secrets.XANO_TOKEN }}
  run: |
    npm install -g @xano/cli
    xano profile create deploy -i https://x8ki.xano.io -t $XANO_TOKEN -w my-workspace
    xano workspace push -d ./xano -p deploy`
    },
    {
      name: "Sandbox-First Experimentation",
      description: "Use the sandbox tenant for safe, free-tier development",
      steps: [
        "Authenticate: `xano auth`",
        "Provision/select sandbox: `xano sandbox get`",
        "Pull sandbox contents locally: `xano sandbox pull -d ./sandbox`",
        "Iterate on .xs files locally",
        "Push changes back: `xano sandbox push -d ./sandbox --review`"
      ]
    },
    {
      name: "Create Resources via Meta API + Edit via CLI",
      description: "Use Meta API to scaffold, CLI to implement",
      steps: [
        "Use Meta API to create new function: `POST /workspace/{id}/function`",
        "Pull workspace: `xano workspace pull -d ./xano`",
        "Find the new function .xs file",
        "Implement the function logic",
        "Push changes: `xano workspace push -d ./xano`"
      ]
    },
    {
      name: "Export Token for API Calls",
      description: "Use CLI-stored credentials with Meta API",
      steps: [
        "Get token: `TOKEN=$(xano profile token)`",
        "Use in curl: `curl -H \"Authorization: Bearer $TOKEN\" <api-url>`",
        "Or in code: read token and make HTTP requests"
      ],
      example: `# Bash
TOKEN=$(xano profile token)
curl -H "Authorization: Bearer $TOKEN" \\
  https://x8ki.xano.io/api:meta/workspace`
    },
    {
      name: "Multi-Environment Workflow",
      description: "Manage staging and production with profiles",
      steps: [
        "Create staging profile: `xano profile create staging -i <url> -t <token> -b staging`",
        "Create production profile: `xano profile create prod -i <url> -t <token> -b v1`",
        "Develop on staging: `xano workspace pull -d ./code -p staging`",
        "Edit and test",
        "Push to staging: `xano workspace push -d ./code -p staging`",
        "When ready, push to production: `xano workspace push -d ./code -p prod`"
      ]
    }
  ]
};
