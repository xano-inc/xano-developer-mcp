import type { TopicDoc } from "../types.js";

export const functionDoc: TopicDoc = {
  topic: "function",
  title: "Xano CLI - Function Management",
  description: `Function commands let you list, view, create, edit, delete, and manage security for individual Xano functions. Useful for quick single-function edits without syncing the entire workspace.

## Available Commands

| Command | Purpose |
|---------|---------|
| \`function list\` | List all functions in workspace |
| \`function get\` | Get a specific function |
| \`function create\` | Create from XanoScript file |
| \`function edit\` | Edit an existing function |
| \`function delete\` | Delete a function |
| \`function security\` | Manage function security/GUID |

Run \`xano function <command> --help\` for detailed flags and arguments.`,

  ai_hints: `**When to use function commands vs workspace commands:**
- Use \`function *\` for quick single-function edits
- Use \`workspace export/import\` for bulk operations

**Output formats:**
- \`summary\` - Human-readable table
- \`json\` - Full metadata (good for scripting)
- \`xs\` - Raw XanoScript code only

**Editor integration:**
- Commands use \`$EDITOR\` environment variable
- Use \`--edit\` flag to open in editor before create/update

**Discovery:** Run \`xano function <command> --help\` for full details.
For XanoScript syntax guide: \`xano docs function\``,

  related_topics: ["workspace", "resources", "run"],

  commands: [
    {
      name: "function list",
      description: "List all functions in the workspace",
      usage: "xano function list [-w <workspace>] [-o summary|json] [--include_draft] [--page <n>] [--per_page <n>]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary, json" },
        { name: "include_draft", type: "boolean", required: false, description: "Include draft functions" },
        { name: "include_xanoscript", type: "boolean", required: false, description: "Include XanoScript in response" }
      ],
      examples: [
        "xano function list",
        "xano function list -o json",
        "xano function list --include_draft"
      ]
    },
    {
      name: "function get",
      description: "Get a specific function by ID",
      usage: "xano function get [function_id] [-w <workspace>] [-o summary|json|xs]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      examples: [
        "xano function get 145",
        "xano function get 145 -o xs > my_function.xs",
        "xano function get 145 -o json"
      ]
    },
    {
      name: "function create",
      description: "Create a new function from XanoScript",
      usage: "xano function create [-w <workspace>] [-f <file>] [-s] [-e]",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to .xs file" },
        { name: "stdin", short: "s", type: "boolean", required: false, description: "Read from stdin" },
        { name: "edit", short: "e", type: "boolean", required: false, description: "Open in $EDITOR before creating" }
      ],
      examples: [
        "xano function create -f ./my_function.xs",
        "xano function create --edit"
      ]
    },
    {
      name: "function edit",
      description: "Edit an existing function",
      usage: "xano function edit [function_id] [-w <workspace>] [-f <file>] [-s] [-e] [--publish]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to .xs file with updated code" },
        { name: "stdin", short: "s", type: "boolean", required: false, description: "Read from stdin" },
        { name: "edit", short: "e", type: "boolean", required: false, description: "Open in $EDITOR before updating" },
        { name: "publish", type: "boolean", required: false, description: "Publish the function after editing" }
      ],
      examples: [
        "xano function edit 145 -f ./updated_function.xs",
        "xano function edit 145",
        "xano function edit 145 --publish"
      ]
    },
    {
      name: "function delete",
      description: "Delete a function permanently",
      usage: "xano function delete <function_id> [-w <workspace>] [-f]",
      args: [
        { name: "function_id", required: true, description: "Function ID to delete" }
      ],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" }
      ],
      examples: [
        "xano function delete 145",
        "xano function delete 145 --force"
      ]
    },
    {
      name: "function security",
      description: "Update function security configuration",
      usage: "xano function security <function_id> [-w <workspace>] [-g <apigroup-guid>] [--clear] [-o summary|json]",
      args: [
        { name: "function_id", required: true, description: "Function ID" }
      ],
      flags: [
        { name: "apigroup-guid", short: "g", type: "string", required: false, description: "API Group GUID to restrict access" },
        { name: "clear", type: "boolean", required: false, description: "Clear security restriction (remove API group requirement)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano function security 145 --apigroup-guid abc123",
        "xano function security 145 --clear"
      ]
    }
  ],

  workflows: [
    {
      name: "Quick Function Edit",
      description: "Quickly edit a function without full workspace sync",
      steps: [
        "Get function code: `xano function get 145 -o xs > func.xs`",
        "Edit the file locally",
        "Upload changes: `xano function edit 145 -f func.xs`"
      ],
      example: `xano function get 145 -o xs > auth_check.xs
vim auth_check.xs
xano function edit 145 -f auth_check.xs`
    }
  ]
};
