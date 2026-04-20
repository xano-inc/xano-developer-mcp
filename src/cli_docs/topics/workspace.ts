import type { TopicDoc } from "../types.js";

export const workspaceDoc: TopicDoc = {
  topic: "workspace",
  title: "Xano CLI - Workspace Operations",
  description: `Workspace commands let you sync XanoScript code between your local filesystem and Xano. This enables version control, local editing, and CI/CD workflows.

## Multidoc Format

Xano uses a "multidoc" format where multiple XanoScript documents are separated by \`---\`:

\`\`\`xanoscript
# function/auth.xs
---
function: validate_token
...
---
function: refresh_token
...
\`\`\`

When you pull, the CLI splits these into individual \`.xs\` files organized by type.

## Directory Structure

After \`workspace pull\`, files are organized using snake_case naming:

\`\`\`
./xano-code/
├── workspace/
│   ├── my_workspace.xs           # Workspace configuration
│   └── trigger/
│       └── on_deploy.xs          # Workspace triggers
├── api/
│   └── users/                    # API group folder (snake_case)
│       ├── api_group.xs          # API group definition
│       ├── get_all.xs            # GET /users
│       ├── get_one_get.xs        # GET /users/:id
│       ├── create_post.xs        # POST /users
│       └── nested/
│           └── profile_get.xs    # GET /users/nested/profile
├── function/
│   └── validate_token.xs         # Reusable functions
├── task/
│   └── daily_cleanup.xs          # Scheduled tasks
├── table/
│   ├── users.xs                  # Table schema
│   └── trigger/
│       └── on_user_create.xs     # Table triggers
├── ai/
│   ├── agent/
│   │   ├── support_bot.xs        # AI agents
│   │   └── trigger/
│   │       └── on_message.xs     # Agent triggers
│   ├── mcp_server/
│   │   ├── my_server.xs          # MCP server definitions
│   │   └── trigger/
│   │       └── on_connect.xs     # MCP server triggers
│   └── tool/
│       └── my_tool.xs            # AI tools
└── realtime/
    ├── channel/
    │   └── my_channel.xs         # Realtime channels
    └── trigger/
        └── on_connect.xs         # Realtime triggers
\`\`\`

## Syntax note

Xano CLI commands are SPACE-separated (e.g. \`xano workspace pull\`), not colon-separated.

## Alternatives

For lighter-weight iterative development without pulling the whole workspace, see the \`sandbox\` topic. Sandboxes give you an ephemeral copy of a workspace for quick testing.`,

  ai_hints: `**Key concepts:**
- \`pull\` downloads workspace code and splits into organized .xs files
- \`push\` combines .xs files and uploads to Xano
- Files use snake_case naming for folders and filenames
- API endpoints are nested under their API group folder
- The target directory is passed via \`-d/--directory\` (default: current directory); it is NOT a positional argument

**Typical workflow:**
1. \`xano workspace pull -d ./xano-code\` - download
2. Navigate to \`api/{group}/\` for API endpoints, \`function/\` for functions, etc.
3. Edit .xs files with your editor/IDE
4. \`xano workspace push -d ./xano-code\` - deploy

**File naming:**
- All folders and files use snake_case (e.g., \`my_function.xs\`, \`user_profile/\`)
- API endpoints include verb suffix (e.g., \`create_post.xs\`, \`get_one_get.xs\`)
- Triggers are nested under \`{type}/trigger/\` folders

**Version control:**
- The pulled directory structure is git-friendly
- Commit changes to track history
- Use branches for different environments

**Branch handling:**
- Use \`-b\` flag or set branch in profile
- Pull from one branch, push to another is supported

**Push modes:**
- Default (partial): Only pushes changed files
- \`--sync\`: Full push of all files
- \`--sync --delete\`: Full push AND removes remote objects not in local
- \`--dry-run\`: Preview what would change without applying
- \`--include/-i\` and \`--exclude/-e\`: Glob patterns for selective push (repeatable)
- \`--no-transaction\` and \`--no-guids\` disable the default transaction wrapping and GUID write-back

**Git integration:**
- \`workspace git pull\` pulls XanoScript directly from GitHub/GitLab repos
- Supports private repos with \`-t/--token\` flag (falls back to GITHUB_TOKEN env var)
- Can pull from a specific subdirectory with \`--path\`

**When to use sandbox instead:**
- \`sandbox\` is a lighter-weight alternative for ephemeral, isolated iteration
- Use workspace pull/push for canonical sync, version control, and CI/CD`,

  related_topics: ["start", "branch", "function", "release", "sandbox", "integration"],

  commands: [
    {
      name: "workspace list",
      description: "List all workspaces accessible to your account",
      usage: "xano workspace list [options]",
      flags: [
        { name: "latest", type: "boolean", required: false, default: "false", description: "Sort results by newest first (descending ID)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: ["xano workspace list", "xano workspace list -p production", "xano workspace list --output json"]
    },
    {
      name: "workspace get",
      description: "Get details of a specific workspace",
      usage: "xano workspace get [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace get",
        "xano workspace get -w 123",
        "xano workspace get -w 456 -p production -o json"
      ]
    },
    {
      name: "workspace create",
      description: "Create a new workspace via the Xano Metadata API",
      usage: "xano workspace create <name> [options]",
      args: [
        { name: "name", required: true, description: "Name for the new workspace" }
      ],
      flags: [
        { name: "description", short: "d", type: "string", required: false, description: "Description for the workspace" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace create my-workspace",
        'xano workspace create my-app --description "My application workspace"',
        'xano workspace create new-project -d "New project workspace" -o json'
      ]
    },
    {
      name: "workspace edit",
      description: "Edit an existing workspace via the Xano Metadata API",
      usage: "xano workspace edit [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID to edit (uses profile workspace if not provided)" },
        { name: "name", short: "n", type: "string", required: false, description: "New name for the workspace" },
        { name: "description", short: "d", type: "string", required: false, description: "New description for the workspace" },
        { name: "swagger", type: "boolean", required: false, description: "Enable or disable swagger documentation (--swagger or --no-swagger)" },
        { name: "require-token", type: "boolean", required: false, description: "Require token for documentation access (--require-token or --no-require-token)" },
        { name: "allow-push", type: "boolean", required: false, description: "Allow CLI push to the workspace (--allow-push or --no-allow-push)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        'xano workspace edit -w 123 --name "new-name"',
        'xano workspace edit --name "updated-workspace" --description "Updated description"',
        "xano workspace edit -w 123 --swagger --require-token",
        "xano workspace edit -w 123 --no-swagger -o json"
      ]
    },
    {
      name: "workspace delete",
      description: "Delete a workspace via the Xano Metadata API. Cannot delete workspaces with active tenants.",
      usage: "xano workspace delete [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID to delete (uses profile workspace if not provided)" },
        { name: "force", short: "f", type: "boolean", required: false, default: "false", description: "Skip confirmation prompt" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace delete -w 123",
        "xano workspace delete -w 123 --force",
        "xano workspace delete -w 123 -f -o json"
      ]
    },
    {
      name: "workspace pull",
      description: "Download workspace code to a local directory. Splits the multidoc response into individual .xs files organized by type. The target directory is the -d/--directory flag (default: current directory), not a positional argument.",
      usage: "xano workspace pull [options]",
      flags: [
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Output directory for pulled documents (defaults to current directory)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch label to pull from (defaults to live branch or profile branch)" },
        { name: "env", type: "boolean", required: false, default: "false", description: "Include environment variables" },
        { name: "draft", type: "boolean", required: false, default: "false", description: "Include draft versions of functions" },
        { name: "records", type: "boolean", required: false, default: "false", description: "Include table records" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano workspace pull",
        "xano workspace pull -d ./my-app",
        "xano workspace pull -d ./staging-code -b dev",
        "xano workspace pull -d ./backup --env --records --draft"
      ]
    },
    {
      name: "workspace push",
      description: "Upload local XanoScript files to a workspace. Default mode is partial (only changed files). Use --sync for a full push. The source directory is the -d/--directory flag (default: current directory), not a positional argument.",
      usage: "xano workspace push [options]",
      flags: [
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Directory containing documents to push (defaults to current directory)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch label to push to (defaults to live branch or profile branch)" },
        { name: "sync", type: "boolean", required: false, default: "false", description: "Full push (default is partial/changed-only). Required for --delete." },
        { name: "delete", type: "boolean", required: false, default: "false", description: "Delete remote objects not present in local files (requires --sync)" },
        { name: "dry-run", type: "boolean", required: false, default: "false", description: "Preview changes without applying" },
        { name: "force", type: "boolean", required: false, default: "false", description: "Skip preview and confirmation prompt (for CI/CD)" },
        { name: "env", type: "boolean", required: false, default: "false", description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, default: "false", description: "Include table records" },
        { name: "truncate", type: "boolean", required: false, default: "false", description: "Truncate tables before importing records" },
        { name: "transaction", type: "boolean", required: false, default: "true", description: "Wrap import in a database transaction (--no-transaction to disable)" },
        { name: "guids", type: "boolean", required: false, default: "true", description: "Write server-assigned GUIDs back to local files after push (--no-guids to disable)" },
        { name: "include", short: "i", type: "string", required: false, description: "Glob pattern to include files, matched against relative paths (repeatable)" },
        { name: "exclude", short: "e", type: "string", required: false, description: "Glob pattern to exclude files, matched against relative paths (repeatable)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano workspace push",
        "xano workspace push -d ./my-app",
        "xano workspace push -d ./my-app -b dev",
        "xano workspace push --dry-run",
        "xano workspace push --sync --delete --force",
        'xano workspace push -i "api/**" -i "function/**"',
        'xano workspace push -e "table/**" --records --truncate',
        "xano workspace push --no-transaction --no-guids"
      ]
    },
    {
      name: "workspace git pull",
      description: "Pull XanoScript files directly from a git repository (GitHub, GitLab, or any git URL). Destination directory is passed via -d/--directory.",
      usage: "xano workspace git pull -r <repo_url> [options]",
      flags: [
        { name: "repo", short: "r", type: "string", required: true, description: "Git repository URL (GitHub HTTPS, SSH, or any git URL)" },
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Output directory for imported files (defaults to current directory)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch, tag, or ref to fetch (defaults to repository default branch)" },
        { name: "path", type: "string", required: false, description: "Subdirectory within the repo to import from" },
        { name: "token", short: "t", type: "string", required: false, description: "Personal access token for private repos (falls back to GITHUB_TOKEN env var)" }
      ],
      examples: [
        "xano workspace git pull -r https://github.com/owner/repo",
        "xano workspace git pull -d ./code -r https://github.com/owner/repo",
        "xano workspace git pull -r https://github.com/owner/repo -b main --path src/xano",
        "xano workspace git pull -r https://github.com/owner/private-repo -t ghp_token123",
        "xano workspace git pull -r git@github.com:owner/repo.git"
      ]
    }
  ],

  workflows: [
    {
      name: "Local Development Cycle",
      description: "Edit Xano code locally with your preferred tools",
      steps: [
        "Pull workspace: `xano workspace pull -d ./code`",
        "Navigate to organized folders: `api/{group}/`, `function/`, `table/`, etc.",
        "Edit .xs files in your IDE (files use snake_case naming)",
        "Validate changes: Use xanoscript_docs MCP tool",
        "Push changes: `xano workspace push -d ./code`",
        "Test in Xano dashboard or via API"
      ],
      example: `xano workspace pull -d ./my-app
# Files organized: api/users/create_post.xs, function/validate_token.xs, etc.
xano workspace push -d ./my-app`
    },
    {
      name: "Version Control Setup",
      description: "Track Xano code changes in git",
      steps: [
        "Pull workspace: `xano workspace pull -d ./xano`",
        "Initialize git: `cd xano && git init`",
        "Add files: `git add . && git commit -m 'Initial import'`",
        "Make changes and commit regularly",
        "Push to Xano when ready: `xano workspace push -d ./xano`"
      ]
    },
    {
      name: "Cross-Branch Deployment",
      description: "Promote code from staging to production",
      steps: [
        "Pull from staging: `xano workspace pull -d ./deploy -b staging`",
        "Review changes",
        "Push to production: `xano workspace push -d ./deploy -b production`"
      ]
    },
    {
      name: "Selective Push with Dry Run",
      description: "Preview and selectively push only some files",
      steps: [
        "Preview first: `xano workspace push --dry-run`",
        "Include only functions: `xano workspace push -i 'function/**'`",
        "Exclude tables: `xano workspace push -e 'table/**'`",
        "Force full sync with deletes: `xano workspace push --sync --delete --force`"
      ]
    }
  ]
};
