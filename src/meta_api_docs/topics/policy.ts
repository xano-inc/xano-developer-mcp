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

// Canonical source exactly as POST /policy/parse returns it: quoted key, the platform's
// field order (title, statement, severity, lifecycle, enforcement), a blank line before the
// first rule, and a one-key params map inline with no padding inside the braces.
export const policyExample = `policy "AUTH-EXAMPLE" {
  title = "Require authentication"
  statement = "Endpoints require authentication unless the endpoint or its API group is tagged public."
  severity = "high"
  lifecycle = "active"
  enforcement = "advisory"

  rule {
    check = "query.auth_required"
    params = {except_tags: ["public", "xano:quick-start"]}
  }
}`;

const aiModified: ParameterDoc = {
  name: "ai_modified", type: "boolean", in: "query", default: false, description: "true marks a change an AI agent made (the authenticated MCP sends it): the audit entry gains the agent label and stays attributed to the authenticated user",
};

export const policyDoc: TopicDoc = {
  topic: "policy",
  title: "Workspace Policies",
  description: `Policies are branch-scoped workspace XanoScript objects combining a human description and deterministic check rules. These endpoints require a platform build with policy support. Discover supported checks and their exact parameter schemas from the instance; do not invent checks or parameters. The policy language - syntax, fields, rules, refusal messages and versioning - is documented once, in xano_xanoscript_docs({topic: "policies"}); this topic covers the routes.

Every route needs the workspace:policy permission: read for the reads, parse, the object lookup and evaluate; create, update or delete for the writes. An OAuth token is also capped by its workspace:read or workspace:write ceiling. A refusal is a 403 whose payload.code names the gate: policy_feature_disabled, policy_permission_required or policy_scope_required (both with permission and level). The OAuth ceiling answers insufficient_scope without a code. The policies topic's Permissions section says what each one needs.

The native platform parses and formats policy source. Send source alone inside data, or structured fields without source; never both. Canonical source is server-owned. A write answers the policy as GET serves it, plus unchanged: an unchanged save writes nothing and answers unchanged: true. PUT takes an optional last_updated_at, the updated_at you last read: a write over a newer change is refused with HTTP 400 and payload.code policy_stale. A source error is a 400 whose payload.line and payload.col count from 1, like the message.

Every policy the list, a GET and a write serve carries latest_run {run_id, included, version, enforcement, stale}: its place in the branch's newest run. stale: true means the policy changed after that run, so its findings no longer describe it; included: false means that run did not evaluate it. The platform decides this once; do not compare versions or timestamps yourself.

A policy_check block reports an evaluation. status is one of: pass ("No policy findings."), fail ("Active policies reported findings."), error ("A policy check could not run; its result is marked error."), not_applicable ("No active policies on this branch; nothing was evaluated."), disabled ("Policies are not enabled on this instance; nothing was evaluated."), forbidden ("This credential cannot read this workspace's policies (workspace:policy read); nothing was evaluated.") or unavailable ("Policy evaluation is unavailable; the import itself completed."), and message carries that sentence. blocking is true when an active mandatory policy has findings, and status is then fail even if a check errored. not_applicable, disabled and forbidden load, store and audit nothing. Evaluate answers pass, fail, error or not_applicable; the feature gate and the permission refuse it with a 403 instead. The workspace multidoc import answers all seven, with the findings in full; a draft import or a tenant, sandbox or release push answers no policy_check.

An evaluation stores a run and its findings; it does not modify the policy. Findings arrive in one order: blocking first, then by severity, policy key, rule id and object. Checks are static: they inspect stored definitions and nothing runs at request time. A check passing is not proof of runtime behavior or compliance.`,
  ai_hints: `Use the authenticated Xano MCP policy tools when available. Their workspace and instance come from the authenticated request, not tool arguments. The standalone developer MCP offers documentation and local language-server validation; it does not carry a workspace credential. Validate policy source with the native policy/parse endpoint, not a second local policy grammar. Key refusals on payload.code, never on the message wording. Read latest_run.stale to know whether a run still describes a policy. Re-sending an identical definition is safe: the platform answers unchanged: true and writes nothing, so do not add a cosmetic edit to force a new version.`,
  related_topics: ["workspace", "branch", "authentication"],
  endpoints: [
    { method: "GET", path: prefix + "/check", description: "The check catalogue: items (each check's id, label, description, keywords, supported object kinds and full parameter schema) and goals (the outcomes a new policy can start from, each with the title, statement, key, severity and rules it seeds, the needs the author fills and a limits note on what its rules cannot see; see the policies topic).", parameters: [workspace] },
    { method: "GET", path: prefix, description: "List policies on a branch, 1000 a page (nextPage says whether there are more). Each item is served as GET serves one policy, with latest_run.", parameters: [workspace, branch, { name: "page", type: "integer", in: "query", default: 1, description: "Page number" }] },
    { method: "GET", path: prefix + "/{policy_id}", description: "Read one policy on the selected branch, with latest_run. source is canonical, so it can be sent back to PUT unchanged (a no-op) or edited. A policy that is not live on the branch answers 404 Policy not found on this branch of the workspace., as PUT and DELETE do.", parameters: [workspace, policyId, branch] },
    {
      method: "GET", path: prefix + "/object", description: "The active policies whose rules reach one object, why each rule applies, and that object's findings in the branch's newest run. An unknown type is a 400 naming the known types; an object the branch does not have is a 404.",
      parameters: [workspace, branch, { name: "type", type: "string", required: true, in: "query", description: "Object kind as findings name it: query, function, table, task, trigger, message and the other kinds the catalogue lists" }, { name: "id", type: "integer", required: true, in: "query", description: "Object ID on the selected branch" }],
      response: { type: "object", description: "{object, policies: [{id, key, title, statement, severity, lifecycle, enforcement, tag, rules: [{id, title, check, label, reason, warnings}], latest_run}], run: {id, started_at, status} | null, findings}. policies come from the policies as they are now; findings come from the newest stored run." },
    },
    {
      method: "POST", path: prefix + "/parse", description: "Parse and format one policy with the native platform parser, without saving it.", parameters: [workspace],
      request_body: { type: "object", properties: { source: { type: "string", required: true, description: "One complete policy XanoScript document" } }, example: { source: policyExample } },
      response: { type: "object", description: "Parsed policy definition and canonical source: {policy, source}. A source error is a 400 whose payload.line and payload.col count from 1." },
    },
    ...(["POST", "PUT"] as const).map(method => ({
      method, path: prefix + (method === "PUT" ? "/{policy_id}" : ""),
      description: method === "POST"
        ? "Create a policy on the selected branch. A key the branch already has is refused, naming the policy id that holds it."
        : "Update the selected branch's existing policy. A definition identical to the stored one is a no-op and answers unchanged: true with the same version.",
      parameters: method === "POST" ? [workspace] : [workspace, policyId],
      request_body: { type: "object", properties: {
        branch: { type: "string", description: "Branch label; empty selects live" },
        data: { type: "object", required: true, description: "{source: canonical XanoScript}; omit all structured fields when supplying source" },
        message: { type: "string", description: "Optional short label for the Version History entry this save creates; ignored when the save changes nothing" },
        description: { type: "string", description: "Optional longer note stored beside message on that same entry" },
        ai_modified: { type: "boolean", description: "Optional, default false. " + aiModified.description },
        ...(method === "PUT" ? { last_updated_at: { type: "string", description: "Optional: the updated_at you last read. A write over a newer change is refused with HTTP 400, payload.code policy_stale; omit, null or empty means no check" } } : {}),
      }, example: { branch: "dev", data: { source: policyExample }, message: "Tightened the scope" } },
      response: { type: "object", description: "The policy as GET serves it, with latest_run, plus unchanged" },
    })),
    { method: "DELETE", path: prefix + "/{policy_id}", description: "Soft-delete a policy on the selected branch; its Version History is kept. Answers {}.", parameters: [workspace, policyId, branch, aiModified] },
    {
      method: "POST", path: prefix + "/evaluate", description: "Evaluate the active policies on the selected branch and store the run. Every run it stores is a manual run.", parameters: [workspace],
      request_body: { type: "object", properties: {
        branch: { type: "string", description: "Branch label; empty selects live" },
        ai_modified: { type: "boolean", description: "Optional, default false. true records the run as made by an AI agent acting for the authenticated user" },
      }, example: { branch: "dev" } },
      response: { type: "object", description: "The run exactly as GET run/{run_id} serves it, plus stored and policy_check {status, message, blocking, run_id, blocking_finding_ids}. stored: false with id 0 means no run was kept: nothing was active, or the caller is a read-only session or an OAuth token without workspace:write." },
    },
    {
      method: "GET", path: prefix + "/run", description: "List the retained runs newest first, as summaries: the findings, per-rule results and policy snapshots are on the single run. Only a branch's newest twenty runs are retained.",
      parameters: [workspace, branch, { name: "limit", type: "integer", in: "query", default: 20, description: "How many runs to return, 1-20" }],
      response: { type: "object", description: "{items, curPage, nextPage, prevPage}; each item is {id, created_at, trigger, actor, started_at, finished_at, status, objects_checked, counts: {findings, blocking, errors}, policies: [{id, key, version, enforcement}], branch}" },
    },
    { method: "GET", path: prefix + "/run/{run_id}", description: "Read one retained run in full: findings, per-rule results and the policies[] snapshot of what it checked (each policy's statement and, per rule, its label and resolved params). An evicted run or another branch's answers 404 Policy run not found on this branch of the workspace. Only a branch's newest runs are retained.", parameters: [workspace, branch, { name: "run_id", type: "integer", required: true, in: "path", description: "Run ID" }] },
    {
      method: "GET", path: "/workspace/{workspace_id}/agent-skills",
      description: "Serve the generated xano-policies agent skill. One generator, two surfaces: studio (the default, the variant the Studio agent loads) and cli (the variant xano skills pull writes). Each surface has its own description. The check catalogue inside it is generated from the live registry at request time, so it can never document a check this instance does not have. A workspace knowledge record named xano-policies replaces the platform skill and is served instead. Needs the workspace:policy permission at read level, like the other policy routes.",
      parameters: [workspace, branch, { name: "surface", type: "string", in: "query", default: "studio", enum: ["studio", "cli"], description: "Which variant of the generated skill to return" }],
      response: { type: "object", description: "{knowledge: [...]}: the same envelope as workspace knowledge, with one item named xano-policies whose knowledge_type is skill and whose content is the skill markdown. The platform's own item has id -101." },
    },
  ],
};
