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

When you pull, the CLI splits these into individual \`.xs\` files organized by type.`,

  ai_hints: `**Key concepts:**
- \`pull\` downloads workspace code and splits into organized .xs files
- \`push\` combines .xs files and uploads to Xano
- Files are organized by type: functions/, apis/, tasks/, etc.

**Typical workflow:**
1. \`xano workspace:pull ./xano-code\` - download
2. Edit .xs files with your editor/IDE
3. \`xano workspace:push ./xano-code\` - deploy

**Version control:**
- The pulled directory structure is git-friendly
- Commit changes to track history
- Use branches for different environments

**Branch handling:**
- Use \`-b\` flag or set branch in profile
- Pull from one branch, push to another is supported`,

  related_topics: ["start", "function", "integration"],

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
      description: "Download workspace code to local directory",
      usage: "xano workspace:pull <directory> [options]",
      args: [
        { name: "directory", required: true, description: "Local directory to save files" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch ID to pull from" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, description: "Include table records" }
      ],
      examples: [
        "xano workspace:pull ./my-app",
        "xano workspace:pull ./staging-code -b 2",
        "xano workspace:pull ./backup --env --records"
      ]
    },
    {
      name: "workspace:push",
      description: "Upload local XanoScript files to workspace",
      usage: "xano workspace:push <directory> [options]",
      args: [
        { name: "directory", required: true, description: "Local directory containing .xs files" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch ID to push to" }
      ],
      examples: [
        "xano workspace:push ./my-app",
        "xano workspace:push ./my-app -b 2"
      ]
    }
  ],

  workflows: [
    {
      name: "Local Development Cycle",
      description: "Edit Xano code locally with your preferred tools",
      steps: [
        "Pull workspace: `xano workspace:pull ./code`",
        "Edit .xs files in your IDE",
        "Validate changes: Use xanoscript_docs MCP tool",
        "Push changes: `xano workspace:push ./code`",
        "Test in Xano dashboard or via API"
      ],
      example: `xano workspace:pull ./my-app
# Edit files...
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
