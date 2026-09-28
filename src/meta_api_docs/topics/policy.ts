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
const runId: ParameterDoc = { name: "run_id", type: "integer", required: true, in: "path", description: "Run ID" };

// Canonical source exactly as POST /policy/parse returns it: quoted key, the platform's
// field order (title, statement, severity, active, enforcement), a blank line before the
// first rule, and a one-key params map inline with no padding inside the braces.
export const policyExample = `policy "AUTH-EXAMPLE" {
  title = "Require authentication"
  statement = "Endpoints require authentication unless the endpoint or its API group is tagged public."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.auth_required"
    params = {except_tags: ["public", "xano:quick-start"]}
  }
}`;

const aiModified: ParameterDoc = {
  name: "ai_modified", type: "boolean", in: "query", default: false, description: "true marks a change an AI agent made (the authenticated MCP sends it): the audit entry gains the agent label and stays attributed to the authenticated user",
};

export const policyDoc: TopicDoc = {
  topic: "policy",
  title: "Workspace Policies",
  description: `Policies are branch-scoped workspace XanoScript objects combining a human description and deterministic check rules. These endpoints require a platform build with policy support. Discover supported checks and their exact parameter schemas from the instance; do not invent checks or parameters. The policy language - syntax, fields, rules, refusal messages and versioning - is documented once, in xano_xanoscript_docs({topic: "policies"}) (mode: "quick_reference" for the short form; the full topic carries every check's description); this topic covers the routes.

Every route needs the workspace:policy permission: read for the reads, parse, the object lookup and evaluate; create, update or delete for the writes. An OAuth token is also capped by its workspace:read or workspace:write ceiling. A refusal is a 403 whose payload.code names the gate: policy_feature_disabled, policy_permission_required or policy_scope_required (both with permission and level). The OAuth ceiling answers insufficient_scope without a code, and a write from a read-only session (a read-only Studio session or a read-only impersonation) is refused without a code too: This is a read-only session. Enable editing to modify this resource. The policies topic's Permissions section says what each one needs.

The native platform parses and formats policy source. Send source alone inside data, or structured fields without source; never both. Canonical source is server-owned. A write answers the policy as GET serves it, plus unchanged: an unchanged save writes nothing and answers unchanged: true. PUT and DELETE take an optional last_updated_at, the updated_at you last read: a write or delete over a newer change is refused with HTTP 400 and payload.code policy_stale, and nothing changes. A source error is a 400 whose payload.line and payload.col count from 1, like the message. A rule naming a check id the instance does not have is refused on parse, save and push with HTTP 400 and payload {code: "policy_unknown_check", check} (the id as written); the message names the nearest ids and the catalogue route, and a client keys its own pointer to the catalogue on the code.

Every policy the list, a GET and a write serve carries latest_run {run_id, included, version, enforcement, stale}: its place in the branch's newest run. stale: true means the policy changed after that run, so its findings no longer describe it; included: false means that run did not evaluate it. The platform decides this once; do not compare versions or timestamps yourself.

A rule with zero objects checked and no findings has status no_objects and message no objects checked. Older stored runs keep pass with checked: 0; readers accept both. The run and policy_check stay pass when nothing failed, and policy_check.message names the unchecked rules. Merge, publish and deploy gates read findings and are unaffected.

A policy_check block reports an evaluation. status is one of: pass ("No policy findings."), fail ("Policies reported findings."), error ("A policy check could not run; its result is marked error."), not_applicable ("No active policies on this branch; nothing was evaluated."), disabled ("Policies are not enabled on this instance; nothing was evaluated."), forbidden ("This credential cannot read this workspace's policies (workspace:policy read); nothing was evaluated.") or unavailable ("Policy evaluation is unavailable; the import itself completed."), and message carries that sentence. blocking is true when an active mandatory policy has findings, and status is then fail even if a check errored. not_applicable, disabled and forbidden load, store and audit nothing. Evaluate answers pass, fail, error or not_applicable; the feature gate and the permission refuse it with a 403 instead. A not_applicable evaluate is no run: id 0, stored: false, the run's own status not_applicable too, and empty policies, results and findings. The workspace multidoc import answers all seven. Its findings and blocking_findings list the first 100 each, in the platform's order, beside counts {findings, blocking, errors}, total (every finding) and truncated (whether either list was cut); the stored run (run_id) has them all, and its results are whole; a draft import answers no policy_check. A tier1 tenant, ephemeral or sandbox push and its dry run, and a release built from a multidoc (release push), carry policy files while the feature is on; a tenant or sandbox push carries them without evaluating them and answers no policy_check, and a release built from a multidoc carries its files only for a caller holding workspace:policy create and update (for anyone else it carries the workspace's live-branch policies instead, and names the files in policies_skipped when they differ from the live ones). A remote tenant push, a push to a tenant without a policy table (one created before policies, until its next platform update), or any push while the feature is off leaves them out and names them once in policies_skipped {message, keys}, whose message says why ("N policy files were left out (KEY, KEY): <reason>."). With the policies feature off a workspace push and its dry run leave them out too (policy_check disabled), exports omit policies, and an archive import leaves its policies out and keeps the workspace's own, except that a replace deletes the policies of the branches it removes.

Gates: a merge, a set-live, an archive import with mode=merge, a save or a non-draft push to the workspace's live branch, and a tenant release deploy are refused with HTTP 403 and payload.code policy_gate when they introduce a blocking finding or leave one on an object they change; existing findings elsewhere never block. The payload is {gate, status, total, introduced, changed, existing, run_id, can_override, findings (first 100, policy readers only), truncated}. A caller with workspace:policy update may proceed by resending with override_reason (the create and save routes of the draftable objects, the multidoc, upload, import and branch live routes, a release deploy with set_live and import-schema with setlive; override_policy with the reason on tenant deploys), which is audited. A release deploy with set_live and an import-schema with setlive land the new branch first and then run the set-live gate, so a refusal keeps that branch and names it in payload.branch {id, label}. Only the draftable kinds (function, query, task, middleware, addon, tool, workflow test, trigger and realtime message) pass through the publish gate: tables, API groups, environment variables, workspace and branch settings, agents, MCP servers, toolsets, realtime servers and realtime channels are saved without it, even on the live branch, and the next run reports what they break while a set-live or tenant deploy that carries it is gated. A push to the live branch needs its transaction (400 policy_gate_transaction_required). Pushes to other branches are not gated: they answer policy_check after the import. A create past the plan's per-branch cap (Free 3; Starter, Launch and Essential 10; Pro and above unlimited) is refused with 403 policy_plan_limit; a create whose rules exactly match a live policy on the branch with 400 policy_duplicate (with existing_key, existing_id and policies); a draft import carrying a changed policy with 400 policy_draft_import (Policies are saved directly, not drafted.).

Releases carry their branch's policies and store a policy check when cut. An uploaded release archive (release/import) that says it carries policies needs workspace:policy create and update, or is refused with 403 policy_permission_required and nothing is stored. Routes: GET /workspace/{workspace_id}/release/{release_id}/policy_run (POST re-checks it), .../policy_run/findings, and GET /workspace/{workspace_id}/release/policy_check?release_id[]= for several (at most 200 ids). GET /workspace/{workspace_id}/tenant/{tenant_name}/policy_gate?release_name= previews a tenant deploy's gate, and GET /workspace/{workspace_id}/tenant/{tenant_name}/policy lists a tenant's policies; both need tenant_center read besides workspace:policy read.

Policies expose active as a boolean (default true). Source always writes active = true or active = false before enforcement. Authored lifecycle is refused: policy: "lifecycle" was replaced by "active"; write active = true or active = false. Source refusals include line and column. An inactive policy may have no rules. Policies are saved directly, not drafted.

An evaluation stores a run and its findings; it does not modify the policy. Findings arrive in one order: blocking first, then by severity, policy key, rule position (R2 before R10) and object. A run can hold tens of thousands of findings (85,855 findings is a 44 MB run), so read a large one in parts: GET run/{run_id}/summary serves it without its findings, with its counts, each policy's verdict and the facets, and GET run/{run_id}/findings serves its findings a page at a time, filtered on the instance. Evaluate with answer: "summary" answers the same way, with the first 50 findings. Checks are static: they inspect stored definitions and nothing runs at request time. A check passing is not proof of runtime behavior or compliance.`,
  ai_hints: `Use the authenticated Xano MCP policy tools when available. Their workspace and instance come from the authenticated request, not tool arguments. The standalone developer MCP offers documentation and local language-server validation; it does not carry a workspace credential. Validate policy source with the native policy/parse endpoint, not a second local policy grammar. Key refusals on payload.code, never on the message wording. Read latest_run.stale to know whether a run still describes a policy. Evaluate with answer: "summary" and page a run's findings with GET run/{run_id}/findings rather than reading a large run whole. Re-sending an identical definition is safe: the platform answers unchanged: true and writes nothing, so do not add a cosmetic edit to force a new version.`,
  related_topics: ["workspace", "branch", "authentication"],
  endpoints: [
    { method: "GET", path: prefix + "/check", description: "The check catalogue: items (each check's id, label, description, keywords, supported object kinds and full parameter schema) and goals (the outcomes a new policy can start from, each with the title, statement, key, severity and rules it seeds, the needs the author fills and a limits note on what its rules cannot see; see the policies topic).", parameters: [workspace] },
    { method: "GET", path: prefix, description: "List policies on a branch, 1000 a page (nextPage says whether there are more). Each item is served as GET serves one policy, with latest_run.", parameters: [workspace, branch, { name: "page", type: "integer", in: "query", default: 1, description: "Page number" }] },
    { method: "GET", path: prefix + "/{policy_id}", description: "Read one policy on the selected branch, with latest_run. source is canonical, so it can be sent back to PUT unchanged (a no-op) or edited. A policy that is not live on the branch answers 404 Policy not found on this branch of the workspace., as PUT and DELETE do.", parameters: [workspace, policyId, branch] },
    {
      method: "GET", path: prefix + "/object", description: "The active policies whose rules reach one object, why each rule applies, and that object's findings in the branch's newest run. An unknown type is a 400 naming the known types; an object the branch does not have is a 404.",
      parameters: [workspace, branch, { name: "type", type: "string", required: true, in: "query", description: "Object kind as findings name it: query, function, table, task, trigger, message and the other kinds the catalogue lists" }, { name: "id", type: "integer", required: true, in: "query", description: "Object ID on the selected branch" }],
      response: { type: "object", description: "{object, policies: [{id, key, title, statement, severity, active, enforcement, tag, rules: [{id, title, check, label, reason, warnings}], latest_run}], run: {id, started_at, status, policies: [{key, blocking}]} | null, findings}. policies come from the policies as they are now; findings come from the newest stored run, and run.policies names each policy whose findings are listed, with blocking from the run's snapshot." },
    },
    {
      method: "POST", path: prefix + "/parse", description: "Parse and format one policy with the native platform parser, without saving it. Send exactly one of source or data.", parameters: [workspace],
      request_body: { type: "object", properties: { source: { type: "string", description: "One complete policy XanoScript document" }, data: { type: "object", description: "Structured policy fields instead of source" }, branch: { type: "string", description: "Optional branch label to check rule warnings against" } }, example: { source: policyExample } },
      response: { type: "object", description: "Parsed policy definition, canonical source and rule warnings: {policy, source, rule_warnings: [{rule, rule_id, warnings}]} (only rules with warnings). A source error is a 400 whose payload.line and payload.col count from 1." },
    },
    ...(["POST", "PUT"] as const).map(method => ({
      method, path: prefix + (method === "PUT" ? "/{policy_id}" : ""),
      description: method === "POST"
        ? "Create a policy on the selected branch. A key the branch already has is refused, naming the policy id that holds it. A policy whose rules exactly match a live policy on the branch (the same checks and normalized params, as a set; key, title, severity, enforcement, active and tags ignored) is refused with 400 payload.code policy_duplicate: A policy with exactly these rules already exists: KEY. Change a parameter or scope to add another., with existing_key, existing_id and policies."
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
    { method: "DELETE", path: prefix + "/{policy_id}", description: "Soft-delete a policy on the selected branch; its Version History is kept. Answers {}. With last_updated_at, a policy changed since that read is refused with HTTP 400, payload.code policy_stale, and nothing is deleted.", parameters: [workspace, policyId, branch, aiModified, { name: "last_updated_at", type: "string", in: "query", description: "Optional: the updated_at you last read. Omit, null or empty means no check" }] },
    {
      method: "POST", path: prefix + "/evaluate", description: "Evaluate the active policies on the selected branch and store the run. Every run it stores is a manual run.", parameters: [workspace],
      request_body: { type: "object", properties: {
        branch: { type: "string", description: "Branch label; empty selects live" },
        ai_modified: { type: "boolean", description: "Optional, default false. true records the run as made by an AI agent acting for the authenticated user" },
        policy: { type: "string", description: "Optional policy key (case-insensitive): a single-policy trial of that policy alone, even if inactive. Never stored or audited (stored: false, id 0), never the latest run, gates nothing; answers clear [{policy_key, rule_id, total, items}], each rule's first 100 objects examined without a finding. An unknown key is 404, a blank one is refused." },
        answer: { type: "string", description: "Optional: run (the default) or summary. summary answers the run as GET run/{run_id}/summary serves it instead, plus findings (its first 50, in the platform's order), total, truncated and stored, and a policy_check whose blocking_finding_ids name the blocking findings listed and whose blocking_total counts them all; the rest are on GET run/{run_id}/findings" },
      }, example: { branch: "dev", answer: "summary" } },
      response: { type: "object", description: "The run exactly as GET run/{run_id} serves it, plus stored and policy_check {status, message, blocking, run_id, blocking_finding_ids}; with answer: \"summary\", the run summary and its first 50 findings instead (see answer). stored: false with id 0 means no run was kept: nothing was active, or the caller is a read-only session or an OAuth token without workspace:write. With nothing active the answer is status not_applicable in policy_check and in the run itself, with no policies, results or findings; nothing is read, stored or audited." },
    },
    {
      method: "GET", path: prefix + "/run", description: "List the retained runs newest first, as summaries: the findings, per-rule results and policy snapshots are on the single run. Only a branch's newest twenty runs are retained.",
      parameters: [workspace, branch, { name: "limit", type: "integer", in: "query", default: 20, description: "How many runs to return, 1-20" }],
      response: { type: "object", description: "{items, curPage, nextPage, prevPage}; each item is {id, created_at, trigger, actor, started_at, finished_at, status, objects_checked, counts: {findings, blocking, errors}, policies: [{id, key, version, enforcement, status, findings, blocking, objects_checked}], branch}: each policy with its verdict in that run" },
    },
    { method: "GET", path: prefix + "/run/{run_id}", description: "Read one retained run in full: findings, per-rule results and the policies[] snapshot of what it checked (each policy's statement and, per rule, its label and resolved params). A run is served whole, all its findings included, so read a large one through its summary and findings pages below. An evicted run or another branch's answers 404 Policy run not found on this branch of the workspace, as its summary and findings do. Only a branch's newest runs are retained.", parameters: [workspace, branch, runId] },
    {
      method: "GET", path: prefix + "/run/{run_id}/summary", description: "Read one retained run without its findings: what it adds up to, stored with the run when it was kept (a run kept before summaries is summarised on read).",
      parameters: [workspace, branch, runId, { name: "object_limit", type: "integer", in: "query", default: 100, description: "The most objects the object facet names, 1-1000; facets.object.total counts them all" }],
      response: { type: "object", description: "{id, created_at, updated_at, trigger, actor, started_at, finished_at, status, objects_checked, branch, counts: {findings, blocking, advisory, errors}, policy_check, policies, results, zero_object_rules, facets}. policies is the snapshot, each policy with its verdict {status, findings, blocking, objects_checked}; each result carries its finding count (findings); zero_object_rules lists {policy_key, rule_id} for the rules with no_objects (or older pass with checked: 0); facets {policy, severity, kind, object: {items, total}, tag, object_tags_from} count the findings by each, split into blocking and advisory. policy_check is the verdict a Run checks run kept, with blocking_total in place of blocking_finding_ids, and null for other runs." },
    },
    {
      method: "GET", path: prefix + "/run/{run_id}/findings", description: "Read one page of a retained run's findings, in the platform's order, filtered and searched on the instance. A list filter matches a finding when any of its values does, and a page holds the findings that match every filter given. Send a list with indexed keys: policy[0]=A&policy[1]=B.",
      parameters: [
        workspace, branch, runId,
        { name: "offset", type: "integer", in: "query", default: 0, description: "How many matching findings to skip" },
        { name: "limit", type: "integer", in: "query", default: 100, description: "How many findings to return, 1-500" },
        { name: "blocking", type: "boolean", in: "query", description: "Optional: true keeps the blocking findings, false the advisory ones" },
        { name: "policy", type: "string[]", in: "query", description: "Policy keys" },
        { name: "rule", type: "string[]", in: "query", description: "Rule ids, such as AUTH-001.R1" },
        { name: "severity", type: "string[]", in: "query", description: "Severities: critical, high, medium, low" },
        { name: "kind", type: "string[]", in: "query", description: "Object kinds: query, function, table and the other kinds findings name" },
        { name: "object", type: "string[]", in: "query", description: "Objects, each written type:id, such as query:18" },
        { name: "tag", type: "string[]", in: "query", description: "Tags of the finding's policy (from the run's snapshot) or of its object (as the run read it)" },
        { name: "q", type: "string", in: "query", description: "Case-insensitive text in the policy key or title, rule title, object name or message" },
      ],
      response: { type: "object", description: "{items, total, objects, offset, limit}: items are the findings as the run stored them; total counts every finding that matches, and objects counts the distinct objects the matching findings name." },
    },
    {
      method: "GET", path: prefix + "/run/{run_id}/clear", description: "Page one rule's clear objects in a retained run: the objects it examined without a finding of its own. policy and rule are required (400 without them).",
      parameters: [workspace, branch, runId, { name: "policy", type: "string", required: true, in: "query", description: "Policy key" }, { name: "rule", type: "string", required: true, in: "query", description: "Rule id, such as AUTH-001.R1" }, { name: "offset", type: "integer", in: "query", default: 0, description: "How many to skip" }, { name: "limit", type: "integer", in: "query", default: 100, description: "How many to return, 1-500" }, { name: "q", type: "string", in: "query", description: "Case-insensitive text in the object name" }],
      response: { type: "object", description: "{items, total, offset, limit, recorded}; recorded is false for a run stored before clear objects were kept." },
    },
    {
      method: "GET", path: "/workspace/{workspace_id}/agent-skills",
      description: "Serve the generated xano-policies agent skill. One generator, three surfaces: studio (the default, the variant the Studio agent loads), cli (the variant xano skills pull writes) and mcp (the variant the authenticated MCP's xano_get_policy_skill serves). With digest=true and surface studio or mcp it also answers xano-active-policies, a budgeted digest of the branch's active policies (mandatory first, one line per rule) when the branch has one. Each surface has its own description. The check catalogue inside it is generated from the live registry at request time, so it can never document a check this instance does not have. A workspace knowledge record named xano-policies replaces the platform skill and is served instead. Needs the workspace:policy permission at read level, like the other policy routes.",
      parameters: [workspace, branch, { name: "surface", type: "string", in: "query", default: "studio", enum: ["studio", "cli", "mcp"], description: "Which variant of the generated skill to return" }, { name: "digest", type: "boolean", in: "query", default: false, description: "Also answer the xano-active-policies digest item" }],
      response: { type: "object", description: "{knowledge: [...]}: the same envelope as workspace knowledge, with one item named xano-policies whose knowledge_type is skill and whose content is the skill markdown. The platform's own item has id -101." },
    },
  ],
};
