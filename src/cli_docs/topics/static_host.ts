import type { TopicDoc } from "../types.js";

export const staticHostDoc: TopicDoc = {
  topic: "static_host",
  title: "Xano CLI - Static Hosting",
  description: `Static host commands let you manage and deploy frontend builds to Xano's static hosting infrastructure.

## Available Commands

| Command | Purpose |
|---------|---------|
| \`static_host list\` | List all static hosts in workspace |
| \`static_host build create\` | Upload a new build |
| \`static_host build list\` | List builds for a static host |
| \`static_host build get\` | Get build details |

Run \`xano static_host <command> --help\` for detailed flags and arguments.`,

  ai_hints: `**Static hosting workflow:**
1. Build your frontend (React, Vue, etc.)
2. Zip the build output
3. Upload with \`xano static_host build create\`

**Use cases:**
- Deploy SPAs built with modern frameworks
- Host static documentation sites
- Serve frontend that calls your Xano APIs`,

  related_topics: ["workspace"],

  commands: [
    {
      name: "static_host list",
      description: "List all static hosts in workspace",
      usage: "xano static_host list [-w <workspace>] [-o summary|json]",
      examples: ["xano static_host list"]
    },
    {
      name: "static_host build create",
      description: "Create a new build for a static host by uploading a ZIP file",
      usage: "xano static_host build create <static_host> -f <zip_file> -n <name> [-d <description>] [-w <workspace>] [-o summary|json]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Path to ZIP file" },
        { name: "name", short: "n", type: "string", required: true, description: "Build name/version" },
        { name: "description", short: "d", type: "string", required: false, description: "Build description" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build create default -f ./build.zip -n 'v1.0.0'",
        "xano static_host build create default -f ./dist.zip -n 'v1.1.0' -d 'Bug fixes'"
      ]
    },
    {
      name: "static_host build list",
      description: "List all builds for a static host",
      usage: "xano static_host build list <static_host> [-w <workspace>] [-o summary|json] [--page <n>] [--per_page <n>]",
      args: [
        { name: "static_host", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "page", type: "number", required: false, default: "1", description: "Page number" },
        { name: "per_page", type: "number", required: false, default: "50", description: "Results per page" }
      ],
      examples: ["xano static_host build list default"]
    },
    {
      name: "static_host build get",
      description: "Get details of a specific build. Note: argument order is BUILD_ID then STATIC_HOST.",
      usage: "xano static_host build get <build_id> <static_host> [-w <workspace>] [-o summary|json]",
      args: [
        { name: "build_id", required: true, description: "Build ID" },
        { name: "static_host", required: true, description: "Static host name" }
      ],
      examples: [
        "xano static_host build get 52 default",
        "xano static_host build get 52 default -o json"
      ]
    }
  ],

  workflows: [
    {
      name: "Deploy Frontend",
      description: "Build and deploy a frontend application",
      steps: [
        "Build your app: `npm run build`",
        "Create ZIP: `zip -r build.zip dist/`",
        "Deploy: `xano static_host build create default -f build.zip -n 'v1.0.0'`"
      ],
      example: `npm run build
zip -r build.zip dist/
xano static_host build create default -f build.zip -n 'v1.0.0' -d 'Initial release'`
    }
  ]
};
