import type { FlagDoc, TopicDoc } from "../types.js";

const flags: FlagDoc[] = [
  { name: "workspace", short: "w", type: "string", description: "Workspace ID; defaults to the selected official CLI profile" },
  { name: "branch", short: "b", type: "string", description: "Branch label; defaults to the profile's branch, else live. The platform skill is the same on every branch; the branch only decides which workspace knowledge record named xano-policies, if any, replaces it" },
  { name: "profile", short: "p", type: "string", description: "Official CLI profile name" },
  { name: "directory", short: "d", type: "string", default: ".", description: "Project directory to install into (default: current directory). The file is written under its .claude/skills/, not to a positional argument" },
  { name: "output", short: "o", type: "string", default: "summary", description: "summary or json; summary prints the path written, json prints {branch, bytes, name, path, source, workspace}, where source is platform, or workspace when the workspace's own xano-policies record was installed" },
  { name: "verbose", short: "v", type: "boolean", default: "false", description: "Print the request the CLI makes and the raw platform response beside the normal output" },
];

export const skillsDoc: TopicDoc = {
  topic: "skills",
  title: "Xano CLI - Agent Skills",
  description: `\`xano skills pull\` installs the agent skill your Xano instance generates for your coding agent. Today that is one skill, \`xano-policies\`: the workspace policy file format, the authoring and honesty rules, and the instance's own check catalogue, generated from the live registry at request time so it can never describe a check the instance does not have.

The skill is fetched from \`GET /api:meta/workspace/{workspace_id}/agent-skills?surface=cli&branch=<label>\` and written to \`.claude/skills/xano-policies/SKILL.md\` under the project directory; nothing else in the project is touched. That replaces the published stub only when the stub was installed into the project for Claude Code (\`npx skills add xano-inc/xano-developer-mcp -s xano-policies -a claude-code\`, without \`-g\`). A stub installed globally (\`-g\`) or for another agent lives where that agent reads it and stays there, so remove it after pulling.

The route is one of the policy routes, gated like the others; the \`policy\` topic says what each refusal means. When the workspace has its own enabled knowledge record named \`xano-policies\`, the route serves that record instead of the platform skill, and the command says so.

The same generator serves three surfaces. \`surface=studio\` (the default on the route) is the variant Xano's own Studio agent loads; \`surface=mcp\` is the one the authenticated MCP's \`xano_get_policy_skill\` serves; \`surface=cli\` is the variant this command writes, and it is the only one the CLI asks for.

This is not workspace knowledge. The generated policy skill is produced by the platform, not stored as a workspace knowledge record, so it does not appear in \`knowledge list\` and it is not written under \`knowledge/\` by \`workspace pull\`.`,

  ai_hints: `Run \`xano skills pull\` once per project, and again after the instance is upgraded, because the skill is generated from the instance's check catalogue, not from the workspace's policies. The command is idempotent: re-running it rewrites the file and prints the path it wrote. \`xano workspace pull\` prints a hint after a pull that included policies: "Run \`xano skills pull\` to install the policies skill for your coding agent."

Treat the pulled file as authoritative over any stub: if \`.claude/skills/xano-policies/SKILL.md\` contains a check catalogue section, it came from the instance. Never edit the pulled file by hand - the next pull overwrites it - and never invent check ids or parameters from a stub; \`xano policy catalogue\` and the pulled skill are the only sources of truth for what this instance can check.

A profile has to be selected first (\`xano profile use <name> -w <workspace_id> -b <branch>\`), or the workspace and branch given with -w/-b, because the route is addressed by workspace and branch.`,

  related_topics: ["policy", "knowledge", "workspace"],

  commands: [
    {
      name: "skills pull",
      description: "Fetch the CLI variant of the generated xano-policies skill for the selected workspace and branch and write it to .claude/skills/xano-policies/SKILL.md under the project directory. Idempotent: it overwrites whatever is there and prints the path written, and says so when the workspace's own xano-policies record was installed instead of the platform skill. Needs the workspace:policy permission at read level.",
      usage: "xano skills pull [options]",
      flags,
      examples: [
        "xano skills pull",
        "xano skills pull -d ./my-app -b dev",
        "xano skills pull -w 1 -b v1 -o json",
      ],
    },
  ],

  workflows: [
    {
      name: "Give a coding agent the live policy skill",
      description: "Replace the published stub skill with the skill generated from this instance's check catalogue",
      steps: [
        "Select the workspace and branch: `xano profile use local -w 1 -b v1`",
        "Pull the skill: `xano skills pull -d ./my-app`",
        "The command writes `./my-app/.claude/skills/xano-policies/SKILL.md` and prints that path",
        "Start a new agent session in that directory so the skill manifest is re-read",
        "Remove a stub installed globally or for another agent",
        "Re-run the pull after the instance is upgraded",
      ],
      example: `xano profile use local -w 1 -b v1
xano workspace pull -d ./my-app
xano skills pull -d ./my-app`,
    },
  ],
};
