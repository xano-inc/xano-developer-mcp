import type { TopicDoc } from "../types.js";

export const branchDoc: TopicDoc = {
  topic: "branch",
  title: "Xano CLI - Branch Management",
  description: `Branch commands let you manage Xano workspace branches from the CLI. Branches allow you to work on different versions of your workspace (development, staging, production, etc.) without affecting the live version.

## Key Concepts

- **v1 branch**: The default branch that always exists. Cannot be deleted or renamed.
- **Live branch**: The branch serving production API requests. Can be changed with \`branch:set-live\`.
- **Backup branches**: Created by automated backup features, marked as backup in listings.

## Branch Identification

Branches are identified by their **label** (e.g., "v1", "dev", "staging"), not numeric IDs.`,

  ai_hints: `**Key concepts:**
- Branches are identified by label (string), not ID
- "v1" is the default branch and cannot be deleted
- Live branch handles all production API traffic
- Use \`branch:list\` to see all branches in a workspace
- Use \`branch:set-live\` carefully - it affects production traffic

**Typical workflow:**
1. \`xano branch:list\` - see available branches
2. \`xano branch:create --label dev\` - create new branch from v1
3. Work on dev branch (pull/push with -b flag)
4. \`xano branch:set-live dev\` - promote to production

**Workspace ID:**
- Most commands need a workspace ID
- Pass via \`--workspace\` flag or configure in profile
- Use \`xano workspace:list\` to find workspace IDs`,

  related_topics: ["workspace", "profile", "integration"],

  commands: [
    {
      name: "branch:list",
      description: "List all branches in a workspace",
      usage: "xano branch:list [workspace_id] [options]",
      args: [
        { name: "workspace_id", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      flags: [
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano branch:list",
        "xano branch:list 123",
        "xano branch:list --output json"
      ]
    },
    {
      name: "branch:get",
      description: "Get details for a specific branch",
      usage: "xano branch:get <branch_label> [options]",
      args: [
        { name: "branch_label", required: true, description: 'Branch label (e.g., "v1", "dev")' }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano branch:get v1",
        "xano branch:get dev -w 123",
        "xano branch:get staging --output json"
      ]
    },
    {
      name: "branch:create",
      description: "Create a new branch by cloning from an existing branch",
      usage: "xano branch:create --label <label> [options]",
      flags: [
        { name: "label", short: "l", type: "string", required: true, description: "Label for the new branch" },
        { name: "source", short: "s", type: "string", required: false, default: "v1", description: 'Source branch to clone from (defaults to "v1")' },
        { name: "description", short: "d", type: "string", required: false, description: "Description for the new branch" },
        { name: "color", short: "c", type: "string", required: false, description: 'Color hex code for the branch (e.g., "#ebc346")' },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano branch:create --label dev",
        'xano branch:create -l feature-auth -s dev -d "Authentication feature"',
        'xano branch:create --label staging --color "#ebc346" --output json'
      ]
    },
    {
      name: "branch:edit",
      description: 'Update an existing branch (cannot update "v1" label)',
      usage: "xano branch:edit <branch_label> [options]",
      args: [
        { name: "branch_label", required: true, description: 'Branch label to edit (cannot edit "v1" label)' }
      ],
      flags: [
        { name: "label", short: "l", type: "string", required: false, description: "New label for the branch" },
        { name: "description", short: "d", type: "string", required: false, description: "New description for the branch" },
        { name: "color", short: "c", type: "string", required: false, description: 'New color hex code for the branch (e.g., "#ff5733")' },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano branch:edit dev --label development",
        'xano branch:edit feature-auth -l feature-authentication --color "#ff5733"',
        'xano branch:edit staging --description "Staging environment" -o json'
      ]
    },
    {
      name: "branch:delete",
      description: 'Delete a branch (cannot delete "v1" or the live branch)',
      usage: "xano branch:delete <branch_label> [options]",
      args: [
        { name: "branch_label", required: true, description: 'Branch label to delete (cannot delete "v1" or the live branch)' }
      ],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, default: "false", description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano branch:delete feature-old",
        "xano branch:delete dev --force",
        "xano branch:delete staging -f -o json"
      ]
    },
    {
      name: "branch:set-live",
      description: "Set a branch as the live (active) branch for API requests",
      usage: "xano branch:set-live <branch_label> [options]",
      args: [
        { name: "branch_label", required: true, description: 'Branch label to set as live (use "v1" for default branch)' }
      ],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, default: "false", description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano branch:set-live staging",
        "xano branch:set-live v1 --force",
        "xano branch:set-live production -f -o json"
      ]
    }
  ],

  workflows: [
    {
      name: "Development Branch Setup",
      description: "Create a development branch for safe experimentation",
      steps: [
        "List existing branches: `xano branch:list`",
        "Create dev branch from v1: `xano branch:create --label dev`",
        "Pull dev branch code: `xano workspace:pull ./dev-code -b dev`",
        "Make changes and push: `xano workspace:push ./dev-code -b dev`",
        "Test changes in dev environment"
      ],
      example: `xano branch:list
xano branch:create --label dev
xano workspace:pull ./dev -b dev
# Make changes...
xano workspace:push ./dev -b dev`
    },
    {
      name: "Feature Branch Workflow",
      description: "Work on a feature in isolation before merging",
      steps: [
        "Create feature branch from dev: `xano branch:create -l feature-auth -s dev`",
        "Pull and work on feature branch",
        "Test feature thoroughly",
        "Delete feature branch when done: `xano branch:delete feature-auth`"
      ]
    },
    {
      name: "Promote to Production",
      description: "Deploy tested changes to production",
      steps: [
        "Verify staging branch is ready",
        "Check current live branch: `xano branch:list`",
        "Set staging as live: `xano branch:set-live staging`",
        "Monitor for issues",
        "Rollback if needed: `xano branch:set-live v1 --force`"
      ],
      example: `# Check branches
xano branch:list

# Promote staging to live
xano branch:set-live staging

# If issues occur, rollback
xano branch:set-live v1 --force`
    }
  ]
};
