import type { TopicDoc } from "../types.js";

export const updateDoc: TopicDoc = {
  topic: "update",
  title: "Xano CLI - Update",
  description: `The update command lets you check for and install CLI updates.`,

  ai_hints: `**When to suggest updating:**
- User encounters unexpected behavior that might be fixed in a newer version
- User asks about new features
- Before troubleshooting CLI issues

**Update uses npm** - runs \`npm install -g @xano/cli\` under the hood.
**Check only** - use \`--check\` to see whether an update is available without installing.
**Beta channel** - use \`--beta\` to get pre-release versions for testing new features.`,

  related_topics: ["start"],

  commands: [
    {
      name: "update",
      description: "Update the Xano CLI to the latest version",
      usage: "xano update [options]",
      flags: [
        { name: "check", type: "boolean", required: false, description: "Check for updates without installing" },
        { name: "beta", type: "boolean", required: false, description: "Update to the latest beta version" }
      ],
      examples: [
        "xano update",
        "xano update --check",
        "xano update --beta"
      ]
    }
  ]
};
