import type { TopicDoc } from "../types.js";

export const platformDoc: TopicDoc = {
  topic: "platform",
  title: "Xano CLI - Platform Management",
  description: `Platform commands let you view available Xano platform versions. Platforms define the runtime environment (helm chart + container images) for tenants and can be deployed to tenants using \`tenant deploy_platform\`.`,

  ai_hints: `**Platforms are read-only in the CLI** - you can list and view them but not create/modify.

**Use cases:**
- Check available platform versions before deploying to a tenant
- Get platform details (helm tag, image versions, creation date)
- Used with \`tenant deploy_platform\` to update a tenant's runtime`,

  related_topics: ["tenant", "sandbox"],

  commands: [
    {
      name: "platform list",
      description: "List all available platform versions",
      usage: "xano platform list [options]",
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano platform list",
        "xano platform list -o json"
      ]
    },
    {
      name: "platform get",
      description: "Get details of a specific platform version (helm tag, image tags, etc.)",
      usage: "xano platform get <platform_id> [options]",
      args: [
        { name: "platform_id", required: true, description: "Platform ID (integer)" }
      ],
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano platform get 23629",
        "xano platform get 23629 -o json"
      ]
    }
  ]
};
