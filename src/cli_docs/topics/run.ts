import type { TopicDoc } from "../types.js";

export const runDoc: TopicDoc = {
  topic: "run",
  title: "Xano CLI - Run API Commands",
  description: `Run commands let you execute XanoScript code, manage Run projects, sessions, environment variables, and secrets. The Run API enables serverless execution of XanoScript.

## Run API Base URL

\`https://app.dev.xano.com/api:run\`

This is different from your instance URL used by the Meta API.`,

  ai_hints: `**Run vs Meta API:**
- Run API: Execute code, manage runtime environment
- Meta API: Manage workspace resources (tables, APIs, functions)

**Project context:**
- Most run commands require a project
- Set project in profile or use \`-j\` flag
- Projects isolate execution environments

**Execution modes:**
- Jobs: One-time execution, returns result
- Services: Long-running, exposes endpoints

**Environment variables:**
- Stored per-project in Run API
- Override at runtime with \`--env KEY=value\``,

  related_topics: ["profile", "integration"],

  commands: [
    {
      name: "run:exec",
      description: "Execute XanoScript code",
      usage: "xano run:exec [path] [options]",
      args: [
        { name: "path", required: false, description: "Path to .xs file, directory, or URL" }
      ],
      flags: [
        { name: "project", short: "j", type: "string", required: false, description: "Run project ID" },
        { name: "args", short: "a", type: "string", required: false, description: "JSON file with input arguments" },
        { name: "env", type: "string", required: false, description: "Environment override KEY=value (repeatable)" },
        { name: "stdin", type: "boolean", required: false, description: "Read code from stdin" },
        { name: "edit", type: "boolean", required: false, description: "Open in $EDITOR before execution" }
      ],
      examples: [
        "xano run:exec ./job.xs",
        "xano run:exec ./job.xs -a inputs.json",
        "xano run:exec ./job.xs --env API_KEY=secret --env DEBUG=true",
        "echo 'var:x = 1 + 1' | xano run:exec --stdin",
        "xano run:exec ./scripts/  # executes all .xs files as multidoc"
      ]
    },
    {
      name: "run:info",
      description: "Analyze XanoScript without executing",
      usage: "xano run:info [path] [options]",
      args: [
        { name: "path", required: false, description: "Path to .xs file" }
      ],
      flags: [
        { name: "stdin", type: "boolean", required: false, description: "Read from stdin" }
      ],
      examples: [
        "xano run:info ./job.xs",
        "cat script.xs | xano run:info --stdin"
      ]
    },
    {
      name: "run:projects:list",
      description: "List all Run projects",
      usage: "xano run:projects:list",
      examples: ["xano run:projects:list"]
    },
    {
      name: "run:projects:create",
      description: "Create a new Run project",
      usage: "xano run:projects:create [options]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Project name" },
        { name: "description", short: "d", type: "string", required: false, description: "Project description" }
      ],
      examples: ["xano run:projects:create -n 'My Project' -d 'Production jobs'"]
    },
    {
      name: "run:projects:update",
      description: "Update a Run project",
      usage: "xano run:projects:update <project_id> [options]",
      args: [
        { name: "project_id", required: true, description: "Project ID to update" }
      ],
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "New project name" },
        { name: "description", short: "d", type: "string", required: false, description: "New description" }
      ],
      examples: ["xano run:projects:update abc123 -n 'Updated Name'"]
    },
    {
      name: "run:projects:delete",
      description: "Delete a Run project",
      usage: "xano run:projects:delete <project_id> [--force]",
      args: [
        { name: "project_id", required: true, description: "Project ID to delete" }
      ],
      flags: [
        { name: "force", type: "boolean", required: false, description: "Skip confirmation" }
      ],
      examples: ["xano run:projects:delete abc123 --force"]
    },
    {
      name: "run:env:list",
      description: "List environment variables for project",
      usage: "xano run:env:list [-j <project>]",
      examples: ["xano run:env:list"]
    },
    {
      name: "run:env:set",
      description: "Set an environment variable",
      usage: "xano run:env:set <name> <value> [-j <project>]",
      args: [
        { name: "name", required: true, description: "Variable name" },
        { name: "value", required: true, description: "Variable value" }
      ],
      examples: ["xano run:env:set API_KEY sk-123456"]
    },
    {
      name: "run:env:get",
      description: "Get an environment variable value",
      usage: "xano run:env:get <name> [-j <project>]",
      args: [
        { name: "name", required: true, description: "Variable name" }
      ],
      examples: ["xano run:env:get API_KEY"]
    },
    {
      name: "run:env:delete",
      description: "Delete an environment variable",
      usage: "xano run:env:delete <name> [-j <project>]",
      args: [
        { name: "name", required: true, description: "Variable name" }
      ],
      examples: ["xano run:env:delete OLD_KEY"]
    },
    {
      name: "run:sessions:list",
      description: "List execution sessions",
      usage: "xano run:sessions:list [-j <project>]",
      examples: ["xano run:sessions:list"]
    },
    {
      name: "run:sessions:get",
      description: "Get session details",
      usage: "xano run:sessions:get <session_id>",
      args: [
        { name: "session_id", required: true, description: "Session ID" }
      ],
      examples: ["xano run:sessions:get sess_abc123"]
    },
    {
      name: "run:sessions:start",
      description: "Start a session",
      usage: "xano run:sessions:start <session_id>",
      args: [
        { name: "session_id", required: true, description: "Session ID" }
      ],
      examples: ["xano run:sessions:start sess_abc123"]
    },
    {
      name: "run:sessions:stop",
      description: "Stop a session",
      usage: "xano run:sessions:stop <session_id>",
      args: [
        { name: "session_id", required: true, description: "Session ID" }
      ],
      examples: ["xano run:sessions:stop sess_abc123"]
    },
    {
      name: "run:sessions:delete",
      description: "Delete a session",
      usage: "xano run:sessions:delete <session_id>",
      args: [
        { name: "session_id", required: true, description: "Session ID" }
      ],
      examples: ["xano run:sessions:delete sess_abc123"]
    },
    {
      name: "run:secrets:list",
      description: "List secrets",
      usage: "xano run:secrets:list [-j <project>]",
      examples: ["xano run:secrets:list"]
    },
    {
      name: "run:secrets:set",
      description: "Set a secret (docker registry or service account)",
      usage: "xano run:secrets:set <name> [options]",
      args: [
        { name: "name", required: true, description: "Secret name" }
      ],
      flags: [
        { name: "type", short: "t", type: "string", required: true, description: "Secret type: dockerconfigjson, service-account-token" }
      ],
      examples: ["xano run:secrets:set docker-creds -t dockerconfigjson"]
    },
    {
      name: "run:secrets:get",
      description: "Get a secret",
      usage: "xano run:secrets:get <name>",
      args: [
        { name: "name", required: true, description: "Secret name" }
      ],
      examples: ["xano run:secrets:get docker-creds"]
    },
    {
      name: "run:secrets:delete",
      description: "Delete a secret",
      usage: "xano run:secrets:delete <name>",
      args: [
        { name: "name", required: true, description: "Secret name" }
      ],
      examples: ["xano run:secrets:delete old-secret"]
    }
  ],

  workflows: [
    {
      name: "Execute a Job",
      description: "Run XanoScript code and get results",
      steps: [
        "Write your job in a .xs file",
        "Execute: `xano run:exec ./job.xs`",
        "View timing and response in output"
      ],
      example: `# job.xs
job: my_job
---
var:result = 1 + 1
return = var:result

# Execute
xano run:exec ./job.xs`
    },
    {
      name: "Configure Environment",
      description: "Set up environment variables for a project",
      steps: [
        "List existing: `xano run:env:list`",
        "Set variables: `xano run:env:set KEY value`",
        "Execute with overrides: `xano run:exec job.xs --env KEY=override`"
      ]
    }
  ]
};
