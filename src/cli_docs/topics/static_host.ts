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
| \`static_host build delete\` | Delete a build |
| \`static_host build env\` | Manage build environment variables |

Run \`xano static_host <command> --help\` for detailed flags and arguments.`,

  ai_hints: `**Static hosting workflow:**
1. Build your frontend (React, Vue, etc.)
2. Zip the build output
3. Upload with \`xano static_host build create\`

**Use cases:**
- Deploy SPAs built with modern frameworks
- Host static documentation sites
- Serve frontend that calls your Xano APIs`,

  related_topics: ["workspace", "resources"],

  commands: [
    {
      name: "static_host list",
      description: "List all static hosts in workspace",
      usage: "xano static_host list [-w <workspace>] [-o summary|json]",
      examples: ["xano static_host list"]
    },
    {
      name: "static_host build create",
      description: "Create a new build for a static host",
      usage: "xano static_host build create <static_host> -f <zip_file> -n <name> [-d <description>] [-w <workspace>]",
      args: [
        { name: "static_host", required: true, description: "Static host name or ID" }
      ],
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Path to ZIP file" },
        { name: "name", short: "n", type: "string", required: true, description: "Build name/version" },
        { name: "description", short: "d", type: "string", required: false, description: "Build description" }
      ],
      examples: [
        "xano static_host build create my-app -f ./build.zip -n 'v1.0.0'",
        "xano static_host build create my-app -f ./dist.zip -n 'v1.1.0' -d 'Bug fixes'"
      ]
    },
    {
      name: "static_host build list",
      description: "List all builds for a static host",
      usage: "xano static_host build list <static_host> [-w <workspace>]",
      args: [
        { name: "static_host", required: true, description: "Static host name or ID" }
      ],
      examples: ["xano static_host build list my-app"]
    },
    {
      name: "static_host build get",
      description: "Get details of a specific build",
      usage: "xano static_host build get <static_host> <build_id> [-w <workspace>]",
      args: [
        { name: "static_host", required: true, description: "Static host name or ID" },
        { name: "build_id", required: true, description: "Build ID" }
      ],
      examples: ["xano static_host build get my-app 12345"]
    },
    {
      name: "static_host build delete",
      description: "Delete a build",
      usage: "xano static_host build delete <static_host> <build_id> [-w <workspace>] [--force]",
      args: [
        { name: "static_host", required: true, description: "Static host name or ID" },
        { name: "build_id", required: true, description: "Build ID" }
      ],
      examples: ["xano static_host build delete my-app 12345 --force"]
    },
    {
      name: "static_host build env",
      description: "Update static hosting environment variables for a build",
      usage: "xano static_host build env <static_host> <build_id> [-w <workspace>] [-s KEY=value] [-f <env_file>] [-o summary|json]",
      args: [
        { name: "static_host", required: true, description: "Static host name or ID" },
        { name: "build_id", required: true, description: "Build ID" }
      ],
      flags: [
        { name: "set", short: "s", type: "string", required: false, description: "Set environment variable (KEY=value format, repeatable)" },
        { name: "file", short: "f", type: "string", required: false, description: "Load environment variables from file (.env format)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build env my-app 52 --set API_URL=https://api.example.com",
        "xano static_host build env my-app 52 -f .env"
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
        "Deploy: `xano static_host build create my-app -f build.zip -n 'v1.0.0'`"
      ],
      example: `npm run build
zip -r build.zip dist/
xano static_host build create my-frontend -f build.zip -n 'v1.0.0' -d 'Initial release'`
    }
  ]
};
