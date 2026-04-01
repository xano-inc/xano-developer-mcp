import type { TopicDoc } from "../types.js";

export const branchDoc: TopicDoc = {
  topic: "branch",
  title: "Xano CLI - Branch Management",
  description: `Branch commands let you list and delete Xano workspace branches. Branches allow you to work on different versions of your workspace (development, staging, production) without affecting the live version.

## Key Concepts

- **Live branch**: The branch serving production API requests. Cannot be deleted.
- **Default branch**: The primary branch (usually "v1"). Cannot be deleted.
- **Feature branches**: Additional branches for development and testing.

## Available Commands

The CLI provides two branch commands:

| Command | Purpose |
|---------|---------|
| \`branch list\` | List all branches in a workspace |
| \`branch delete\` | Delete a non-live, non-default branch |

Run \`xano branch <command> --help\` for detailed flags and arguments.

> **Note:** Branch creation, editing, and promoting to live are done via the Xano dashboard or the Meta API, not the CLI.`,

  ai_hints: `**CLI only supports list and delete for branches.**
- Use \`xano branch list -w <workspace_id>\` to see all branches
- Use \`xano branch delete <label> -w <workspace_id>\` to remove a branch
- Cannot delete live or default branches

**For branch creation/editing:** Use the Meta API endpoints or the Xano dashboard.

**Using branches with other commands:** Most resource commands support a \`--branch\` flag to target a specific branch.`,

  related_topics: ["workspace", "profile", "integration"],

  commands: [
    {
      name: "branch list",
      description: "List all branches in a workspace",
      usage: "xano branch list [-w <workspace_id>] [-p <profile>] [-o summary|json]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile default if not set)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano branch list",
        "xano branch list -w 40",
        "xano branch list -o json"
      ]
    },
    {
      name: "branch delete",
      description: "Delete a workspace branch (cannot delete default or live branch)",
      usage: "xano branch delete <branch_label> [-w <workspace_id>] [--force] [-p <profile>]",
      args: [
        { name: "branch_label", required: true, description: "Branch label to delete" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" }
      ],
      examples: [
        "xano branch delete feature-old -w 40",
        "xano branch delete dev --force"
      ]
    }
  ],

  workflows: [
    {
      name: "Cleanup Old Branches",
      description: "List and remove branches no longer needed",
      steps: [
        "List branches: `xano branch list -w 40`",
        "Delete old ones: `xano branch delete feature-old -w 40 --force`"
      ]
    }
  ]
};
