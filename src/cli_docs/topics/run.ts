import type { TopicDoc } from "../types.js";

export const runDoc: TopicDoc = {
  topic: "run",
  title: "Xano CLI - Run Commands",
  description: `Run commands let you execute XanoScript code via the Xano Run API. There are two execution modes:

- **Jobs**: One-time execution that returns a result. Use for scripts, data processing, automation.
- **Services**: Long-running processes that expose API endpoints. Use for custom servers and background services.

## Available Commands

| Command | Purpose |
|---------|---------|
| \`run job\` | Execute a XanoScript job and return the result |
| \`run service\` | Start a long-running XanoScript service |

Run \`xano run <command> --help\` for detailed flags and arguments.`,

  ai_hints: `**Two execution modes:**
- \`xano run job -f script.xs\` - execute once, get result
- \`xano run service -f service.xs\` - start long-running service

**Input methods (both commands):**
- \`-f <file>\` - read from XanoScript file (also accepts URLs)
- \`-s, --stdin\` - read from stdin (pipe code in)
- \`-e, --edit\` - open in $EDITOR before running (requires -f)

**Job-specific:**
- \`-a, --args <file>\` - pass input arguments from a JSON file

**Output:** Both support \`-o summary|json\`

**Requires a Run project configured in your profile.** Use \`xano profile wizard\` to set one up.`,

  related_topics: ["profile", "integration"],

  commands: [
    {
      name: "run job",
      description: "Execute a XanoScript job (one-time execution, returns result)",
      usage: "xano run job [-f <file>] [-s] [-e] [-a <args_file>] [-o summary|json] [-p <profile>]",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path or URL to XanoScript file" },
        { name: "stdin", short: "s", type: "boolean", required: false, description: "Read XanoScript from stdin" },
        { name: "edit", short: "e", type: "boolean", required: false, description: "Open in $EDITOR before running (requires -f)" },
        { name: "args", short: "a", type: "string", required: false, description: "Path or URL to JSON file with input arguments" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano run job -f script.xs",
        "xano run job -f script.xs -a args.json",
        "xano run job -f script.xs --edit",
        "cat script.xs | xano run job --stdin",
        "xano run job -f script.xs -o json"
      ]
    },
    {
      name: "run service",
      description: "Start a long-running XanoScript service (exposes endpoints)",
      usage: "xano run service [-f <file>] [-s] [-e] [-o summary|json] [-p <profile>]",
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path or URL to XanoScript file" },
        { name: "stdin", short: "s", type: "boolean", required: false, description: "Read XanoScript from stdin" },
        { name: "edit", short: "e", type: "boolean", required: false, description: "Open in $EDITOR before running (requires -f)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano run service -f service.xs",
        "xano run service -f service.xs --edit",
        "cat service.xs | xano run service --stdin"
      ]
    }
  ],

  workflows: [
    {
      name: "Execute a Script",
      description: "Run a XanoScript job with arguments",
      steps: [
        "Write your job in a .xs file",
        "Execute: `xano run job -f job.xs`",
        "Pass arguments: `xano run job -f job.xs -a args.json`"
      ],
      example: `xano run job -f cleanup.xs
xano run job -f process.xs -a inputs.json -o json`
    }
  ]
};
