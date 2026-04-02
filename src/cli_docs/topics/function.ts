import type { TopicDoc } from "../types.js";

export const functionDoc: TopicDoc = {
  topic: "function",
  title: "Xano CLI - Function Management",
  description: `Function commands let you list, view, create, and edit Xano functions. Useful for quick single-function operations without syncing the entire workspace.

## Available Commands

| Command | Purpose |
|---------|---------|
| \`function list\` | List all functions in workspace |
| \`function get\` | Get a specific function |
| \`function create\` | Create from XanoScript file |
| \`function edit\` | Edit an existing function |

Run \`xano function <command> --help\` for detailed flags and arguments.`,

  ai_hints: `**When to use function commands vs workspace pull/push:**
- Use \`function *\` for quick single-function edits
- Use \`workspace pull/push\` (via sandbox) for bulk operations

**Output formats:**
- \`summary\` - Human-readable table
- \`json\` - Full metadata (good for scripting)
- \`xs\` - Raw XanoScript code only (function get only)

**Editor integration:**
- Commands use \`$EDITOR\` environment variable
- Use \`--edit\` flag to open in editor before create/update

**Discovery:** Run \`xano function <command> --help\` for full details.`,

  related_topics: ["workspace", "sandbox"],

  commands: [
    {
      name: "function list",
      description: "List all functions in the workspace",
      usage: "xano function list [-w <workspace>] [-o summary|json] [--include_draft] [--include_xanoscript] [--sort <field>] [--order asc|desc] [--page <n>] [--per_page <n>]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary, json" },
        { name: "include_draft", type: "boolean", required: false, description: "Include draft functions" },
        { name: "include_xanoscript", type: "boolean", required: false, description: "Include XanoScript in response" },
        { name: "sort", type: "string", required: false, default: "created_at", description: "Sort field" },
        { name: "order", type: "string", required: false, default: "desc", description: "Sort order: asc or desc" },
        { name: "page", type: "number", required: false, default: "1", description: "Page number for pagination" },
        { name: "per_page", type: "number", required: false, default: "50", description: "Results per page" }
      ],
      examples: [
        "xano function list",
        "xano function list -o json",
        "xano function list --include_draft"
      ]
    },
    {
      name: "function get",
      description: "Get a specific function by ID. If no ID is provided, shows interactive selection.",
      usage: "xano function get [function_id] [-w <workspace>] [-o summary|json|xs] [--include_draft] [--include_xanoscript]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary, json, or xs (XanoScript code)" },
        { name: "include_draft", type: "boolean", required: false, description: "Include draft version" },
        { name: "include_xanoscript", type: "boolean", required: false, description: "Include XanoScript in response" }
      ],
      examples: [
        "xano function get 145",
        "xano function get 145 -o xs > my_function.xs",
        "xano function get 145 -o json",
        "xano function get 145 --include_draft"
      ]
    },
    {
      name: "function create",
      description: "Create a new function from XanoScript",
      usage: "xano function create [-w <workspace>] [-f <file>] [-s] [-e] [-o summary|json]",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to .xs file" },
        { name: "stdin", short: "s", type: "boolean", required: false, description: "Read from stdin" },
        { name: "edit", short: "e", type: "boolean", required: false, description: "Open in $EDITOR before creating (requires --file)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano function create -f ./my_function.xs",
        "xano function create --edit",
        "cat function.xs | xano function create --stdin"
      ]
    },
    {
      name: "function edit",
      description: "Edit an existing function. If no ID is provided, shows interactive selection. If no file is provided, opens current code in $EDITOR.",
      usage: "xano function edit [function_id] [-w <workspace>] [-f <file>] [-s] [-e] [--publish] [-o summary|json]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to .xs file with updated code" },
        { name: "stdin", short: "s", type: "boolean", required: false, description: "Read from stdin" },
        { name: "edit", short: "e", type: "boolean", required: false, description: "Open in $EDITOR before updating (requires --file)" },
        { name: "publish", type: "boolean", required: false, description: "Publish the function after editing" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano function edit 145 -f ./updated_function.xs",
        "xano function edit 145",
        "xano function edit 145 --publish",
        "cat updated.xs | xano function edit 145 --stdin"
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
# Edit auth_check.xs...
xano function edit 145 -f auth_check.xs`
    }
  ]
};
