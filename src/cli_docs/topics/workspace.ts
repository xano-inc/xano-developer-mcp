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
