import type { TopicDoc } from "../types.js";

export const debugDoc: TopicDoc = {
  topic: "debug",
  title: "Xano CLI - Debug Runs",
  description: `Debug commands run a single object (query, function, task, etc.) from your local XanoScript workspace in a throwaway, isolated environment, and let you inspect the full execution stack afterwards.

\`xano debug run\` builds a multidoc from your local \`.xs\` files — the same payload \`xano workspace push\` sends — uploads it, and executes one named object with the inputs you provide. Nothing in your real workspace is touched: the backend imports the multidoc into a temporary isolated database schema, runs the object, stores the full debugger stack under a \`debug_id\`, and tears the environment down. You get a compact result back immediately, then pull the full stack trace later with \`xano debug get <debug_id>\`.

## Syntax note

Xano CLI commands are SPACE-separated (e.g. \`xano debug run\`), not colon-separated.`,

  ai_hints: `**When to use debug:**
- Use \`debug run\` to execute one object against a candidate version of your local code without pushing it live — ideal for iterating on a function/query and seeing exactly what happened.
- Use \`debug get\` to fetch the full per-statement stack (variables, timing, exceptions) for a prior run by its \`debug_id\`.
- For running an object that is already deployed live, prefer \`function run\` — \`debug run\` is for the local-multidoc, isolated-execution workflow.

**Isolation caveat — only the database is isolated:**
- The debugged code performs REAL external side effects: HTTP calls, emails, and writes to external databases actually happen. Only Postgres state is sandboxed.

**Environment variables:**
- The debug workspace is built solely from your local multidoc, so \`$env\` reads return nothing unless env docs are included. The CLI folds local env-bearing workspace documents in by default (a notice is printed); use \`--no-env\` to omit them.

**Access gate:**
- Debug runs require the workspace \`allow_push\` preference to be enabled (the same gate as \`workspace push\`). A locked-down workspace rejects the run.

**Exit codes (scripting):**
- \`0\` — run completed with status \`ok\`
- \`1\` — run completed but the object raised an exception (the exception is printed)
- \`2\` — usage or HTTP error (bad flags, auth failure, multidoc parse error, object not found, push disabled)

**Timeout recovery:**
- Long runs can outlive a proxy timeout and lose the response. Pass \`--debug-id <uuid>\` to pre-assign the id; if the connection drops you can still recover the result with \`xano debug get <that-uuid>\`.

**Result retention & size:**
- Stored debug results expire after ~7 days. Fetching an expired, unknown, or other-workspace id returns the same "not found" message.
- \`{{too_large}}\` markers in a fetched stack mean a captured value exceeded the 1MB cap — re-run with \`--bypass-size-limit\` to capture it (it is not re-fetchable). A \`truncated\` flag means the stored payload exceeded the storage cap and the largest values were dropped.
- \`xano debug get --out <file>\` writes the payload with \`0600\` permissions because it can contain resolved values (including secrets).`,

  related_topics: ["function", "workspace", "sandbox"],

  commands: [
    {
      name: "debug run",
      description:
        "Build a multidoc from local .xs files and execute one named object in an isolated environment. Returns a compact {debug_id, status, result|exception, timing} envelope; fetch the full stack later with `xano debug get`.",
      usage: "xano debug run --type <type> --name <name> [options]",
      flags: [
        { name: "type", short: "t", type: "string", required: true, description: "Type of the entry object to run: action, addon, function, middleware, query, task, tool, trigger, or workflow_test" },
        { name: "name", short: "n", type: "string", required: true, description: "Name of the entry object to run (e.g. calcScore, /users)" },
        { name: "verb", type: "string", required: false, description: "HTTP verb disambiguator for query entries with the same name (e.g. GET, POST)" },
        { name: "data", short: "d", type: "string", required: false, description: "Input field as key=value (string), key:=json (raw JSON), or key@file (file contents). Repeatable." },
        { name: "json", type: "string", required: false, description: "Input as a JSON object: inline, @file.json, or '-' for stdin" },
        { name: "stdin", short: "s", type: "boolean", required: false, default: "false", description: "Read the input JSON object from stdin (same as --json -)" },
        { name: "dir", type: "string", required: false, default: ".", description: "Directory containing the local .xs workspace files" },
        { name: "include", short: "i", type: "string", required: false, description: "Glob of files to include when building the multidoc (repeatable)" },
        { name: "exclude", short: "e", type: "string", required: false, description: "Glob of files to exclude when building the multidoc (repeatable)" },
        { name: "env", type: "boolean", required: false, default: "true", description: "Include local env-bearing workspace documents so $env resolves (use --no-env to omit)" },
        { name: "bypass-size-limit", type: "boolean", required: false, default: "false", description: "Capture values larger than 1MB in the stack (inflates the stored payload)" },
        { name: "debug-id", type: "string", required: false, description: "Pre-assign the run's uuid so the result is recoverable if the response is lost to a timeout" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "branch", type: "string", required: false, description: "Branch to run from (defaults to profile branch, then live)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano debug run --type function --name calcScore",
        "xano debug run --type function --name calcScore --data email=jo@x.com --data age:=30 --data active:=true",
        "xano debug run --type function --name calcScore --json @payload.json --data env=staging",
        "xano debug run --type query --name /users --verb GET -o json | jq .result",
        "echo '{\"email\":\"jo@x.com\"}' | xano debug run --type function --name calcScore --stdin",
        "xano debug run --type function --name bigReport --bypass-size-limit --debug-id 018f3a2b-1c4d-7e8f-9a0b-1c2d3e4f5a6b"
      ]
    },
    {
      name: "debug get",
      description:
        "Fetch the full stored debugger stack (per-statement variables, timing, exceptions) for a prior debug run by its debug_id.",
      usage: "xano debug get <debug_id> [options]",
      args: [
        { name: "debug_id", required: true, description: "Debug id returned by `xano debug run` (uuid)" }
      ],
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary (status/timing/statement count/exception headline) or json (full payload)" },
        { name: "out", type: "string", required: false, description: "Write the full payload JSON to this file (mode 0600 — may contain sensitive resolved values)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano debug get 018f3a2b-1c4d-7e8f-9a0b-1c2d3e4f5a6b",
        "xano debug get 018f3a2b-1c4d-7e8f-9a0b-1c2d3e4f5a6b -o json | jq '.stack'",
        "xano debug get 018f3a2b-1c4d-7e8f-9a0b-1c2d3e4f5a6b --out stack.json"
      ]
    }
  ],

  workflows: [
    {
      name: "Debug a function against local code",
      description: "Run a function from your working copy in isolation and inspect the full stack, without pushing anything live",
      steps: [
        "Edit your .xs files locally",
        "Run it: `xano debug run --type function --name calcScore --data email=jo@x.com`",
        "Note the `debug_id` in the output",
        "Inspect the full stack: `xano debug get <debug_id> -o json`"
      ],
      example: `xano debug run --type function --name calcScore --data email=jo@x.com --data age:=30
# -> { debug_id: "018f3a2b-...", status: "ok", result: 87, timing: 0.04 }
xano debug get 018f3a2b-... --out stack.json`
    },
    {
      name: "Recover a result after a timeout",
      description: "Pre-assign a debug_id so a long run's result survives a lost HTTP response",
      steps: [
        "Generate a uuid and pass it: `xano debug run --type task --name nightlyReport --debug-id <uuid>`",
        "If the connection drops before the envelope returns, fetch by that id: `xano debug get <uuid>`"
      ]
    }
  ]
};
