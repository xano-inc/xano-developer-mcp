import type { TopicDoc } from "../types.js";

export const functionDoc: TopicDoc = {
  topic: "function",
  title: "Xano CLI - Function Management",
  description: `Function commands let you list, view, create, and edit individual Xano functions. This is useful for quick edits or when you don't need to sync the entire workspace.`,

  ai_hints: `**When to use function commands vs workspace commands:**
- Use \`function:*\` for quick single-function edits
- Use \`workspace:pull/push\` for bulk operations or version control

**Output formats:**
- \`summary\` - Human-readable table
- \`json\` - Full metadata (good for scripting)
- \`xs\` - Raw XanoScript code only

**Editor integration:**
- Commands use \`$EDITOR\` environment variable
- Set to your preferred editor: \`export EDITOR=vim\`
- Use \`--edit\` flag to open in editor before create/update`,

  related_topics: ["workspace", "run"],

  commands: [
    {
      name: "function:list",
      description: "List all functions in the workspace",
      usage: "xano function:list [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary, json" },
        { name: "page", type: "number", required: false, default: "1", description: "Page number" },
        { name: "per_page", type: "number", required: false, default: "50", description: "Items per page" },
        { name: "search", type: "string", required: false, description: "Search by name" },
        { name: "sort", type: "string", required: false, description: "Sort field" },
        { name: "order", type: "string", required: false, description: "Sort order: asc, desc" },
        { name: "include_draft", type: "boolean", required: false, description: "Include draft versions" }
      ],
      examples: [
        "xano function:list",
        "xano function:list --search auth",
        "xano function:list -o json --include_draft"
      ]
    },
    {
      name: "function:get",
      description: "Get a specific function by ID",
      usage: "xano function:get [function_id] [options]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary, json, xs" },
        { name: "include_draft", type: "boolean", required: false, description: "Get draft version if available" },
        { name: "include_xanoscript", type: "boolean", required: false, description: "Include XanoScript in JSON output" }
      ],
      examples: [
        "xano function:get 145",
        "xano function:get 145 -o xs > my_function.xs",
        "xano function:get 145 -o json --include_xanoscript"
      ]
    },
    {
      name: "function:create",
      description: "Create a new function from XanoScript",
      usage: "xano function:create [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "file", short: "f", type: "string", required: false, description: "Path to .xs file" },
        { name: "stdin", type: "boolean", required: false, description: "Read from stdin" },
        { name: "edit", type: "boolean", required: false, description: "Open in $EDITOR before creating" }
      ],
      examples: [
        "xano function:create -f ./my_function.xs",
        "cat function.xs | xano function:create --stdin",
        "xano function:create --edit"
      ]
    },
    {
      name: "function:edit",
      description: "Edit an existing function",
      usage: "xano function:edit [function_id] [options]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "file", short: "f", type: "string", required: false, description: "Path to .xs file with updated code" }
      ],
      examples: [
        "xano function:edit 145",
        "xano function:edit 145 -f ./updated_function.xs"
      ]
    }
  ],

  workflows: [
    {
      name: "Quick Function Edit",
      description: "Quickly edit a function without full workspace sync",
      steps: [
        "Get function code: `xano function:get 145 -o xs > func.xs`",
        "Edit the file locally",
        "Upload changes: `xano function:edit 145 -f func.xs`"
      ],
      example: `xano function:get 145 -o xs > auth_check.xs
vim auth_check.xs
xano function:edit 145 -f auth_check.xs`
    },
    {
      name: "Create from Template",
      description: "Create a new function from a template file",
      steps: [
        "Write your XanoScript function in a .xs file",
        "Create in Xano: `xano function:create -f template.xs`"
      ]
    }
  ]
};
