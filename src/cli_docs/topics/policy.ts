import type { FlagDoc, TopicDoc } from "../types.js";

const flags: FlagDoc[] = [
  { name: "workspace", short: "w", type: "string", description: "Workspace ID; defaults to the selected official CLI profile" },
  { name: "branch", short: "b", type: "string", description: "Branch label; use the same branch for publishing and evaluating" },
  { name: "profile", short: "p", type: "string", description: "Official CLI profile name" },
  { name: "output", short: "o", type: "string", default: "summary", description: "summary or json" },
];
const sourceFlags: FlagDoc[] = [
  { name: "file", type: "string", description: "Path to one policy XanoScript document; use this or --stdin" },
  { name: "stdin", type: "boolean", description: "Read one policy document from standard input" },
];

export const policyDoc: TopicDoc = {
  topic: "policy",
  title: "Xano CLI - Workspace Policies (MVP)",
  description: `Policy support in the official @xano/cli uses the existing profile and Metadata API client. Requires policy-enabled builds of the CLI and instance. A policy combines its human description with deterministic check rules and lives as workspace XanoScript. Templates are editable seeds with no stored relationship to their source template.

Use the authenticated Xano MCP tools for live tool calls, or these CLI commands for local workspace files. The standalone developer MCP serves this documentation; it does not itself authenticate to your workspace.`,
  ai_hints: `Discover exact check parameters with policy catalogue. Native policy parse is the validation authority; the standalone language server does not support policy grammar. Do not invent a local policy parser. Reads, parsing and evaluation require workspace:policy read scope; writes additionally need matching operation scopes and admin/explore role. Existing tokens may need to be reissued.

workspace pull includes policies in policies/*.xs. workspace push includes them in the normal multidoc import and reports policy_check afterward. Exit 2 indicates imported code with mandatory findings, not an import rollback. Missing or unavailable evaluation is not a pass; the CLI exits 1 unless its explicit --allow_missing_policy_check compatibility option is used. Infrastructure evaluation failures do not roll back imported code. Existing workspace push deletion/sync behavior remains governed by its normal flags.`,
  related_topics: ["workspace", "profile", "branch"],
  commands: [
    { name: "policy catalogue", description: "List built-in checks, their schemas and analysis limitations from the instance.", usage: "xano policy catalogue [options]", flags, examples: ["xano policy catalogue -o json"] },
    { name: "policy list", description: "List policies on the selected branch.", usage: "xano policy list [options]", flags, examples: ["xano policy list -b dev -o json"] },
    { name: "policy parse", description: "Parse and format source on the instance without saving. Summary output is canonical XanoScript; JSON includes {policy, source}.", usage: "xano policy parse --file <path> [options]", flags: [...flags, ...sourceFlags], examples: ["xano policy parse --file policies/AUTH-EXAMPLE.xs", "cat policies/AUTH-EXAMPLE.xs | xano policy parse --stdin -o json"] },
    { name: "policy publish", description: "Parse one policy, then create or update by its stable key on the selected branch using canonical source. Use workspace push for an atomic multi-policy import.", usage: "xano policy publish --file <path> [options]", flags: [...flags, ...sourceFlags], examples: ["xano policy publish --file policies/AUTH-EXAMPLE.xs -b dev"] },
    { name: "policy evaluate", description: "Evaluate active policies and store a new run. Reports mandatory findings with exit 2; unavailable evaluation with exit 1.", usage: "xano policy evaluate [options]", flags, examples: ["xano policy evaluate -b dev -o json"] },
    {
      name: "policy status",
      description: "Inspect stored policy/run state without evaluating. Historical runs do not prove edits since the run have been checked. Informational (exit 0) by default; with --fail-on-findings it exits 1 for stale, missing or errored evaluation evidence and 2 for current mandatory findings (advisory findings still exit 0).",
      usage: "xano policy status [options]",
      flags: [...flags, { name: "fail-on-findings", type: "boolean", default: "false", description: "Exit 1 for stale, missing or errored evaluation evidence; exit 2 for current mandatory findings" }],
      examples: ["xano policy status -b dev -o json", "xano policy status --fail-on-findings -o json"],
    },
  ],
};
