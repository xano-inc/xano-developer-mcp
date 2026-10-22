import type { TopicDoc } from "../types.js";

export const functionDoc: TopicDoc = {
  topic: "function",
  title: "Xano CLI - Function Management",
  description: `Function commands let you list, view, create, edit, and run individual Xano functions. This is useful for quick edits or when you don't need to sync the entire workspace.

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
- Use \`--include_draft\` on \`function get\` / \`function list\` to see draft versions

**Running functions (\`function run\`):**
- Functions are run by NAME, not ID: \`xano function run my_function\`
- Build the input JSON with repeatable \`-d\` pairs: \`key=value\` for strings, \`key:=raw_json\` for numbers/booleans/objects/arrays, \`key@file\` for file contents
- Or pass a whole object: \`--json '{...}'\`, \`--json @file.json\`, or \`--stdin\`; \`-d\` pairs override keys from the JSON object
- Default output is the bare result value as JSON (pipe-friendly, e.g. \`| jq\`); use \`-o summary\` for status + result, \`--logs\` for debugger logs
- The CLI checks inputs against the function's declared schema and prompts for missing required inputs on a TTY; in scripts, pass all required inputs (or \`--no-input-check\` to send as-is)
- Exit code 1 when the execution status is not ok — safe to use in CI`,

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
    },
    {
      name: "function run",
      description: "Run (execute) a named function in a workspace and print its result. Functions are selected by NAME (not ID). Input is a JSON object assembled from --json/--stdin plus repeatable --data pairs (--data overrides). Unless --no-input-check, the CLI validates the payload against the function's declared inputs, warns on mismatches, and prompts for missing required inputs on a TTY (non-TTY errors instead). Exits 1 if the execution status is not ok.",
      usage: "xano function run [name] [options]",
      args: [
        { name: "name", required: false, description: "Name of the function to run (interactive picker if omitted and --name unset)" }
      ],
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "Name of the function to run (alternative to the positional argument)" },
        { name: "data", short: "d", type: "string", required: false, description: "Input field as key=value (string), key:=json (raw JSON), or key@file (file contents). Repeatable; layered on top of --json/--stdin." },
        { name: "json", type: "string", required: false, description: "Input as a JSON object: inline, @file.json, or '-' for stdin. Mutually exclusive with --stdin." },
        { name: "stdin", short: "s", type: "boolean", required: false, default: "false", description: "Read the input JSON object from stdin (same as --json -). Mutually exclusive with --json." },
        { name: "branch", type: "string", required: false, description: "Branch to run from (defaults to profile branch, then main)" },
        { name: "logs", type: "boolean", required: false, default: "false", description: "Print the execution logs returned by the debugger" },
        { name: "no-input-check", type: "boolean", required: false, default: "false", description: "Skip local schema validation and interactive prompting; send the payload as-is" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "json", description: "Output format: json (prints just the result value) or summary (status + result)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano function run validate_token -d token=abc123",
        "xano function run calc_totals -d amount:=42.5 -d items:='[1,2,3]'",
        "xano function run import_users --json @input.json",
        "echo '{\"user_id\": 7}' | xano function run get_profile --stdin",
        "xano function run send_digest -d body@./email.html --branch dev --logs"
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
      name: "Run a Function with Inputs",
      description: "Execute a function and consume its result in a script",
      steps: [
        "Run with inline inputs: `xano function run my_function -d user_id:=7`",
        "Or pipe a JSON object: `echo '{\"user_id\": 7}' | xano function run my_function --stdin`",
        "Default output is the bare result JSON — pipe to jq or capture in a variable",
        "Check the exit code: non-ok execution status exits 1"
      ],
      example: `RESULT=$(xano function run calc_totals -d items:='[1,2,3]')
echo "$RESULT" | jq .total`
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
