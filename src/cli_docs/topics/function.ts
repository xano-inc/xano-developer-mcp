import type { TopicDoc } from "../types.js";

export const functionDoc: TopicDoc = {
  topic: "function",
  title: "Xano CLI - Function Management",
  description: `Function commands let you list, view, create, and edit individual Xano functions. This is useful for quick edits or when you don't need to sync the entire workspace.

## Syntax note

Xano CLI commands are SPACE-separated (e.g. \`xano function list\`), not colon-separated.`,

  ai_hints: `**When to use function commands vs workspace commands:**
- Use \`function *\` subcommands for quick single-function edits
- Use \`workspace pull\`/\`workspace push\` for bulk operations or version control
- Use \`sandbox\` for isolated iteration without touching the live workspace

**Output formats:**
- \`summary\` - Human-readable table
- \`json\` - Full metadata (good for scripting)
- \`xs\` - Raw XanoScript code only (available on \`function get\`)

**Editor integration:**
- On \`function edit\` with no flags (besides the function_id): CLI fetches the current code from the API and opens it directly in \`$EDITOR\`. No temp file or \`--file\` required. This is the easiest interactive workflow.
- \`--edit\` flag opens the file in \`$EDITOR\` before create/update
- On \`function create\` and \`function edit\`, \`--edit\` requires \`--file\`
- Set your editor: \`export EDITOR=vim\`

**Draft / publish:**
- \`function edit\` publishes by default; use \`--no-publish\` to save as draft only
- Use \`--include_draft\` on \`function get\` / \`function list\` to see draft versions`,

  related_topics: ["workspace", "sandbox", "branch"],

  commands: [
    {
      name: "function list",
      description: "List all functions in the workspace",
      usage: "xano function list [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "page", type: "number", required: false, default: "1", description: "Page number for pagination" },
        { name: "per_page", type: "number", required: false, default: "50", description: "Number of results per page" },
        { name: "sort", type: "string", required: false, default: "created_at", description: "Sort field" },
        { name: "order", type: "string", required: false, default: "desc", description: "Sort order: asc or desc" },
        { name: "include_draft", type: "boolean", required: false, default: "false", description: "Include draft versions in the list" },
        { name: "include_xanoscript", type: "boolean", required: false, default: "false", description: "Include XanoScript source in JSON output" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano function list",
        "xano function list -w 40",
        "xano function list -o json --include_draft",
        "xano function list --sort name --order asc --per_page 100"
      ]
    },
    {
      name: "function get",
      description: "Get a specific function by ID. If function_id is omitted, an interactive picker is shown.",
      usage: "xano function get [function_id] [options]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary, json, or xs" },
        { name: "include_draft", type: "boolean", required: false, default: "false", description: "Get draft version if available" },
        { name: "include_xanoscript", type: "boolean", required: false, default: "false", description: "Include XanoScript source in JSON output" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano function get 145",
        "xano function get 145 -o xs > my_function.xs",
        "xano function get 145 -o json --include_xanoscript",
        "xano function get 145 --include_draft"
      ]
    },
    {
      name: "function create",
      description: "Create a new function from XanoScript. Provide source via --file, --stdin, or open in editor via --edit (requires --file).",
      usage: "xano function create [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "file", short: "f", type: "string", required: false, description: "Path to file containing XanoScript code (mutually exclusive with --stdin)" },
        { name: "stdin", short: "s", type: "boolean", required: false, default: "false", description: "Read XanoScript code from stdin (mutually exclusive with --file)" },
        { name: "edit", short: "e", type: "boolean", required: false, default: "false", description: "Open the file in $EDITOR before creating (requires --file)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano function create -f ./my_function.xs",
        "cat function.xs | xano function create --stdin",
        "xano function create -f ./scaffold.xs --edit",
        "xano function create -f ./my_function.xs -o json"
      ]
    },
    {
      name: "function edit",
      description: "Edit an existing function. If neither --file nor --stdin is provided, the CLI fetches the current XanoScript from the API and opens it directly in $EDITOR — this is the most ergonomic usage. If function_id is omitted, an interactive picker is shown.",
      usage: "xano function edit [function_id] [options]",
      args: [
        { name: "function_id", required: false, description: "Function ID (interactive selection if omitted)" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "file", short: "f", type: "string", required: false, description: "Path to file with updated XanoScript (mutually exclusive with --stdin)" },
        { name: "stdin", short: "s", type: "boolean", required: false, default: "false", description: "Read updated XanoScript from stdin (mutually exclusive with --file)" },
        { name: "edit", short: "e", type: "boolean", required: false, default: "false", description: "Open the file in $EDITOR before updating (requires --file)" },
        { name: "publish", type: "boolean", required: false, default: "true", description: "Publish after editing (use --no-publish to save as draft only)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano function edit 145                            # fetch current code, open in $EDITOR",
        "xano function edit 145 -f ./updated_function.xs",
        "xano function edit 145 -f ./updated_function.xs --edit",
        "xano function edit 145 -f ./draft.xs --no-publish"
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
    },
    {
      name: "Create from Template",
      description: "Create a new function from a template file",
      steps: [
        "Write your XanoScript function in a .xs file",
        "Create in Xano: `xano function create -f template.xs`"
      ]
    },
    {
      name: "Draft Then Publish",
      description: "Save an edit as a draft and publish later",
      steps: [
        "Save as draft: `xano function edit 145 -f func.xs --no-publish`",
        "Review via `xano function get 145 --include_draft`",
        "Publish with a normal edit: `xano function edit 145 -f func.xs`"
      ]
    }
  ]
};
