import type { TopicDoc } from "../types.js";

export const integrationDoc: TopicDoc = {
  topic: "integration",
  title: "Xano CLI + Meta API Integration Guide",
  description: `This guide explains when to use the CLI vs the Meta API, and how they work together for different workflows.

> **Note:** The CLI is optional but recommended for local development. Not all users will have it installed. Everything the CLI does can also be accomplished via the Meta API and Run API directly.

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
| Execute XanoScript | Yes | Yes (Run API) |
| CI/CD automation | Both | Both |
| Programmatic management | - | Yes |
| Create tables/schemas | - | Yes |
| Manage API groups | - | Yes |
| Build integrations | - | Yes |

## Authentication

Both use the same access token from your Xano dashboard:

**CLI:** Stored in \`~/.xano/credentials.yaml\`
\`\`\`bash
xano profile:wizard  # Interactive setup
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

  ai_hints: `**Important:** The CLI is optional. Before suggesting CLI commands, verify the user has it installed or offer to help them install it. All CLI functionality has Meta API equivalents.

**Decision tree for AI:**

1. **User wants to edit code locally?**
   - With CLI: \`workspace:pull/push\`
   - Without CLI: Use Meta API \`/workspace/{id}/multidoc\` endpoints
2. **User wants to execute XanoScript?**
   - With CLI: \`run:exec\`
   - Without CLI: Use Run API directly
3. **User wants to create/modify tables?** → Meta API \`/table\` endpoints
4. **User wants to create/modify APIs?** → Meta API \`/api\` endpoints
5. **User wants to manage functions?**
   - With CLI: \`function:*\` commands for code
   - Without CLI: Meta API \`/function\` endpoints
6. **User wants automation in code?** → Meta API (HTTP calls)
7. **User wants shell scripting?** → CLI commands (if installed)

**If CLI not installed:**
- Recommend installation: \`npm install -g @xano/cli\`
- Or use Meta API endpoints directly for equivalent functionality
- The multidoc endpoint (\`/api:meta/beta/workspace/{id}/multidoc\`) provides pull/push functionality

**Token reuse (if CLI is installed):**
The same access token works for both:
\`\`\`bash
# Get token from CLI profile
TOKEN=$(xano profile:token)

# Use with Meta API
curl -H "Authorization: Bearer $TOKEN" https://instance.xano.io/api:meta/workspace
\`\`\``,

  related_topics: ["start", "profile", "workspace"],

  workflows: [
    {
      name: "Local Development with Version Control",
      description: "Full workflow using CLI for code and git for versioning",
      steps: [
        "Setup: `xano profile:wizard`",
        "Pull code: `xano workspace:pull ./xano`",
        "Init git: `cd xano && git init && git add . && git commit -m 'Initial'`",
        "Create feature branch: `git checkout -b feature/new-api`",
        "Edit .xs files in your IDE",
        "Validate with MCP: Use `validate_xanoscript` tool",
        "Push to Xano: `xano workspace:push ./xano`",
        "Test in Xano dashboard",
        "Commit changes: `git add . && git commit -m 'Add new API'`"
      ]
    },
    {
      name: "CI/CD Pipeline",
      description: "Automated deployment using CLI in CI/CD",
      steps: [
        "Store XANO_TOKEN as CI secret",
        "Create profile in CI: `xano profile:create ci -i $INSTANCE -t $XANO_TOKEN`",
        "Pull from git repo (your versioned .xs files)",
        "Push to Xano: `xano workspace:push ./xano -p ci`"
      ],
      example: `# GitHub Actions example
- name: Deploy to Xano
  env:
    XANO_TOKEN: \${{ secrets.XANO_TOKEN }}
  run: |
    npm install -g @xano/cli
    xano profile:create deploy -i https://x8ki.xano.io -t $XANO_TOKEN -w 1
    xano workspace:push ./xano -p deploy`
    },
    {
      name: "Create Resources via Meta API + Edit via CLI",
      description: "Use Meta API to scaffold, CLI to implement",
      steps: [
        "Use Meta API to create new function: `POST /workspace/{id}/function`",
        "Pull workspace: `xano workspace:pull ./xano`",
        "Find the new function .xs file",
        "Implement the function logic",
        "Push changes: `xano workspace:push ./xano`"
      ]
    },
    {
      name: "Export Token for API Calls",
      description: "Use CLI-stored credentials with Meta API",
      steps: [
        "Get token: `TOKEN=$(xano profile:token)`",
        "Use in curl: `curl -H \"Authorization: Bearer $TOKEN\" <api-url>`",
        "Or in code: read token and make HTTP requests"
      ],
      example: `# Bash
TOKEN=$(xano profile:token)
curl -H "Authorization: Bearer $TOKEN" \\
  https://x8ki.xano.io/api:meta/workspace`
    },
    {
      name: "Multi-Environment Workflow",
      description: "Manage staging and production with profiles",
      steps: [
        "Create staging profile: `xano profile:create staging -i <url> -t <token> -b 2`",
        "Create production profile: `xano profile:create prod -i <url> -t <token> -b 1`",
        "Develop on staging: `xano workspace:pull ./code -p staging`",
        "Edit and test",
        "Push to staging: `xano workspace:push ./code -p staging`",
        "When ready, push to production: `xano workspace:push ./code -p prod`"
      ]
    }
  ]
};
