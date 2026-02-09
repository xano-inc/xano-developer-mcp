import type { TopicDoc } from "../types.js";

export const profileDoc: TopicDoc = {
  topic: "profile",
  title: "Xano CLI - Profile Management",
  description: `Profiles store your Xano credentials and context (workspace, branch, project). Multiple profiles let you switch between instances and environments.

## Storage Location

\`~/.xano/credentials.yaml\`

## Profile Structure

\`\`\`yaml
profiles:
  production:
    account_origin: https://app.xano.com
    instance_origin: https://prod-instance.xano.io
    access_token: <token>
    workspace: 1
    branch: 1           # main branch
    project: abc123     # Run project ID
    run_base_url: https://app.dev.xano.com/
  staging:
    instance_origin: https://staging-instance.xano.io
    access_token: <token>
    workspace: 1
    branch: 2           # staging branch
default: production
\`\`\``,

  ai_hints: `**Use profiles for:**
- Different environments (production, staging, development)
- Multiple Xano instances
- Team member accounts

**Token security:**
- Tokens are stored in plaintext - ensure proper file permissions
- Use \`profile:token\` to pipe token to clipboard without exposing in terminal history

**Switching contexts:**
- Use \`-p <profile>\` flag on any command
- Or set \`XANO_PROFILE\` environment variable
- Or use \`profile:set-default\` to change default`,

  related_topics: ["start", "integration"],

  commands: [
    {
      name: "profile:wizard",
      description: "Interactive setup wizard for creating a profile",
      usage: "xano profile:wizard",
      examples: ["xano profile:wizard"]
    },
    {
      name: "profile:create",
      description: "Create a new profile with explicit flags",
      usage: "xano profile:create <name> -i <instance_origin> -t <token> [options]",
      args: [
        { name: "name", required: true, description: "Profile name" }
      ],
      flags: [
        { name: "instance_origin", short: "i", type: "string", required: true, description: "Xano instance URL" },
        { name: "access_token", short: "t", type: "string", required: true, description: "Access token" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Default workspace ID" },
        { name: "branch", short: "b", type: "string", required: false, description: "Default branch ID" },
        { name: "project", short: "j", type: "string", required: false, description: "Default Run project ID" }
      ],
      examples: [
        "xano profile:create production -i https://x8ki.xano.io -t mytoken123",
        "xano profile:create staging -i https://x8ki.xano.io -t mytoken -w 1 -b 2"
      ]
    },
    {
      name: "profile:list",
      description: "List all configured profiles",
      usage: "xano profile:list [--details]",
      flags: [
        { name: "details", type: "boolean", required: false, description: "Show masked tokens and full config" }
      ],
      examples: ["xano profile:list", "xano profile:list --details"]
    },
    {
      name: "profile:edit",
      description: "Edit an existing profile",
      usage: "xano profile:edit <name> [options]",
      args: [
        { name: "name", required: true, description: "Profile name to edit" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Set workspace ID" },
        { name: "branch", short: "b", type: "string", required: false, description: "Set branch ID" },
        { name: "project", short: "j", type: "string", required: false, description: "Set Run project ID" },
        { name: "remove-workspace", type: "boolean", required: false, description: "Remove workspace setting" },
        { name: "remove-branch", type: "boolean", required: false, description: "Remove branch setting" }
      ],
      examples: [
        "xano profile:edit production -w 2",
        "xano profile:edit staging --remove-branch"
      ]
    },
    {
      name: "profile:delete",
      description: "Delete a profile",
      usage: "xano profile:delete <name> [--force]",
      args: [
        { name: "name", required: true, description: "Profile name to delete" }
      ],
      flags: [
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" }
      ],
      examples: ["xano profile:delete old-profile", "xano profile:delete test --force"]
    },
    {
      name: "profile:set-default",
      description: "Set the default profile",
      usage: "xano profile:set-default <name>",
      args: [
        { name: "name", required: true, description: "Profile to set as default" }
      ],
      examples: ["xano profile:set-default production"]
    },
    {
      name: "profile:get-default",
      description: "Show the current default profile name",
      usage: "xano profile:get-default",
      examples: ["xano profile:get-default"]
    },
    {
      name: "profile:me",
      description: "Display current authenticated user info",
      usage: "xano profile:me [-p <profile>]",
      examples: ["xano profile:me", "xano profile:me -p staging"]
    },
    {
      name: "profile:token",
      description: "Print the access token (for piping to clipboard)",
      usage: "xano profile:token [-p <profile>]",
      examples: [
        "xano profile:token",
        "xano profile:token | pbcopy  # macOS",
        "xano profile:token | xclip   # Linux"
      ]
    }
  ],

  workflows: [
    {
      name: "Multi-environment Setup",
      description: "Configure profiles for production and staging",
      steps: [
        "Create production profile: `xano profile:create prod -i <url> -t <token> -b 1`",
        "Create staging profile: `xano profile:create staging -i <url> -t <token> -b 2`",
        "Set default: `xano profile:set-default prod`",
        "Use staging when needed: `xano workspace:pull ./code -p staging`"
      ]
    }
  ]
};
