import type { TopicDoc } from "../types.js";

export const sandboxDoc: TopicDoc = {
  topic: "sandbox",
  title: "Xano CLI - Sandbox Environment",
  description: `Sandbox is a personal, auto-provisioned development environment tied to your Xano account. It's a singleton per user — there's exactly one sandbox, and the CLI creates it on first use. Designed for free-tier users and local iteration, sandbox supports the full pull/push multidoc workflow without the ceremony of workspace/tenant management.

## Key Concepts

- **Singleton**: Each user has exactly one sandbox. No name/ID to manage.
- **Auto-provisioned**: \`xano sandbox get\` creates it on first call if it doesn't exist.
- **Free-tier friendly**: Available without paid plan, scoped to the authenticated user.
- **Review-driven**: After pushing, open the sandbox in a browser to review and promote changes to a real workspace.
- **Multidoc push/pull**: Same file layout as \`xano workspace pull/push\` — API groups, functions, tables, agents, etc. split into \`.xs\` files.

## When to Use Sandbox vs Workspace

- Use **sandbox** for: personal experimentation, prototyping, AI-assisted code generation, CI examples, quick tests without risking shared state.
- Use **workspace** for: team collaboration, production code, release management, tenant deployments.`,

  ai_hints: `**Prefer sandbox for AI-assisted development and code experimentation:**
- It's free-tier, auto-created, and disposable (\`sandbox reset\` wipes it clean).
- The push/pull interface mirrors \`workspace\`, so workflows translate directly.
- Use \`sandbox push --review\` to push and immediately open the browser to verify changes.
- Use \`sandbox reset\` to start over without recreating the sandbox.
- Use \`sandbox delete\` only if the user really wants to remove the sandbox entirely — \`reset\` is usually what they want.

**Typical flow:**
1. \`xano sandbox pull -d ./code\` — grab the current state
2. Edit .xs files locally
3. \`xano sandbox push --review\` — push and open browser
4. In the dashboard, promote changes to a real workspace if desired

**Partial push is the default** — only changed files are sent. Use \`--sync\` for a full push, \`--sync --delete\` to also remove remote objects missing locally, and \`--dry-run\` to preview.

**Glob filters** (\`-i\` include, \`-e\` exclude) are repeatable and match relative paths from the push directory.

**Transaction / GUID flags:** push wraps imports in a database transaction by default (\`--no-transaction\` to disable) and writes server-assigned GUIDs back to local files by default (\`--no-guids\` to disable).

**Environment variables and tests** are managed per-sandbox via \`sandbox env\` and \`sandbox unit_test\` / \`sandbox workflow_test\` subcommands.

**\`sandbox impersonate\` is a hidden alias for \`sandbox review\`** — prefer \`sandbox review\`.`,

  related_topics: ["workspace", "tenant", "start", "integration"],

  commands: [
    {
      name: "sandbox get",
      description: "Get your sandbox environment, creating it if it doesn't exist. Safe to run repeatedly.",
      usage: "xano sandbox get [options]",
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox get", "xano sandbox get -o json"]
    },
    {
      name: "sandbox pull",
      description: "Pull sandbox contents to a local directory, splitting multidoc output into individual .xs files organized by type.",
      usage: "xano sandbox pull [options]",
      flags: [
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Output directory for pulled documents" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, description: "Include table records" },
        { name: "draft", type: "boolean", required: false, description: "Include draft versions" }
      ],
      examples: [
        "xano sandbox pull",
        "xano sandbox pull -d ./my-sandbox",
        "xano sandbox pull -d ./my-sandbox --env --records"
      ]
    },
    {
      name: "sandbox push",
      description: "Push local documents to the sandbox via multidoc import. Partial (changed-only) by default; shows a preview unless --force.",
      usage: "xano sandbox push [options]",
      flags: [
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Directory containing documents to push" },
        { name: "sync", type: "boolean", required: false, description: "Full push of all files (default is partial/changed-only)" },
        { name: "delete", type: "boolean", required: false, description: "Delete remote objects not in local files (requires --sync)" },
        { name: "dry-run", type: "boolean", required: false, description: "Preview changes without applying" },
        { name: "force", type: "boolean", required: false, description: "Skip preview and confirmation (for CI/CD)" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, description: "Include table records" },
        { name: "truncate", type: "boolean", required: false, description: "Truncate tables before importing records" },
        { name: "transaction", type: "boolean", required: false, default: "true", description: "Wrap import in a database transaction (--no-transaction to disable)" },
        { name: "guids", type: "boolean", required: false, default: "true", description: "Write server-assigned GUIDs back to local files after push (--no-guids to disable)" },
        { name: "include", short: "i", type: "string", required: false, description: "Glob pattern to include (repeatable)" },
        { name: "exclude", short: "e", type: "string", required: false, description: "Glob pattern to exclude (repeatable)" },
        { name: "review", type: "boolean", required: false, description: "After pushing, open sandbox in the browser to review" }
      ],
      examples: [
        "xano sandbox push",
        "xano sandbox push -d ./my-sandbox",
        "xano sandbox push --sync",
        "xano sandbox push --sync --delete",
        "xano sandbox push --dry-run",
        "xano sandbox push --review",
        "xano sandbox push -i 'function/*' -i 'table/*'",
        "xano sandbox push -e 'table/*' --records"
      ]
    },
    {
      name: "sandbox review",
      description: "Open the sandbox in the browser to review and promote changes.",
      usage: "xano sandbox review [options]",
      flags: [
        { name: "url-only", short: "u", type: "boolean", required: false, description: "Print the URL without opening the browser" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox review", "xano sandbox review --url-only"]
    },
    {
      name: "sandbox impersonate",
      description: "Hidden alias for `sandbox review`. Prefer `sandbox review`.",
      usage: "xano sandbox impersonate",
      examples: ["xano sandbox impersonate"]
    },
    {
      name: "sandbox reset",
      description: "Reset the sandbox — clears all workspace data and drafts but keeps the sandbox itself.",
      usage: "xano sandbox reset [--force]",
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" }
      ],
      examples: ["xano sandbox reset", "xano sandbox reset --force"]
    },
    {
      name: "sandbox delete",
      description: "Delete the sandbox entirely. Use `reset` instead if you just want to wipe data.",
      usage: "xano sandbox delete [--force]",
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" }
      ],
      examples: ["xano sandbox delete --force"]
    },
    {
      name: "sandbox env list",
      description: "List environment variable keys for the sandbox.",
      usage: "xano sandbox env list [-o <format>]",
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox env list"]
    },
    {
      name: "sandbox env get",
      description: "Get a single environment variable value.",
      usage: "xano sandbox env get --name <key> [-o <format>]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Environment variable name" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox env get -n API_KEY"]
    },
    {
      name: "sandbox env set",
      description: "Create or update an environment variable.",
      usage: "xano sandbox env set --name <key> --value <val>",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Environment variable name" },
        { name: "value", type: "string", required: true, description: "Environment variable value" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox env set -n API_KEY --value sk-123"]
    },
    {
      name: "sandbox env delete",
      description: "Delete an environment variable.",
      usage: "xano sandbox env delete --name <key> [--force]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Environment variable name" },
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox env delete -n OLD_KEY --force"]
    },
    {
      name: "sandbox env get_all",
      description: "Export all sandbox environment variables to a YAML file (default: ./env.yaml) or stdout with --view.",
      usage: "xano sandbox env get_all [-f <path>] [--view]",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Output file path (default: ./env.yaml)" },
        { name: "view", type: "boolean", required: false, description: "Print to stdout instead of saving to file" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano sandbox env get_all",
        "xano sandbox env get_all -f ./env.yaml",
        "xano sandbox env get_all --view"
      ]
    },
    {
      name: "sandbox env set_all",
      description: "Import environment variables from a YAML file (default: ./env.yaml).",
      usage: "xano sandbox env set_all [-f <path>] [--clean]",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to env file (default: ./env.yaml)" },
        { name: "clean", type: "boolean", required: false, description: "Remove source file after successful upload" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox env set_all -f ./env.yaml"]
    },
    {
      name: "sandbox license get",
      description: "Get the sandbox license (saves to ./license.yaml by default; use --view to print).",
      usage: "xano sandbox license get [-f <path>] [--view]",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Output file path (default: ./license.yaml)" },
        { name: "view", type: "boolean", required: false, description: "Print license to stdout instead of saving" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox license get --view"]
    },
    {
      name: "sandbox license set",
      description: "Set/update the sandbox license from a file or inline value. `--value` is mutually exclusive with `--file` and `--clean`.",
      usage: "xano sandbox license set (-f <path> | --value <license>)",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to license file (default: ./license.yaml). Mutually exclusive with --value." },
        { name: "value", type: "string", required: false, description: "Inline license value. Mutually exclusive with --file and --clean." },
        { name: "clean", type: "boolean", required: false, description: "Remove source file after successful upload. Mutually exclusive with --value." },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox license set -f ./license.yaml", "xano sandbox license set --value 'key: value'"]
    },
    {
      name: "sandbox unit_test list",
      description: "List unit tests in the sandbox.",
      usage: "xano sandbox unit_test list [--branch <b>] [--obj-type <type>]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch" },
        { name: "obj-type", type: "string", required: false, description: "Filter by object type: function, query, or middleware" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox unit_test list"]
    },
    {
      name: "sandbox unit_test run",
      description: "Run a single unit test in the sandbox.",
      usage: "xano sandbox unit_test run <unit_test_id>",
      args: [{ name: "unit_test_id", required: true, description: "ID of the unit test to run" }],
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox unit_test run 42", "xano sandbox unit_test run 42 -o json"]
    },
    {
      name: "sandbox unit_test run_all",
      description: "Run all unit tests in the sandbox.",
      usage: "xano sandbox unit_test run_all [--branch <b>] [--obj-type <type>]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch" },
        { name: "obj-type", type: "string", required: false, description: "Filter by object type: function, query, or middleware" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox unit_test run_all"]
    },
    {
      name: "sandbox workflow_test list",
      description: "List workflow tests in the sandbox.",
      usage: "xano sandbox workflow_test list [--branch <b>]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox workflow_test list"]
    },
    {
      name: "sandbox workflow_test run",
      description: "Run a single workflow test in the sandbox.",
      usage: "xano sandbox workflow_test run <workflow_test_id>",
      args: [{ name: "workflow_test_id", required: true, description: "ID of the workflow test to run (integer)" }],
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox workflow_test run 7", "xano sandbox workflow_test run 7 -o json"]
    },
    {
      name: "sandbox workflow_test run_all",
      description: "Run all workflow tests in the sandbox.",
      usage: "xano sandbox workflow_test run_all [--branch <b>]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano sandbox workflow_test run_all"]
    }
  ],

  workflows: [
    {
      name: "Prototype in Sandbox",
      description: "Iterate on changes in your personal sandbox, then promote to a real workspace",
      steps: [
        "Pull sandbox state: `xano sandbox pull -d ./code`",
        "Edit .xs files locally",
        "Push and review: `xano sandbox push --review`",
        "In the browser, promote changes to a real workspace if desired"
      ],
      example: `xano sandbox pull -d ./code
# ... edit files ...
xano sandbox push --review`
    },
    {
      name: "Reset Sandbox State",
      description: "Wipe sandbox data when starting a new experiment",
      steps: [
        "Reset data: `xano sandbox reset --force`",
        "Re-provision by any command, e.g. `xano sandbox get`",
        "Pull a clean slate or push fresh code"
      ]
    },
    {
      name: "Sandbox Environment Variables",
      description: "Manage per-sandbox configuration",
      steps: [
        "Export current env: `xano sandbox env get_all -f ./env.yaml`",
        "Edit env.yaml locally",
        "Re-import: `xano sandbox env set_all -f ./env.yaml`"
      ]
    }
  ]
};
