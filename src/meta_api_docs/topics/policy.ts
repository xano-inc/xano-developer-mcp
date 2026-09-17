import type { ParameterDoc, TopicDoc } from "../types.js";

const workspace: ParameterDoc = {
  name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID",
};
const branch: ParameterDoc = {
  name: "branch", type: "string", in: "query", default: "", description: "Branch label; empty selects the live branch. Use the same label for every operation in a workflow.",
};
const policyId: ParameterDoc = {
  name: "policy_id", type: "integer", required: true, in: "path", description: "Stored policy ID on the selected branch",
};
const prefix = "/workspace/{workspace_id}/policy";

export const policyExample = `policy AUTH-EXAMPLE {
  title = "Require authentication"
  statement = "Endpoints require authentication unless explicitly marked public."
  lifecycle = "active"
  enforcement = "advisory"
  severity = "high"
  owner = { name: "Dana Whitaker", role: "Information Security", email: "dana@lab.example" }
  rule {
    check = "query.auth_required"
    params = { except_tags: ["xano:quick-start"] }
  }
}`;

export const policyDoc: TopicDoc = {
  topic: "policy",
  title: "Workspace Policies (MVP)",
  description: `Policies are branch-scoped workspace XanoScript objects combining a human description and deterministic check rules. These endpoints require a platform build with policy support. Discover supported checks and their exact parameter schemas from the instance; do not invent checks or parameters.

Read, parse and evaluate require the dedicated workspace:policy read scope. Creating, updating and deleting also require the corresponding scope and an admin/explore role. Existing tokens may need to be reissued. A template is only a seed: save an ordinary policy with no template association.

The native platform parses and formats policy source. Send source alone inside data, or structured fields without source. Never send both. Canonical source is server-owned. An evaluation stores a run and its findings; it does not modify the policy.

The policy owner is a map of who answers for it, with exactly the keys name, role and email: owner = { name: "Dana Whitaker", role: "Information Security", email: "dana@lab.example" }. A scalar owner is refused with owner must be a map of who answers for this policy.

A policy file carries no comments. A two-slash or slash-star comment inside a policy block is refused outright, on its own line or trailing a value, with the line it is on: line 3: policy files cannot contain "//" comments. Put the explanation in the policy's statement, rationale or narrative. A block comment gets the same sentence with "/* */" in place of "//". A hash is a plain syntax error: Syntax error: unexpected '#'. Put the explanation in statement, rationale, narrative or a rule title.

An unknown check id or parameter name is refused naming the nearest real one, so read the refusal before guessing again: rule[0] ("KEY.R1"): "query.auth_requred" is not a policy check. Did you mean "query.auth_required"? and rule[0] ("KEY.R1"): params: unknown param "filtrs_required" for check "query.input_rules". Did you mean "filters_required"? Accepted params: ... The check catalogue endpoint, the xano_list_policy_checks MCP tool and xano policy catalogue all list the real ids.

A new policy is written lifecycle = "active" with enforcement = "advisory" - the pair a template enables with. It blocks nothing while its findings are reviewed and, unlike a draft, it is actually evaluated, so the author can see what it reports. Reach for draft only to park a policy that should not be evaluated at all.

Policies version like every other Xano object: one Version History entry per real change. The version field is the index of the newest entry, so it moves only when the definition really changes. A save whose definition matches the stored one does nothing at all - no new version, no updated_at, no history entry, no audit record - and the response carries unchanged: true; a real save carries unchanged: false. Formatting is not content, so expanded and sparse spellings of the same definition are the same no-op. Optional message and description label the entry a save creates and are ignored when nothing is saved. PUT also accepts an optional last_updated_at, the updated_at you last read: when it no longer matches, the write is refused with HTTP 400 and the message A previous update was performed before your request. Please reload your data and try again. Omitting it, or sending null or an empty string, means no check. Listing, diffing and restoring versions is a dashboard surface: the Metadata API has no version routes, for policies or for any other object type. Mandatory findings block a merge, and push feedback follows the import rather than rolling it back. Evaluation infrastructure errors are reported separately from findings.

Canonical source is sparse: a rule label is optional and omitted wherever the id can be derived from the rule's position (KEY.R1, KEY.R2), and only parameters that differ from their catalogue default are written. The parsed and stored document is fully expanded, so a GET returns every parameter. Severity says how much a violation of this policy matters: it orders findings in reports and never blocks a merge, which enforcement decides. Its four values are critical, high, medium and low; nothing else is accepted. It belongs to the policy only, defaults to medium and is omitted from source at that default. A rule that carries a severity is refused, on source and on a structured document alike, with the rule's position followed by the message "severity" is set on the policy, not on a rule. A run's policies[] snapshot records each policy's statement and, per rule, its display label and the resolved params the check ran with; runs retained from before that change carry none of them, so treat all three as optional. Each item from the check catalogue endpoint carries a human label beside the check id, and that label names a rule whose author gave it no title.

Checks are static: they inspect stored definitions and nothing runs at request time. A check passing is not proof of runtime behavior or compliance.`,
  ai_hints: `Use the authenticated Xano MCP policy tools when available. Their workspace and instance come from the authenticated request, not tool arguments. The standalone developer MCP offers documentation and local language-server validation; it does not carry a workspace credential. Validate policy source with the native policy/parse endpoint, not a second local policy grammar. Do not infer current status from a run made before the most recent policy or workspace changes; compare the version recorded in the run snapshot with the policy current version rather than comparing timestamps. Never write comments into policy source. Re-sending an identical definition is safe: the platform answers unchanged: true and writes nothing, so do not add a cosmetic edit to force a new version.`,
  related_topics: ["workspace", "branch", "authentication"],
  endpoints: [
    { method: "GET", path: prefix + "/check", description: "Discover built-in checks, parameter schemas, supported object kinds and analysis limitations.", parameters: [workspace] },
    { method: "GET", path: prefix, description: "List policies on a branch.", parameters: [workspace, branch] },
    { method: "GET", path: prefix + "/{policy_id}", description: "Read one policy, including canonical source, on the selected branch.", parameters: [workspace, policyId, branch] },
    {
      method: "POST", path: prefix + "/parse", description: "Parse and format one policy with the native platform parser, without saving it.", parameters: [workspace],
      request_body: { type: "object", properties: { source: { type: "string", required: true, description: "One complete policy XanoScript document" } }, example: { source: policyExample } },
      response: { type: "object", description: "Parsed policy definition and canonical source: {policy, source}." },
    },
    ...(["POST", "PUT"] as const).map(method => ({
      method, path: prefix + (method === "PUT" ? "/{policy_id}" : ""),
      description: method === "POST" ? "Create a policy on the selected branch." : "Update the selected branch's existing policy. A definition identical to the stored one is a no-op and answers unchanged: true with the same version.",
      parameters: method === "POST" ? [workspace] : [workspace, policyId],
      request_body: { type: "object", properties: {
        branch: { type: "string", description: "Branch label; empty selects live" },
        data: { type: "object", required: true, description: "{source: canonical XanoScript}; omit all structured fields when supplying source" },
        message: { type: "string", description: "Optional short label for the Version History entry this save creates; ignored when the save changes nothing" },
        description: { type: "string", description: "Optional longer note stored beside message on that same entry" },
        ...(method === "PUT" ? { last_updated_at: { type: "string", description: "Optional: the updated_at you last read. A mismatch is refused with HTTP 400; omit, null or empty means no check" } } : {}),
      }, example: { branch: "dev", data: { source: policyExample }, message: "Tightened the scope" } },
    })),
    { method: "DELETE", path: prefix + "/{policy_id}", description: "Soft-delete a policy on the selected branch.", parameters: [workspace, policyId, branch] },
    {
      method: "POST", path: prefix + "/evaluate", description: "Evaluate active policies against the selected branch and store the run.", parameters: [workspace],
      request_body: { type: "object", properties: {
        branch: { type: "string", description: "Branch label; empty selects live" },
        trigger: { type: "string", description: "What caused the run (default manual): manual for an explicit check, push for post-import feedback; merge and test are accepted but reserved for platform use" },
      }, example: { branch: "dev", trigger: "manual" } },
    },
    { method: "GET", path: prefix + "/run", description: "List retained runs newest first; at most twenty runs are retained per branch.", parameters: [workspace, branch, { name: "limit", type: "integer", in: "query", default: "25", description: "Maximum number of runs to return (1-200)" }] },
    { method: "GET", path: prefix + "/run/{run_id}", description: "Read one retained run on the selected branch.", parameters: [workspace, branch, { name: "run_id", type: "integer", required: true, in: "path", description: "Run ID" }] },
  ],
};
