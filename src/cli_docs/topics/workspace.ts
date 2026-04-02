import type { TopicDoc } from "../types.js";

export const workspaceDoc: TopicDoc = {
  topic: "workspace",
  title: "Xano CLI - Workspace Operations",
  description: `Workspace commands let you manage Xano workspaces — create, edit, delete, and sync workspace content between local files and Xano.

## Key Concepts

- **Pull**: Download workspace content (tables, APIs, functions, etc.) as individual XanoScript files to a local directory.
- **Push**: Upload local XanoScript files back to a workspace. By default only changed files are pushed (partial mode).
- **Sandbox**: The recommended safe path for changes. Push to sandbox first, then review and promote. See the \`sandbox\` topic.
- **allow-push**: A workspace-level setting that controls whether direct CLI push is permitted. Use \`workspace edit --allow-push\` to enable/disable.

## Available Commands

| Command | Purpose |
|---------|---------|
| \`workspace list\` | List all accessible workspaces |
| \`workspace get\` | Get workspace details |
| \`workspace create\` | Create a new workspace |
| \`workspace edit\` | Edit workspace settings (name, description, allow-push, swagger) |
| \`workspace delete\` | Delete a workspace (irreversible) |
| \`workspace pull\` | Pull workspace content to local files |
| \`workspace push\` | Push local files to workspace |
| \`workspace git pull\` | Pull XanoScript files from a git repository |

Run \`xano workspace <command> --help\` for detailed flags and arguments.

> **Warning:** \`workspace push\` writes directly to the target workspace. For safe development, use \`sandbox push\` instead. See the \`sandbox\` topic.`,

  ai_hints: `**Recommended workflow (safe):**
1. \`xano workspace pull ./local-dir\` — pull workspace to local files
2. Edit .xs files locally
3. \`xano sandbox push ./local-dir\` — push to sandbox for testing
4. \`xano sandbox review\` — review and promote changes

**Direct push (advanced — use with caution):**
1. Ensure \`workspace edit --allow-push\` is enabled on the workspace
2. Preview changes: \`xano workspace push ./local-dir --dry-run\`
3. Push changes: \`xano workspace push ./local-dir\`

**DANGER flags on workspace push:**
- \`--sync --delete\` — deletes remote objects not present locally
- \`--truncate\` — truncates ALL table records before importing
- \`--force\` — skips confirmation prompts (for CI/CD only)

**Discovery:** Run \`xano workspace <command> --help\` for detailed usage.`,

  related_topics: ["sandbox", "branch", "release", "integration"],

  commands: [
    {
      name: "workspace list",
      description: "List all workspaces accessible to your account",
      usage: "xano workspace list [-p <profile>] [-o summary|json]",
      examples: ["xano workspace list", "xano workspace list -o json"]
    },
    {
      name: "workspace get",
      description: "Get details of a specific workspace",
      usage: "xano workspace get [workspace_id] [-p <profile>] [-o summary|json]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID (uses profile default if not specified)" }
      ],
      examples: [
        "xano workspace get",
        "xano workspace get 40",
        "xano workspace get 40 -o json"
      ]
    },
    {
      name: "workspace create",
      description: "Create a new workspace",
      usage: "xano workspace create <name> [-d <description>] [-o summary|json]",
      args: [
        { name: "name", required: true, description: "Name of the workspace" }
      ],
      flags: [
        { name: "description", short: "d", type: "string", required: false, description: "Description for the workspace" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace create my-workspace",
        "xano workspace create my-app --description 'My application workspace'",
        "xano workspace create new-project -d 'New project' -o json"
      ]
    },
    {
      name: "workspace edit",
      description: "Edit workspace settings. The --allow-push flag controls whether the CLI can push directly to this workspace (not available on Free plan).",
      usage: "xano workspace edit [workspace_id] [-n <name>] [-d <description>] [--allow-push] [--swagger] [--require-token] [-o summary|json]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID (uses profile default if not provided)" }
      ],
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "New name for the workspace" },
        { name: "description", short: "d", type: "string", required: false, description: "New description" },
        { name: "allow-push", type: "boolean", required: false, description: "Enable or disable direct CLI push (--no-allow-push to disable). Not available on Free plan." },
        { name: "swagger", type: "boolean", required: false, description: "Enable or disable swagger documentation (--no-swagger to disable)" },
        { name: "require-token", type: "boolean", required: false, description: "Whether to require a token for documentation access (--no-require-token to disable)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace edit 123 --name 'new-name'",
        "xano workspace edit --allow-push",
        "xano workspace edit 123 --no-allow-push",
        "xano workspace edit 123 --swagger --require-token"
      ]
    },
    {
      name: "workspace delete",
      description: "Delete a workspace permanently. Cannot delete workspaces with active tenants. This action cannot be undone.",
      usage: "xano workspace delete <workspace_id> [-f] [-o summary|json]",
      args: [
        { name: "workspace_id", required: true, description: "Workspace ID to delete" }
      ],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace delete 123",
        "xano workspace delete 123 --force"
      ]
    },
    {
      name: "workspace pull",
      description: "Pull workspace content to a local directory as individual XanoScript files. Use this to get the current state of a workspace for local editing.",
      usage: "xano workspace pull <directory> [-w <workspace>] [-b <branch>] [--env] [--draft] [--records]",
      args: [
        { name: "directory", required: true, description: "Output directory for pulled documents" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch name (defaults to live branch)" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "draft", type: "boolean", required: false, description: "Include draft versions" },
        { name: "records", type: "boolean", required: false, description: "Include table records" }
      ],
      examples: [
        "xano workspace pull ./my-workspace",
        "xano workspace pull ./output -w 40",
        "xano workspace pull ./backup --env --records",
        "xano workspace pull ./my-workspace --draft",
        "xano workspace pull ./my-workspace -b dev"
      ]
    },
    {
      name: "workspace push",
      description: `Push local XanoScript files to a workspace. By default, only changed files are pushed (partial mode). Use --sync to push all files. Shows a preview of changes before pushing unless --force is specified.

> **Warning:** Pushing directly to a workspace can overwrite production data. Use \`sandbox push\` for safe development. Use \`--dry-run\` to preview changes before pushing.

> **DANGER:** \`--sync --delete\` deletes remote objects not present locally. \`--truncate\` truncates ALL table records.`,
      usage: "xano workspace push <directory> [-w <workspace>] [-b <branch>] [--sync] [--delete] [--dry-run] [--force] [--env] [--records] [--truncate] [--transaction] [--guids] [-i <pattern>] [-e <pattern>]",
      args: [
        { name: "directory", required: true, description: "Directory containing documents to push (as produced by workspace pull)" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch name (defaults to live branch)" },
        { name: "sync", type: "boolean", required: false, description: "Full push — send all files, not just changed ones. Required for --delete." },
        { name: "delete", type: "boolean", required: false, description: "Delete remote objects not present locally (requires --sync). DANGER: removes resources from workspace." },
        { name: "dry-run", type: "boolean", required: false, description: "Preview changes without actually pushing" },
        { name: "force", type: "boolean", required: false, description: "Skip preview and confirmation prompt (for CI/CD pipelines)" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables in import" },
        { name: "records", type: "boolean", required: false, description: "Include table records in import" },
        { name: "truncate", type: "boolean", required: false, description: "Truncate all table records before importing. DANGER: deletes all existing data." },
        { name: "transaction", type: "boolean", required: false, description: "Wrap import in a database transaction (--no-transaction to disable)" },
        { name: "guids", type: "boolean", required: false, description: "Write server-assigned GUIDs back to local files (--no-guids to skip)" },
        { name: "include", short: "i", type: "string", required: false, description: "Glob pattern to include files (e.g. 'function/*', '**/func*'). Repeatable." },
        { name: "exclude", short: "e", type: "string", required: false, description: "Glob pattern to exclude files (e.g. 'table/*', '**/test*'). Repeatable." }
      ],
      examples: [
        "xano workspace push ./my-workspace",
        "xano workspace push ./my-workspace --dry-run",
        "xano workspace push ./my-workspace --sync",
        "xano workspace push ./my-workspace --sync --delete",
        "xano workspace push ./my-workspace --force",
        "xano workspace push ./my-workspace -b dev",
        "xano workspace push ./my-workspace -i 'function/*' -i 'table/*'",
        "xano workspace push ./my-workspace -e 'table/*'",
        "xano workspace push ./my-workspace --truncate"
      ]
    },
    {
      name: "workspace git pull",
      description: "Pull XanoScript files from a git repository into a local directory. Supports GitHub, GitLab, and any git URL.",
      usage: "xano workspace git pull <directory> -r <repo_url> [-b <branch>] [--path <subdir>] [-t <token>]",
      args: [
        { name: "directory", required: true, description: "Output directory for imported files" }
      ],
      flags: [
        { name: "repo", short: "r", type: "string", required: true, description: "Git repository URL (GitHub HTTPS, SSH, or any git URL)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch, tag, or ref to fetch (defaults to repo default)" },
        { name: "path", type: "string", required: false, description: "Subdirectory within the repo to import from" },
        { name: "token", short: "t", type: "string", required: false, description: "Personal access token for private repos (falls back to GITHUB_TOKEN env var)" }
      ],
      examples: [
        "xano workspace git pull ./output -r https://github.com/owner/repo",
        "xano workspace git pull ./output -r git@github.com:owner/repo.git",
        "xano workspace git pull ./output -r https://github.com/owner/private-repo -t ghp_xxx",
        "xano workspace git pull ./output -r https://github.com/owner/repo -b main"
      ]
    }
  ],

  workflows: [
    {
      name: "Safe Development via Sandbox",
      description: "The recommended workflow: pull, edit locally, push to sandbox, review and promote",
      steps: [
        "Pull workspace: `xano workspace pull ./my-workspace`",
        "Edit XanoScript files locally in your IDE",
        "Push to sandbox: `xano sandbox push ./my-workspace`",
        "Review and promote: `xano sandbox review`"
      ],
      example: `xano workspace pull ./my-workspace
# Edit files...
xano sandbox push ./my-workspace
xano sandbox review`
    },
    {
      name: "Direct Push (Advanced)",
      description: "Push changes directly to a workspace. Requires --allow-push to be enabled on the workspace.",
      steps: [
        "Enable push: `xano workspace edit --allow-push`",
        "Pull workspace: `xano workspace pull ./my-workspace`",
        "Edit XanoScript files locally",
        "Preview changes: `xano workspace push ./my-workspace --dry-run`",
        "Push changes: `xano workspace push ./my-workspace`"
      ]
    },
    {
      name: "CI/CD Pipeline Push",
      description: "Automated push in CI/CD (skips confirmation prompts)",
      steps: [
        "Pull from git: `xano workspace git pull ./workspace -r <repo_url>`",
        "Push to workspace: `xano workspace push ./workspace --force -p ci`"
      ]
    }
  ]
};
