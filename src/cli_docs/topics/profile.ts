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
  staging:
    instance_origin: https://staging-instance.xano.io
    access_token: <token>
    workspace: 1
    branch: 2           # staging branch
default: production
\`\`\`

## Project-Local Profile (\`profile.yaml\`)

To avoid accidentally targeting the wrong workspace, pin a project to a profile by adding a \`profile.yaml\` file at the project root. The CLI searches the current directory and walks up parent directories (like \`.git\`) to find it.

\`profile.yaml\` contains **no secrets** — it references a profile by name; the access token always comes from \`~/.xano/credentials.yaml\`. An \`access_token\` key is rejected, and \`insecure\` cannot be set from a project file (security boundary).

\`\`\`yaml
# ./profile.yaml
profile: staging          # which credentials.yaml profile to use
workspace: 110            # optional override
instance_origin: https://your-instance.xano.io        # optional override
account_origin: https://app.xano.com                  # optional override
branch: main              # optional override
\`\`\`

When a \`profile.yaml\` is in effect, every command prints the active target, e.g. \`Using profile 'staging' (workspace 110) · profile.yaml\` (suppressed for \`--output json\` and credential-management commands).

Generate one with \`xano profile use <name>\` — it writes a self-documenting \`profile.yaml\` (every overridable field included as a commented example) and offers to add it to \`.gitignore\`.

## Profile Selection Precedence

1. \`-p/--profile\` flag
2. \`XANO_PROFILE\` environment variable
3. \`profile.yaml\` (\`profile:\` field, plus field overrides)
4. Default profile from the credentials file

An explicit \`-p/--profile\` or \`XANO_PROFILE\` ignores \`profile.yaml\` entirely (name and overrides).`,

  ai_hints: `**Use profiles for:**
- Different environments (production, staging, development)
- Multiple Xano instances
- Team member accounts

**Token security:**
- Tokens are stored in plaintext - ensure proper file permissions
- Use \`profile token\` to pipe token to clipboard without exposing in terminal history

**Switching contexts:**
- Use \`-p <profile>\` flag on any command
- Or set \`XANO_PROFILE\` environment variable
- Or pin a project with \`xano profile use <name>\` (writes ./profile.yaml)
- Or use \`profile set\` to change the global default

**Suggest \`profile use\` when:**
- User juggles multiple workspaces/projects and could push to the wrong one by forgetting \`-p\`
- A repo should always target a specific profile/workspace regardless of the user's global default
- Remember: profile.yaml is overridden entirely by an explicit \`-p\` or \`XANO_PROFILE\`

**Alternative auth methods:**
- \`xano auth\` - Browser-based OAuth login (no token needed)
- \`xano profile wizard\` - Interactive token-based setup
- \`xano profile create\` - Non-interactive (for CI/CD)`,

  related_topics: ["auth", "start", "integration"],

  commands: [
    {
      name: "profile wizard",
      description: "Interactive setup wizard for creating a profile. Prompts for token, instance, workspace, and branch.",
      usage: "xano profile wizard [options]",
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "Profile name (prompted if not provided)" },
        { name: "origin", short: "o", type: "string", required: false, description: "Xano account origin URL (default https://app.xano.com)" },
        { name: "insecure", short: "k", type: "boolean", required: false, description: "Skip TLS certificate verification" }
      ],
      examples: ["xano profile wizard", "xano profile wizard -n myprofile"]
    },
    {
      name: "profile create",
      description: "Create a new profile with explicit flags (non-interactive)",
      usage: "xano profile create <name> -i <instance_origin> -t <access_token> [options]",
      args: [
        { name: "name", required: true, description: "Profile name" }
      ],
      flags: [
        { name: "instance_origin", short: "i", type: "string", required: true, description: "Xano instance URL" },
        { name: "access_token", short: "t", type: "string", required: true, description: "Access token" },
        { name: "account_origin", short: "a", type: "string", required: false, description: "Xano account origin URL (optional for self-hosted)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Default workspace ID" },
        { name: "branch", short: "b", type: "string", required: false, description: "Default branch label" },
        { name: "default", type: "boolean", required: false, description: "Set as the default profile" },
        { name: "insecure", short: "k", type: "boolean", required: false, description: "Skip TLS certificate verification" }
      ],
      examples: [
        "xano profile create production -i https://x8ki.xano.io -t mytoken123",
        "xano profile create staging -i https://x8ki.xano.io -t mytoken -w 1 -b dev --default"
      ]
    },
    {
      name: "profile list",
      description: "List all configured profiles",
      usage: "xano profile list [--details]",
      flags: [
        { name: "details", short: "d", type: "boolean", required: false, description: "Show masked tokens, origins, workspace, branch, and insecure status" }
      ],
      examples: ["xano profile list", "xano profile list --details"]
    },
    {
      name: "profile edit",
      description: "Edit an existing profile. Updates only the fields specified via flags; omitted fields are left unchanged.",
      usage: "xano profile edit [name] [options]",
      args: [
        { name: "name", required: false, description: "Profile name to edit (uses default if not provided)" }
      ],
      flags: [
        { name: "access_token", short: "t", type: "string", required: false, description: "Update the access token" },
        { name: "instance_origin", short: "i", type: "string", required: false, description: "Update the Xano instance origin URL" },
        { name: "account_origin", short: "a", type: "string", required: false, description: "Update the Xano account origin URL" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Set workspace ID" },
        { name: "branch", short: "b", type: "string", required: false, description: "Set branch label" },
        { name: "insecure", type: "boolean", required: false, description: "Enable insecure mode for self-signed certs" },
        { name: "remove-workspace", type: "boolean", required: false, description: "Remove workspace setting" },
        { name: "remove-branch", type: "boolean", required: false, description: "Remove branch setting" },
        { name: "remove-insecure", type: "boolean", required: false, description: "Remove insecure setting" }
      ],
      examples: [
        "xano profile edit production -w 2",
        "xano profile edit staging --remove-branch",
        "xano profile edit production --insecure",
        "xano profile edit production -t new_token_abc",
        "xano profile edit staging -i https://new-instance.xano.io"
      ]
    },
    {
      name: "profile delete",
      description: "Delete a profile. Auto-updates default if deleting the current default.",
      usage: "xano profile delete <name> [--force]",
      args: [
        { name: "name", required: true, description: "Profile name to delete" }
      ],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" }
      ],
      examples: ["xano profile delete old-profile", "xano profile delete test --force"]
    },
    {
      name: "profile use",
      description: "Pin a profile for the current project by writing a local profile.yaml. When present, the CLI uses this profile (and any overrides) instead of the default, unless -p/--profile or XANO_PROFILE is set. Warns before overwriting an existing profile.yaml and offers to add it to .gitignore (skipped if already ignored).",
      usage: "xano profile use <name> [options]",
      args: [
        { name: "name", required: true, description: "Profile name (from credentials.yaml) to pin for this project" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Override workspace for this project" },
        { name: "branch", short: "b", type: "string", required: false, description: "Override branch for this project" },
        { name: "instance_origin", short: "i", type: "string", required: false, description: "Override instance origin for this project" },
        { name: "account_origin", short: "a", type: "string", required: false, description: "Override account origin for this project" },
        { name: "gitignore", type: "boolean", required: false, description: "Add profile.yaml to .gitignore without prompting (--no-gitignore to skip the prompt without adding)" },
        { name: "config", short: "c", type: "string", required: false, description: "Path to credentials file (default: ~/.xano/credentials.yaml). Env: XANO_CONFIG" }
      ],
      examples: [
        "xano profile use staging",
        "xano profile use staging -w 110",
        "xano profile use staging -w 110 --gitignore",
        "xano profile use staging --no-gitignore"
      ]
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
      description: "Print the current default profile name",
      usage: "xano profile get",
      examples: ["xano profile get"]
    },
    {
      name: "profile me",
      description: "Display current authenticated user info (ID, name, email, instance)",
      usage: "xano profile me [options]",
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano profile me", "xano profile me -p staging", "xano profile me -o json"]
    },
    {
      name: "profile token",
      description: "Print the access token for the default profile (useful for piping)",
      usage: "xano profile token",
      examples: [
        "xano profile token",
        "xano profile token | pbcopy  # macOS",
        "xano profile token | xclip   # Linux"
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
      description: "Interactively select and set the workspace for a profile",
      usage: "xano profile workspace set [-p <profile>]",
      flags: [
        { name: "profile", short: "p", type: "string", required: false, description: "Profile to update (defaults to current default)" }
      ],
      examples: [
        "xano profile workspace set",
        "xano profile workspace set -p staging"
      ]
    }
  ],

  workflows: [
    {
      name: "Multi-environment Setup",
      description: "Configure profiles for production and staging",
      steps: [
        "Create production profile: `xano profile create prod -i <url> -t <token> -b 1`",
        "Create staging profile: `xano profile create staging -i <url> -t <token> -b 2`",
        "Set default: `xano profile set prod`",
        "Use staging when needed: `xano workspace pull ./code -p staging`"
      ]
    },
    {
      name: "Pin a Project to a Profile",
      description: "Prevent commands in a project directory from targeting the wrong workspace",
      steps: [
        "From the project root: `xano profile use staging -w 110`",
        "Accept the prompt to add profile.yaml to .gitignore (or pass --gitignore)",
        "Commands run inside the project now print `Using profile 'staging' (workspace 110) · profile.yaml`",
        "Override per-command when needed with `-p <other-profile>` (ignores profile.yaml entirely)"
      ],
      example: `cd my-project
xano profile use staging -w 110 --gitignore
xano workspace pull -d ./code   # uses 'staging', workspace 110`
    }
  ]
};
