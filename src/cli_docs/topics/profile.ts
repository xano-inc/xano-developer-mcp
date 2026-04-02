import type { TopicDoc } from "../types.js";

export const profileDoc: TopicDoc = {
  topic: "profile",
  title: "Xano CLI - Profile Management",
  description: `Profiles store your Xano credentials and context (workspace, branch). Multiple profiles let you switch between instances and environments.

## Storage Location

\`~/.xano/credentials.yaml\`

## Profile Structure

\`\`\`yaml
profiles:
  production:
    account_origin: https://app.xano.com
    instance_origin: https://prod-instance.xano.io
    access_token: <token>
    workspace: my-workspace
    branch: v1
  staging:
    instance_origin: https://staging-instance.xano.io
    access_token: <token>
    workspace: my-workspace
    branch: dev
default: production
\`\`\`

## Available Commands

| Command | Purpose |
|---------|---------|
| \`profile wizard\` | Interactive setup wizard |
| \`profile create\` | Create profile with flags |
| \`profile list\` | List all profiles |
| \`profile edit\` | Edit an existing profile |
| \`profile delete\` | Delete a profile |
| \`profile set\` | Set the default profile |
| \`profile get\` | Show current default profile name |
| \`profile me\` | Show authenticated user info |
| \`profile token\` | Print access token |
| \`profile workspace\` | Print workspace ID |
| \`profile workspace set\` | Interactively select workspace for profile |

Run \`xano profile <command> --help\` for detailed flags and arguments.`,

  ai_hints: `**Use profiles for:**
- Different environments (production, staging, development)
- Multiple Xano instances
- CI/CD pipeline configuration

**Token security:**
- Tokens are stored in plaintext - ensure proper file permissions
- Use \`xano profile token\` to pipe token without exposing in terminal history

**Switching contexts:**
- Use \`-p <profile>\` flag on any command
- Or set \`XANO_PROFILE\` environment variable
- Or use \`xano profile set\` to change default

**Self-signed certificates:** Use \`-k/--insecure\` flag on wizard, create, or edit for self-hosted instances with self-signed TLS certificates.`,

  related_topics: ["start", "integration"],

  commands: [
    {
      name: "profile wizard",
      description: "Interactive setup wizard for creating a profile",
      usage: "xano profile wizard [-n <name>] [-o <origin>] [-k]",
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "Profile name (skip prompt if provided)" },
        { name: "origin", short: "o", type: "string", required: false, default: "https://app.xano.com", description: "Xano instance origin URL" },
        { name: "insecure", short: "k", type: "boolean", required: false, description: "Skip TLS certificate verification (for self-signed certificates)" }
      ],
      examples: ["xano profile wizard", "xano profile wizard -n production"]
    },
    {
      name: "profile create",
      description: "Create a new profile with explicit flags",
      usage: "xano profile create <name> -i <instance_origin> -t <access_token> [options]",
      args: [
        { name: "name", required: true, description: "Profile name" }
      ],
      flags: [
        { name: "instance_origin", short: "i", type: "string", required: true, description: "Instance origin URL" },
        { name: "access_token", short: "t", type: "string", required: true, description: "Access token for the Xano Metadata API" },
        { name: "account_origin", short: "a", type: "string", required: false, description: "Account origin URL (optional for self-hosted)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Default workspace name" },
        { name: "branch", short: "b", type: "string", required: false, description: "Default branch name" },
        { name: "insecure", short: "k", type: "boolean", required: false, description: "Skip TLS certificate verification (for self-signed certificates)" },
        { name: "default", type: "boolean", required: false, description: "Set this profile as the default" }
      ],
      examples: [
        "xano profile create production -i https://x8ki.xano.io -t mytoken123",
        "xano profile create staging -i https://x8ki.xano.io -t mytoken -w my-workspace -b dev",
        "xano profile create selfhosted -i https://self-signed.example.com -t token123 --insecure"
      ]
    },
    {
      name: "profile list",
      description: "List all configured profiles",
      usage: "xano profile list [-d]",
      flags: [
        { name: "details", short: "d", type: "boolean", required: false, description: "Show detailed information for each profile" }
      ],
      examples: ["xano profile list", "xano profile list -d"]
    },
    {
      name: "profile edit",
      description: "Edit an existing profile",
      usage: "xano profile edit [name] [options]",
      args: [
        { name: "name", required: false, description: "Profile name to edit (uses default profile if not specified)" }
      ],
      flags: [
        { name: "instance_origin", short: "i", type: "string", required: false, description: "Update instance origin URL" },
        { name: "access_token", short: "t", type: "string", required: false, description: "Update access token" },
        { name: "account_origin", short: "a", type: "string", required: false, description: "Update account origin URL" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Update workspace name" },
        { name: "branch", short: "b", type: "string", required: false, description: "Update branch name" },
        { name: "insecure", type: "boolean", required: false, description: "Enable insecure mode (skip TLS certificate verification)" },
        { name: "remove-workspace", type: "boolean", required: false, description: "Remove workspace from profile" },
        { name: "remove-branch", type: "boolean", required: false, description: "Remove branch from profile" },
        { name: "remove-insecure", type: "boolean", required: false, description: "Remove insecure mode from profile" }
      ],
      examples: [
        "xano profile edit production -w my-workspace",
        "xano profile edit staging --remove-branch",
        "xano profile edit --insecure"
      ]
    },
    {
      name: "profile delete",
      description: "Delete a profile",
      usage: "xano profile delete <name>",
      args: [
        { name: "name", required: true, description: "Profile name to delete" }
      ],
      examples: ["xano profile delete old-profile"]
    },
    {
      name: "profile set",
      description: "Set the default profile",
      usage: "xano profile set <name>",
      args: [
        { name: "name", required: true, description: "Profile to set as default" }
      ],
      examples: ["xano profile set production"]
    },
    {
      name: "profile get",
      description: "Show the current default profile name",
      usage: "xano profile get",
      examples: ["xano profile get"]
    },
    {
      name: "profile me",
      description: "Display current authenticated user info",
      usage: "xano profile me [-p <profile>] [-o summary|json]",
      examples: ["xano profile me", "xano profile me -p staging", "xano profile me -o json"]
    },
    {
      name: "profile token",
      description: "Print the access token for the default profile",
      usage: "xano profile token",
      examples: [
        "xano profile token",
        "xano profile token | pbcopy  # macOS"
      ]
    },
    {
      name: "profile workspace",
      description: "Print the workspace ID for the default profile",
      usage: "xano profile workspace",
      examples: ["xano profile workspace"]
    },
    {
      name: "profile workspace set",
      description: "Interactively select a workspace for a profile",
      usage: "xano profile workspace set",
      examples: ["xano profile workspace set"]
    }
  ],

  workflows: [
    {
      name: "Multi-environment Setup",
      description: "Configure profiles for production and staging",
      steps: [
        "Create production profile: `xano profile create prod -i <instance_url> -t <token> --default`",
        "Create staging profile: `xano profile create staging -i <instance_url> -t <token>`",
        "Use staging when needed: `xano workspace list -p staging`"
      ]
    }
  ]
};
