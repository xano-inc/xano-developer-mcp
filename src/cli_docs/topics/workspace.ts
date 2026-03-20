import type { TopicDoc } from "../types.js";

export const workspaceDoc: TopicDoc = {
  topic: "workspace",
  title: "Xano CLI - Workspace Operations",
  description: `Workspace commands let you sync XanoScript code between your local filesystem and Xano. This enables version control, local editing, and CI/CD workflows.

## Multidoc Format

Xano uses a "multidoc" format where multiple XanoScript documents are separated by \`---\`:

\`\`\`xanoscript
# functions/auth.xs
---
function: validate_token
...
---
function: refresh_token
...
\`\`\`

When you pull, the CLI splits these into individual \`.xs\` files organized by type.

## Directory Structure

After \`workspace:pull\`, files are organized using snake_case naming:

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
├── agent/
│   ├── support_bot.xs            # AI agents
│   └── trigger/
│       └── on_message.xs         # Agent triggers
└── mcp_server/
    ├── my_server.xs              # MCP server definitions
    └── trigger/
        └── on_connect.xs         # MCP server triggers
\`\`\``,

  ai_hints: `**Key concepts:**
- \`pull\` downloads workspace code and splits into organized .xs files
- \`push\` combines .xs files and uploads to Xano
- Files use snake_case naming for folders and filenames
- API endpoints are nested under their API group folder

**Typical workflow:**
1. \`xano workspace:pull ./xano-code\` - download
2. Navigate to \`api/{group}/\` for API endpoints, \`function/\` for functions, etc.
3. Edit .xs files with your editor/IDE
4. \`xano workspace:push ./xano-code\` - deploy

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
- \`--include/-i\` and \`--exclude/-e\`: Glob patterns for selective push

**Git integration:**
- \`workspace:git:pull\` pulls XanoScript directly from GitHub/GitLab repos
- Supports private repos with \`--token\` flag
- Can pull from a specific subdirectory with \`--path\``,

  related_topics: ["start", "branch", "function", "release", "integration"],

  commands: [
    {
      name: "workspace:list",
      description: "List all workspaces accessible to your account",
      usage: "xano workspace:list [-p <profile>]",
      examples: ["xano workspace:list", "xano workspace:list -p production"]
    },
    {
      name: "workspace:get",
      description: "Get details of a specific workspace",
      usage: "xano workspace:get [workspace_id] [options]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      flags: [
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace:get 123",
        "xano workspace:get --output json",
        "xano workspace:get 456 -p production -o json"
      ]
    },
    {
      name: "workspace:create",
      description: "Create a new workspace via the Xano Metadata API",
      usage: "xano workspace:create --name <name> [options]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Name of the workspace" },
        { name: "description", short: "d", type: "string", required: false, description: "Description for the workspace" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        'xano workspace:create --name "my-workspace"',
        'xano workspace:create --name "my-app" --description "My application workspace"',
        'xano workspace:create -n "new-project" -d "New project workspace" -o json'
      ]
    },
    {
      name: "workspace:edit",
      description: "Edit an existing workspace via the Xano Metadata API",
      usage: "xano workspace:edit [workspace_id] [options]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID to edit (uses profile workspace if not provided)" }
      ],
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "New name for the workspace" },
        { name: "description", short: "d", type: "string", required: false, description: "New description for the workspace" },
        { name: "swagger", type: "boolean", required: false, description: "Enable or disable swagger documentation (--swagger or --no-swagger)" },
        { name: "require-token", type: "boolean", required: false, description: "Require token for documentation access (--require-token or --no-require-token)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        'xano workspace:edit 123 --name "new-name"',
        'xano workspace:edit --name "updated-workspace" --description "Updated description"',
        "xano workspace:edit 123 --swagger --require-token",
        "xano workspace:edit 123 --no-swagger -o json"
      ]
    },
    {
      name: "workspace:delete",
      description: "Delete a workspace via the Xano Metadata API. Cannot delete workspaces with active tenants.",
      usage: "xano workspace:delete <workspace_id> [options]",
      args: [
        { name: "workspace_id", required: true, description: "Workspace ID to delete" }
      ],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, default: "false", description: "Skip confirmation prompt" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workspace:delete 123",
        "xano workspace:delete 123 --force",
        "xano workspace:delete 123 -f -o json"
      ]
    },
    {
      name: "workspace:pull",
      description: "Download workspace code to local directory. Splits multidoc into individual .xs files organized by type.",
      usage: "xano workspace:pull <directory> [options]",
      args: [
        { name: "directory", required: true, description: "Local directory to save files" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch label to pull from" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "draft", type: "boolean", required: false, description: "Include draft versions of functions" },
        { name: "records", type: "boolean", required: false, description: "Include table records" }
      ],
      examples: [
        "xano workspace:pull ./my-app",
        "xano workspace:pull ./staging-code -b dev",
        "xano workspace:pull ./backup --env --records --draft"
      ]
    },
    {
      name: "workspace:push",
      description: "Upload local XanoScript files to workspace. By default only pushes changed files (partial push). Use --sync for a full push.",
      usage: "xano workspace:push <directory> [options]",
      args: [
        { name: "directory", required: true, description: "Local directory containing .xs files" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch label to push to" },
        { name: "sync", type: "boolean", required: false, description: "Full push (default is partial/changed-only)" },
        { name: "delete", type: "boolean", required: false, description: "Delete remote objects not in local files (requires --sync)" },
        { name: "dry-run", type: "boolean", required: false, description: "Preview changes without applying" },
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, description: "Include table records" },
        { name: "truncate", type: "boolean", required: false, description: "Truncate tables before importing records" },
        { name: "transaction", type: "boolean", required: false, default: "true", description: "Wrap push in database transaction (--no-transaction to disable)" },
        { name: "guids", type: "boolean", required: false, default: "true", description: "Write GUIDs back to local files after push (--no-guids to disable)" },
        { name: "include", short: "i", type: "string", required: false, description: "Glob pattern to include specific files (repeatable)" },
        { name: "exclude", short: "e", type: "string", required: false, description: "Glob pattern to exclude specific files (repeatable)" }
      ],
      examples: [
        "xano workspace:push ./my-app",
        "xano workspace:push ./my-app -b dev",
        "xano workspace:push ./my-app --dry-run",
        "xano workspace:push ./my-app --sync --delete --force",
        "xano workspace:push ./my-app -i 'api/**' -i 'function/**'",
        "xano workspace:push ./my-app -e 'table/**' --records --truncate"
      ]
    },
    {
      name: "workspace:git:pull",
      description: "Pull XanoScript files directly from a git repository (GitHub, GitLab, etc.)",
      usage: "xano workspace:git:pull <directory> --repo <url> [options]",
      args: [
        { name: "directory", required: true, description: "Local directory to save files" }
      ],
      flags: [
        { name: "repo", short: "r", type: "string", required: true, description: "Git repository URL (HTTPS or SSH)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Git branch, tag, or ref to pull from" },
        { name: "path", type: "string", required: false, description: "Subdirectory within the repo to pull from" },
        { name: "token", short: "t", type: "string", required: false, description: "Personal access token for private repos" }
      ],
      examples: [
        "xano workspace:git:pull ./code -r https://github.com/org/repo.git",
        "xano workspace:git:pull ./code -r https://github.com/org/repo.git -b main --path src/xano",
        "xano workspace:git:pull ./code -r https://github.com/org/private-repo.git -t ghp_token123"
      ]
    }
  ],

  workflows: [
    {
      name: "Local Development Cycle",
      description: "Edit Xano code locally with your preferred tools",
      steps: [
        "Pull workspace: `xano workspace:pull ./code`",
        "Navigate to organized folders: `api/{group}/`, `function/`, `table/`, etc.",
        "Edit .xs files in your IDE (files use snake_case naming)",
        "Validate changes: Use xanoscript_docs MCP tool",
        "Push changes: `xano workspace:push ./code`",
        "Test in Xano dashboard or via API"
      ],
      example: `xano workspace:pull ./my-app
# Files organized: api/users/create_post.xs, function/validate_token.xs, etc.
xano workspace:push ./my-app`
    },
    {
      name: "Version Control Setup",
      description: "Track Xano code changes in git",
      steps: [
        "Pull workspace: `xano workspace:pull ./xano`",
        "Initialize git: `cd xano && git init`",
        "Add files: `git add . && git commit -m 'Initial import'`",
        "Make changes and commit regularly",
        "Push to Xano when ready: `xano workspace:push ./xano`"
      ]
    },
    {
      name: "Cross-Branch Deployment",
      description: "Promote code from staging to production",
      steps: [
        "Pull from staging: `xano workspace:pull ./deploy -b staging`",
        "Review changes",
        "Push to production: `xano workspace:push ./deploy -b production`"
      ]
    }
  ]
};
