import type { FlagDoc, TopicDoc } from "../types.js";

const flags: FlagDoc[] = [
  { name: "workspace", short: "w", type: "string", description: "Workspace ID; defaults to the selected official CLI profile" },
  { name: "branch", short: "b", type: "string", description: "Branch label; use the same branch for publishing and evaluating" },
  { name: "profile", short: "p", type: "string", description: "Official CLI profile name" },
  { name: "output", short: "o", type: "string", default: "summary", description: "summary or json" },
];
const messageFlag: FlagDoc = { name: "message", short: "m", type: "string", description: "Short label for the Version History entry this publish creates; ignored when the definition is unchanged" };
const sourceFlags: FlagDoc[] = [
  { name: "file", type: "string", description: "Path to one policy XanoScript document; use this or --stdin" },
  { name: "stdin", type: "boolean", description: "Read one policy document from standard input" },
];

export const policyDoc: TopicDoc = {
  topic: "policy",
  title: "Xano CLI - Workspace Policies (MVP)",
  description: `Policy support in the official @xano/cli uses the existing profile and Metadata API client. Requires policy-enabled builds of the CLI and instance. A policy combines its human description with deterministic check rules and lives as workspace XanoScript. Templates are editable seeds with no stored relationship to their source template.

Use the authenticated Xano MCP tools for live tool calls, or these CLI commands for local workspace files. The standalone developer MCP serves this documentation; it does not itself authenticate to your workspace.`,
  ai_hints: `Discover exact check parameters with policy catalogue; each entry carries a human label beside its check id. Native policy parse is the validation authority; the standalone language server does not support policy grammar. Do not invent a local policy parser. Reads, parsing and evaluation require workspace:policy read scope; writes additionally need matching operation scopes and admin/explore role. Existing tokens may need to be reissued.

policy parse prints canonical source, which is sparse: rules carry no label where the id derives from their position, and only parameters differing from the catalogue default are written. Canonical source also rewrites params into the catalogue's schema order rather than the author's, so a diff can move lines nobody touched. Do not read a shorter file as a lost setting, and do not reinstate defaults or a rule severity. Files written by workspace pull are already in that form, newline-terminated.

Severity says how much a violation of a policy matters: it orders findings in reports and never blocks a merge, which enforcement decides. Its four values are critical, high, medium and low; nothing else is accepted, it defaults to medium, and canonical source omits the line at that default. It belongs to the policy only - a rule that declares one is refused with the rule's position followed by "severity" is set on the policy, not on a rule. The policy owner is a map of who answers for it, with exactly the keys name, role and email: owner = { name: "Dana Whitaker", role: "Information Security", email: "dana@lab.example" }; a scalar owner is refused. Write a new policy lifecycle active with enforcement advisory - the pair a template enables with - so it blocks nothing while its findings are reviewed; a draft policy is never evaluated and reports nothing at all.

Never write comments into policy source. A two-slash or slash-star comment inside a policy block is refused outright, on its own line or trailing a value, naming the line it is on: line 3: policy files cannot contain "//" comments. Put the explanation in the policy's statement, rationale or narrative. A hash is a plain syntax error: Syntax error: unexpected '#'. Put the explanation in statement or a rule title.

Policies version like every other Xano object: one Version History entry per real change, and version is the index of the newest entry, so it moves only when the definition really changes. Publishing an identical definition writes nothing at all and prints No changes; JSON output carries unchanged: true. Do not add a cosmetic edit to force a version. Use -m to label the entry. Version history is listed, diffed and restored in the Xano dashboard only; there is no CLI command for it, because the Metadata API exposes no version routes for any object type. policy status calls a run stale when the version recorded in its snapshot differs from the policy current version, falling back to timestamps for runs stored before snapshots.

workspace pull includes policies in policies/*.xs. workspace push includes them in the normal multidoc import and reports policy_check afterward. Exit 2 indicates imported code with mandatory findings, not an import rollback. Missing or unavailable evaluation is not a pass; the CLI exits 1 unless its explicit --allow_missing_policy_check compatibility option is used (--allow-missing-policy-check is accepted as the same flag). Infrastructure evaluation failures do not roll back imported code. Existing workspace push deletion/sync behavior remains governed by its normal flags.`,
  related_topics: ["workspace", "profile", "branch"],
  commands: [
    { name: "policy catalogue", description: "List built-in checks, their schemas and analysis limitations from the instance. The full catalogue is long; --check narrows it to one check id in either output mode, and an unknown id names the closest matches.", usage: "xano policy catalogue [options]", flags: [...flags, { name: "check", type: "string", description: "Show only this check id" }], examples: ["xano policy catalogue -o json", "xano policy catalogue --check query.auth_required"] },
    { name: "policy list", description: "List policies on the selected branch, each with its lifecycle, id and current version.", usage: "xano policy list [options]", flags, examples: ["xano policy list -b dev -o json"] },
    { name: "policy parse", description: "Parse and format source on the instance without saving. Summary output is canonical XanoScript; JSON includes {policy, source}.", usage: "xano policy parse --file <path> [options]", flags: [...flags, ...sourceFlags], examples: ["xano policy parse --file policies/AUTH-EXAMPLE.xs", "cat policies/AUTH-EXAMPLE.xs | xano policy parse --stdin -o json"] },
    { name: "policy publish", description: "Parse one policy, then create or update by its stable key on the selected branch using canonical source. Prints Published KEY (Version N), or No changes to KEY (Version N) when the definition already matches what is stored. Use workspace push for an atomic multi-policy import.", usage: "xano policy publish --file <path> [options]", flags: [...flags, ...sourceFlags, messageFlag], examples: ["xano policy publish --file policies/AUTH-EXAMPLE.xs -b dev", "xano policy publish --file policies/AUTH-EXAMPLE.xs -m \"Tightened the scope\""] },
    { name: "policy evaluate", description: "Evaluate active policies and store a new run. Reports mandatory findings with exit 2; unavailable evaluation with exit 1.", usage: "xano policy evaluate [options]", flags: [...flags, { name: "run-detail", type: "boolean", default: "false", description: "Also print what this run recorded: each policy's statement and each rule's name and resolved settings" }], examples: ["xano policy evaluate -b dev -o json", "xano policy evaluate --run-detail"] },
    {
      name: "policy status",
      description: "Inspect stored policy/run state without evaluating. A run is stale when the version its snapshot recorded differs from the policy current version; timestamps are the fallback for runs stored before snapshots. Historical runs do not prove edits since the run have been checked. Informational (exit 0) by default; with --fail-on-findings it exits 1 for stale, missing or errored evaluation evidence and 2 for current mandatory findings (advisory findings still exit 0).",
      usage: "xano policy status [options]",
      flags: [...flags, { name: "fail-on-findings", type: "boolean", default: "false", description: "Exit 1 for stale, missing or errored evaluation evidence; exit 2 for current mandatory findings" }, { name: "run-detail", type: "boolean", default: "false", description: "Also print what the latest run recorded: each policy's statement and each rule's name and resolved settings. Summary output only; a run stored before the platform recorded those prints one line saying so" }],
      examples: ["xano policy status -b dev -o json", "xano policy status --fail-on-findings -o json", "xano policy status --run-detail"],
    },
  ],
};
