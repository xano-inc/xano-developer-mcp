import type { TopicDoc } from "../types.js";

export const debugDoc: TopicDoc = {
  topic: "debug",
  title: "Multidoc Debug Runs",
  description: `Debug endpoints execute a single object (query, function, task, etc.) from a XanoScript multidoc in a throwaway, isolated environment, and let you retrieve the full execution stack afterwards.

## Key Concepts
- A multidoc (the same payload \`workspace push\` sends) is posted to the debug endpoint along with the name and type of the object to run.
- The backend imports the multidoc into a temporary, isolated database schema, runs the named object, stores the full debugger stack under a uuid \`debug_id\`, and tears the environment down.
- The POST returns a compact envelope immediately: \`{debug_id, status, result | exception, timing}\`. The full per-statement stack is fetched later via GET by \`debug_id\`.
- Only the database is isolated — the debugged code performs REAL external side effects (HTTP calls, emails, external DB writes).

## Access & retention
- Requires the workspace \`allow_push\` preference (the same gate as multidoc push); there is no force bypass.
- Stored results expire after ~7 days and are also bounded per workspace. Fetching an expired, unknown, or other-workspace \`debug_id\` returns an identical "not found" response (no cross-workspace existence oracle).

## Environment variables
- The debug workspace is built solely from the posted multidoc, so \`$env\` reads resolve only if env documents are included in the multidoc. Env-derived values are masked in the persisted stack.`,

  ai_hints: `- POST returns the compact envelope; always read \`status\` first: \`ok\` carries \`result\`, \`exception\` carries \`exception\`. If persistence failed, \`debug_id\` is null and a \`warning\` is present (the run still executed).
- Pass a caller-generated \`debug_id\` (uuid) to make a long run recoverable after a proxy timeout — reusing an existing id is rejected before any code runs, so retries never double-execute side effects.
- The GET response can be large (full stack + value_store). Prefer writing it to a file over holding it in context.
- \`{{too_large}}\` markers mean a value exceeded the 1MB capture cap — re-run with \`bypass_size_limit: true\` to capture it (it is not re-fetchable). A \`truncated: true\` field means the stored payload exceeded the storage cap and the largest values were dropped.
- \`entry_obj_verb\` disambiguates same-named \`query\` objects (e.g. \`GET /users\` vs \`POST /users\`); an ambiguous match without it is rejected.
- The CLI (\`xano debug run\` / \`xano debug get\`) and the MCP tools (\`xano_debug_run\` / \`xano_get_debug_result\`) are thin wrappers over these two endpoints.`,

  related_topics: ["function", "workspace", "history"],

  endpoints: [
    {
      method: "POST",
      path: "/workspace/{workspace_id}/multidoc/debug",
      description:
        "Execute one named object from a XanoScript multidoc in an isolated environment. The multidoc is the raw request body (Content-Type: text/x-xanoscript); the object to run and its inputs are supplied as query parameters. Requires the workspace allow_push preference. Returns a compact envelope; the full stack is stored under debug_id for later retrieval.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "entry_obj_type", type: "string", required: true, in: "query", enum: ["action", "addon", "function", "middleware", "query", "task", "tool", "trigger", "workflow_test"], description: "Type of the object to run" },
        { name: "entry_obj_name", type: "string", required: true, in: "query", description: "Name of the object to run (e.g. calcScore, /users)" },
        { name: "entry_obj_verb", type: "string", in: "query", description: "HTTP verb disambiguator for same-named query objects (e.g. GET, POST)" },
        { name: "input", type: "json", in: "query", default: "{}", description: "JSON object of inputs passed to the object" },
        { name: "debug_id", type: "string", in: "query", description: "Optional caller-supplied uuid for the result row; enables timeout recovery and idempotent retries. Reusing an existing id is rejected before execution." },
        { name: "bypass_size_limit", type: "boolean", in: "query", default: false, description: "Capture values larger than 1MB in the stack (inflates the stored payload)" }
      ],
      request_body: {
        type: "text/x-xanoscript",
        description: "The XanoScript multidoc: one or more documents separated by `---`, as produced by workspace pull / push.",
        example: "query calcScore verb=GET {\n  input { text email }\n  stack { ... }\n  response = ...\n}\n---\ntable users { ... }"
      },
      response: {
        type: "application/json",
        description: "Compact debug envelope. `result` is present on status ok; `exception` on status exception/error; `warning` and a null `debug_id` if the run succeeded but persistence failed.",
        properties: {
          debug_id: "uuid of the stored result (null if persistence failed)",
          status: "ok | exception | error | throwerror | debug",
          timing: "execution time in seconds",
          result: "de-hashed return value (status ok / non-exception statuses)",
          exception: "exception object (status exception / error)",
          warning: "present only if the run succeeded but the result could not be stored"
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/multidoc/debug?entry_obj_type=function&entry_obj_name=calcScore&input=%7B%22email%22%3A%22jo%40x.com%22%7D",
        headers: { "Content-Type": "text/x-xanoscript" },
        body: "function calcScore {\n  input { text email }\n  stack { ... }\n  response = ...\n}"
      }
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/multidoc/debug/{debug_id}",
      description:
        "Fetch the full stored debugger payload (per-statement stack, value_store, timing, exception) for a prior debug run. Expired, unknown, and other-workspace ids all return an identical not-found error.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "debug_id", type: "string", required: true, in: "path", description: "The uuid returned by the debug POST" }
      ],
      response: {
        type: "application/json",
        description: "The full stored debug result. Can be large — writing it to a file is recommended.",
        properties: {
          debug_id: "uuid of the result",
          status: "ok | exception | error | throwerror | debug",
          timing: "execution time in seconds",
          entry_obj_type: "type of the object that was run",
          entry_obj_name: "name of the object that was run",
          entry_obj_verb: "verb, when supplied",
          stack: "array of per-statement entries (title, timing, variables by hash)",
          value_store: "hash -> value map that the stack references (env values masked)",
          result: "de-hashed thrown/stop data for non-ok/non-exception statuses",
          exception: "exception object, when present",
          maxed: "true if the stack hit the capture limit",
          truncated: "true if the stored payload was reduced to fit the storage cap",
          created_at: "when the run was stored",
          expires_at: "when the stored result expires (~7 days after creation)"
        }
      },
      example: {
        method: "GET",
        path: "/workspace/1/multidoc/debug/018f3a2b-1c4d-7e8f-9a0b-1c2d3e4f5a6b"
      }
    }
  ],

  patterns: [
    {
      name: "Run then fetch the full stack",
      description: "Execute an object and pull its complete execution trace",
      steps: [
        "POST the multidoc with entry_obj_type + entry_obj_name (+ input) — read `debug_id` and `status` from the envelope",
        "GET /workspace/{workspace_id}/multidoc/debug/{debug_id} to retrieve the full stack + value_store"
      ]
    },
    {
      name: "Timeout-safe run",
      description: "Survive a lost response on a long run",
      steps: [
        "Generate a uuid and pass it as `debug_id` on the POST",
        "If the POST response is lost, GET by that same `debug_id` to recover the stored result — the run is never re-executed"
      ]
    }
  ]
};
