import type { TopicDoc } from "../types.js";

export const knowledgeDoc: TopicDoc = {
  topic: "knowledge",
  title: "Xano CLI - Knowledge & Skills",
  description: `Knowledge commands let you read workspace knowledge and skills (AI context documents) from the CLI. Knowledge items are markdown documents attached to a workspace that guide AI agents: always-on context, on-demand docs, and skills with reference files.

## Key Concepts

- **Knowledge types**: \`agents.md\` (the workspace's AGENTS.md), \`doc\` (standalone markdown docs), and \`skill\` (a SKILL.md plus optional reference files).
- **Inclusion**: how an item is surfaced to AI — \`always\` (always-on context), \`on demand\` (auto-selected when relevant), or \`manual\` (only when explicitly referenced).
- **Read via \`knowledge list\`/\`knowledge get\`**; **write via workspace/sandbox push** — there is no \`knowledge push\`/\`knowledge pull\`. Knowledge is synced automatically as part of \`workspace pull/push\` and \`sandbox pull/push\` under the \`knowledge/\` directory.

## On-Disk Layout (from workspace/sandbox pull)

\`\`\`
./your-code/
└── knowledge/
    ├── agents.md                    # type: agents.md
    ├── docs/
    │   └── api_conventions.md       # type: doc
    └── skills/
        └── deploy_checklist/
            ├── SKILL.md             # type: skill
            └── references/
                └── runbook.md       # skill reference files
\`\`\`

## Frontmatter Format

Each primary markdown file carries YAML frontmatter with keys in this order: \`name\`, \`description\`, \`knowledge_type\`, \`scope\`, \`inclusion\`, \`enabled\`, \`guid\`.

\`\`\`markdown
---
name: API Conventions
description: How our endpoints are structured
knowledge_type: doc
scope: workspace
inclusion: on demand
enabled: true
guid: abc123...
---

# API Conventions
...
\`\`\`

**\`inclusion\` values** (display labels): \`always\`, \`on demand\`, \`manual\`. On push, aliases are normalized case-insensitively to the backend enum: \`on demand\` → auto, \`manual\` → referenced, \`always included\`/\`always\` → always; the raw backend values (\`auto\`, \`referenced\`) are also accepted. If \`inclusion\` is missing, it defaults to on-demand. Other missing fields default on push: \`description\` → empty, \`enabled\` → true, \`scope\` → workspace; \`knowledge_type\` is inferred from the file's path if absent or invalid.`,

  ai_hints: `**Reading vs writing knowledge:**
- \`knowledge list\` / \`knowledge get\` are read-only viewers.
- To create or edit knowledge, edit files under \`knowledge/\` in a pulled directory and run \`workspace push\` (or \`sandbox push\`). Knowledge participates in push previews, \`--sync\`/\`--delete\`, and \`--include\`/\`--exclude\` globs (match against \`knowledge/**\`).
- A knowledge-only push works even with no .xs files: \`xano workspace push -i "knowledge/**"\`.

**\`knowledge list\` output modes:**
- Default markdown output renders always-on items in full under \`# Always-on Knowledge\` and everything else as name+description bullets under \`# On-demand Knowledge\` — ideal for feeding directly into an AI context window.
- \`--enabled-only\` defaults to true; use \`--no-enabled-only\` to include disabled items.

**\`knowledge get\` matching:** the name match is case-insensitive; on a miss the error lists all available names. Use \`--file <path>\` to fetch a skill's reference file instead of its SKILL.md.

**Frontmatter caution:** write \`inclusion\` (not \`mode\`) in frontmatter — the CLI writes \`inclusion: always | on demand | manual\` on pull and normalizes those labels back to the backend enum on push.`,

  related_topics: ["workspace", "sandbox"],

  commands: [
    {
      name: "knowledge list",
      description: "List workspace knowledge and skills as plain-text markdown. Always-on items are rendered in full; on-demand items as name + description bullets.",
      usage: "xano knowledge list [options]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Branch ID" },
        { name: "enabled-only", type: "boolean", required: false, default: "true", description: "Only show enabled knowledge (use --no-enabled-only to include disabled)" },
        { name: "type", short: "t", type: "string", required: false, description: "Filter by knowledge type: skill, doc, or agents.md" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "markdown", description: "Output format: markdown or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano knowledge list",
        "xano knowledge list -t skill",
        "xano knowledge list --no-enabled-only -o json"
      ]
    },
    {
      name: "knowledge get",
      description: "Get a knowledge item by name (case-insensitive), or one of its reference files with --file. Errors list the available names on a miss.",
      usage: "xano knowledge get <name> [options]",
      args: [
        { name: "name", required: true, description: "Knowledge item name (matched case-insensitively)" }
      ],
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Branch ID" },
        { name: "file", short: "f", type: "string", required: false, description: "Path of a reference file to fetch instead of the main content" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" },
        { name: "output", short: "o", type: "string", required: false, default: "text", description: "Output format: text or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        'xano knowledge get "API Conventions"',
        'xano knowledge get deploy_checklist --file references/runbook.md',
        'xano knowledge get "API Conventions" -o json'
      ]
    }
  ],

  workflows: [
    {
      name: "Load Workspace Knowledge into an AI Context",
      description: "Feed workspace knowledge to an AI agent",
      steps: [
        "List everything enabled: `xano knowledge list`",
        "The markdown output includes always-on items in full and on-demand items as an index",
        "Fetch a specific on-demand item when needed: `xano knowledge get \"<name>\"`"
      ],
      example: `xano knowledge list
xano knowledge get "API Conventions"`
    },
    {
      name: "Edit Knowledge via Workspace Sync",
      description: "Create or update knowledge files with the push/pull workflow",
      steps: [
        "Pull the workspace: `xano workspace pull -d ./code` (knowledge lands under `knowledge/`)",
        "Edit `knowledge/agents.md`, `knowledge/docs/*.md`, or `knowledge/skills/*/SKILL.md` (keep the `inclusion` frontmatter field: always, on demand, or manual)",
        "Preview: `xano workspace push -d ./code --dry-run`",
        "Push just the knowledge: `xano workspace push -d ./code -i 'knowledge/**'`"
      ],
      example: `xano workspace pull -d ./code
# edit knowledge/docs/api_conventions.md
xano workspace push -d ./code --dry-run
xano workspace push -d ./code -i 'knowledge/**'`
    }
  ]
};
