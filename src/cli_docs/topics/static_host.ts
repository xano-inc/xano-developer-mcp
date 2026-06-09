import type { TopicDoc } from "../types.js";

export const staticHostDoc: TopicDoc = {
  topic: "static_host",
  title: "Xano CLI - Static Hosting",
  description: `Static host commands let you create and manage static hosts, push frontend builds, and deploy them to dev/prod environments on Xano's static hosting infrastructure.

## Concepts

- **Static host**: A named hosting target in a workspace. Each host has a **dev** and a **prod** environment, each with its own URL.
- **Build**: An uploaded snapshot of your site (a directory or zip). Builds are created with \`build push\` and deployed to an environment with \`deploy\`.
- **Git config**: A host can optionally be linked to a git repository (\`edit --git-repo\` plus SSH keys).
- **v1 vs v2 hosting**: v2 is instance-managed hosting. Older v1 hosts can be moved with \`static_host migrate\`.`,

  ai_hints: `**Static hosting workflow:**
1. Create a host once: \`xano static_host create my-app\`
2. Build your frontend (React, Vue, etc.)
3. Push the build output directory: \`xano static_host build push my-app -d ./dist -n "v1.0.0"\`
4. Deploy it: \`xano static_host deploy my-app --build_id <id> --env dev\` (then \`--env prod\`)

**Prefer \`build push\` over \`build create\`:** \`build create\` is deprecated and hidden — \`build push -f <file>\` covers the zip-upload case, and \`build push -d <dir>\` (or no flag for the current directory) zips and uploads a directory for you. The build name is optional (auto-generated from the timestamp). For package.json builds, push waits for the build to finish unless \`--no-wait\`.

**build get/delete/deploy take \`--build_id\` as a flag**, not a positional argument (older CLI versions used positionals).

**\`build pull\` source selection:** defaults to the original uploaded source (including package.json); use \`--source built\` for the compiled/served output. Select the build by \`--build_id\`, \`--latest\`, or \`--env dev|prod\` (the build currently deployed there).

**Destructive:** \`build delete\` is permanent and prompts for confirmation; its \`--force\` flag is marked [CRITICAL] — never run it without explicit user confirmation.

**Use cases:**
- Deploy SPAs built with modern frameworks
- Host static documentation sites
- Serve frontend that calls your Xano APIs

**Sandbox tip:** If the user doesn't have a dedicated tenant, suggest \`xano sandbox\` - the free-tier personal dev environment supports static hosting for experimentation.`,

  related_topics: ["workspace", "tenant", "sandbox"],

  commands: [
    {
      name: "static_host list",
      description: "List all static hosts in a workspace",
      usage: "xano static_host list [-w <workspace>]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "page", type: "integer", required: false, default: "1", description: "Page number for pagination" },
        { name: "per_page", type: "integer", required: false, default: "50", description: "Results per page" }
      ],
      examples: [
        "xano static_host list",
        "xano static_host list -w 40",
        "xano static_host list -o json"
      ]
    },
    {
      name: "static_host create",
      description: "Create a new static host in the workspace",
      usage: "xano static_host create <name> [options]",
      args: [
        { name: "name", required: true, description: "Name for the new static host" }
      ],
      flags: [
        { name: "description", type: "string", required: false, description: "Description for the static host" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host create marketing",
        "xano static_host create marketing --description 'Marketing site' -w 40"
      ]
    },
    {
      name: "static_host get",
      description: "Get a single static host's details (name, git config, dev/prod environments and URLs)",
      usage: "xano static_host get <static_host> [options]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host get my-app",
        "xano static_host get my-app -w 40 -o json"
      ]
    },
    {
      name: "static_host edit",
      description: "Update a static host's name, description, or git configuration. Renaming changes the deployed hostname.",
      usage: "xano static_host edit <static_host> [options]",
      args: [
        { name: "static_host", required: true, description: "Static host name to edit" }
      ],
      flags: [
        { name: "name", type: "string", required: false, description: "New name for the static host (renaming changes the deployed hostname)" },
        { name: "description", type: "string", required: false, description: "New description for the static host" },
        { name: "git-repo", type: "string", required: false, description: "Git repository URL (e.g. git@github.com:org/repo.git)" },
        { name: "git-public-key", type: "string", required: false, description: "Git SSH public key" },
        { name: "git-private-key-file", type: "string", required: false, description: "Path to a file containing the git SSH private key (read from disk; never passed on the command line)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host edit my-app --description 'Marketing site'",
        "xano static_host edit my-app --name my-app-v2",
        "xano static_host edit my-app --git-repo git@github.com:me/site.git --git-private-key-file ./deploy_key"
      ]
    },
    {
      name: "static_host build push",
      description: "Push a directory or zip file as a new static host build. Defaults to the current directory; the build name is auto-generated from the timestamp if omitted. For package.json builds, waits for the build to finish unless --no-wait.",
      usage: "xano static_host build push <static_host> [options]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "directory", short: "d", type: "string", required: false, description: "Directory to push (defaults to current directory). Mutually exclusive with --file." },
        { name: "file", short: "f", type: "string", required: false, description: "Path to a zip file to upload (alternative to -d). Mutually exclusive with --directory." },
        { name: "name", short: "n", type: "string", required: false, description: "Build name (auto-generated from the current timestamp if omitted)" },
        { name: "description", type: "string", required: false, description: "Build description" },
        { name: "no-wait", type: "boolean", required: false, description: "Return immediately after upload instead of waiting for the build to finish" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build push my-app -d ./dist -n 'v1.0.0'",
        "xano static_host build push my-app  # current dir, auto-named",
        "xano static_host build push my-app -f ./build.zip -n 'v1.0.0'",
        "xano static_host build push my-app -n 'release' --description 'Production build'"
      ]
    },
    {
      name: "static_host build pull",
      description: "Pull a static host build to disk. Defaults to the original uploaded source (including package.json); use --source built for the compiled/served output. Select the build by --build_id, --latest, or --env (mutually exclusive).",
      usage: "xano static_host build pull <static_host> (--build_id <id> | --latest | --env <dev|prod>) [options]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "build_id", type: "string", required: false, description: "Build ID to pull. Mutually exclusive with --latest and --env." },
        { name: "latest", type: "boolean", required: false, description: "Pull the latest build. Mutually exclusive with --build_id and --env." },
        { name: "env", type: "string", required: false, description: "Pull the build currently deployed to this environment (dev or prod). Mutually exclusive with --build_id and --latest." },
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Output directory for pulled files (defaults to current directory)" },
        { name: "source", type: "string", required: false, default: "original", description: "Which files to pull: 'original' (the uploaded source, including package.json) or 'built' (the compiled/served output)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" }
      ],
      examples: [
        "xano static_host build pull my-app --build_id 52",
        "xano static_host build pull my-app --build_id 52 --source built",
        "xano static_host build pull my-app --latest",
        "xano static_host build pull my-app --env dev",
        "xano static_host build pull my-app --env prod -d ./prod-release"
      ]
    },
    {
      name: "static_host build list",
      description: "List all builds for a static host",
      usage: "xano static_host build list <static_host> [-w <workspace>]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "page", type: "integer", required: false, default: "1", description: "Page number for pagination" },
        { name: "per_page", type: "integer", required: false, default: "50", description: "Results per page" }
      ],
      examples: [
        "xano static_host build list my-app",
        "xano static_host build list my-app -o json"
      ]
    },
    {
      name: "static_host build get",
      description: "Get details of a specific build for a static host. The build is selected with the --build_id flag (not a positional argument).",
      usage: "xano static_host build get <static_host> --build_id <id>",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "build_id", type: "string", required: true, description: "Build ID" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build get my-app --build_id 52",
        "xano static_host build get my-app --build_id 52 -o json"
      ]
    },
    {
      name: "static_host build delete",
      description: "Delete a static host build permanently. This action cannot be undone. Prompts for confirmation unless --force.",
      usage: "xano static_host build delete <static_host> --build_id <id> [--force]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "build_id", type: "string", required: true, description: "Build ID to delete" },
        { name: "force", short: "f", type: "boolean", required: false, description: "[CRITICAL] NEVER run without explicit user confirmation. Skips the confirmation prompt." },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build delete my-app --build_id 52",
        "xano static_host build delete my-app --build_id 52 --force"
      ]
    },
    {
      name: "static_host deploy",
      description: "Deploy a static host build to an environment (dev or prod). Prints the deployed URL.",
      usage: "xano static_host deploy <static_host> --build_id <id> --env <dev|prod>",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "build_id", type: "string", required: true, description: "Build ID to deploy" },
        { name: "env", type: "string", required: true, description: "Target environment: dev or prod" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host deploy my-app --build_id 52 --env dev",
        "xano static_host deploy my-app --build_id 52 --env prod",
        "xano static_host deploy my-app --build_id 52 --env prod -o json"
      ]
    },
    {
      name: "static_host migrate",
      description: "Migrate a static host to instance-managed (v2) hosting. Reparents the Ingress, verifies it, clears master, and marks the host v2. Migrates both environments unless --env is given.",
      usage: "xano static_host migrate [static_host] [--all] [--env <dev|prod>] [--dry-run]",
      args: [
        { name: "static_host", required: false, description: "Static host name to migrate (omit when using --all)" }
      ],
      flags: [
        { name: "all", type: "boolean", required: false, description: "Migrate every host still on v1 in the workspace" },
        { name: "dry-run", type: "boolean", required: false, description: "List the hosts that would be migrated without changing anything" },
        { name: "env", type: "string", required: false, description: "Which environment to migrate: dev or prod (migrates both if omitted)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host migrate my-app",
        "xano static_host migrate my-app --env dev",
        "xano static_host migrate --all --dry-run",
        "xano static_host migrate --all"
      ]
    },
    {
      name: "static_host build create",
      description: "[Deprecated: use 'static_host build push -f <file>' instead] Create a new build from a zip file. Hidden from CLI help.",
      usage: "xano static_host build create <static_host> -f <file> [options]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Path to ZIP file to upload" },
        { name: "name", short: "n", type: "string", required: false, description: "Build name (auto-generated from the current timestamp if omitted)" },
        { name: "description", short: "d", type: "string", required: false, description: "Build description" },
        { name: "no-wait", type: "boolean", required: false, description: "Return immediately after upload instead of waiting for the build to finish" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build push my-app -f ./build.zip -n 'v1.0.0'  # preferred replacement"
      ]
    }
  ],

  workflows: [
    {
      name: "Deploy Frontend",
      description: "Build, push, and deploy a frontend application",
      steps: [
        "Create the host once: `xano static_host create my-app`",
        "Build your app: `npm run build`",
        "Push the build output: `xano static_host build push my-app -d ./dist -n 'v1.0.0'`",
        "Deploy to dev: `xano static_host deploy my-app --build_id <id> --env dev`",
        "Verify, then deploy to prod: `xano static_host deploy my-app --build_id <id> --env prod`"
      ],
      example: `xano static_host create my-frontend
npm run build
xano static_host build push my-frontend -d ./dist -n 'v1.0.0'
xano static_host deploy my-frontend --build_id 52 --env dev
xano static_host deploy my-frontend --build_id 52 --env prod`
    },
    {
      name: "Roll Back a Deployment",
      description: "Deploy a previous build to an environment",
      steps: [
        "List builds: `xano static_host build list my-app`",
        "Deploy the previous build ID: `xano static_host deploy my-app --build_id <old_id> --env prod`"
      ]
    },
    {
      name: "Recover Build Source",
      description: "Pull the source of a deployed build back to disk",
      steps: [
        "Pull what's live in prod: `xano static_host build pull my-app --env prod -d ./recovered`",
        "Or pull the compiled output: `xano static_host build pull my-app --env prod --source built -d ./recovered`"
      ]
    }
  ]
};
