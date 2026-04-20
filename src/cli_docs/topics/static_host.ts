import type { TopicDoc } from "../types.js";

export const staticHostDoc: TopicDoc = {
  topic: "static_host",
  title: "Xano CLI - Static Hosting",
  description: `Static host commands let you deploy frontend builds to Xano's static hosting infrastructure.`,

  ai_hints: `**Static hosting workflow:**
1. Build your frontend (React, Vue, etc.)
2. Zip the build output
3. Upload with \`static_host build create\`

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
      name: "static_host build create",
      description: "Create a new build for a static host by uploading a ZIP file",
      usage: "xano static_host build create <host_name> -f <file> -n <name> [options]",
      args: [
        { name: "host_name", required: true, description: "Static host name" }
      ],
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Path to ZIP file to upload" },
        { name: "name", short: "n", type: "string", required: true, description: "Build name/version" },
        { name: "description", short: "d", type: "string", required: false, description: "Build description" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build create my-app -f ./build.zip -n 'v1.0.0'",
        "xano static_host build create my-app -f ./dist.zip -n 'v1.1.0' -d 'Bug fixes'"
      ]
    },
    {
      name: "static_host build list",
      description: "List all builds for a static host",
      usage: "xano static_host build list <host_name> [-w <workspace>]",
      args: [
        { name: "host_name", required: true, description: "Static host name" }
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
      description: "Get details of a specific build",
      usage: "xano static_host build get <host_name> <build_id>",
      args: [
        { name: "host_name", required: true, description: "Static host name" },
        { name: "build_id", required: true, description: "Build ID" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano static_host build get my-app 52",
        "xano static_host build get my-app 52 -o json"
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
