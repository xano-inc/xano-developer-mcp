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
  rule AUTH-EXAMPLE.R1 {
    check = "query.auth_required"
    params = { public_tag: "public" }
  }
}`;

export const policyDoc: TopicDoc = {
  topic: "policy",
  title: "Workspace Policies (MVP)",
  description: `Policies are branch-scoped workspace XanoScript objects combining a human description and deterministic check rules. These endpoints require a platform build with policy support. Discover supported checks and their exact parameter schemas from the instance; do not invent checks or parameters.

Read, parse and evaluate require the dedicated workspace:policy read scope. Creating, updating and deleting also require the corresponding scope and an admin/explore role. Existing tokens may need to be reissued. A template is only a seed: save an ordinary policy with no template association.

The native platform parses and formats policy source. Send source alone inside data, or structured fields without source. Never send both. Versions and canonical source are server-owned. An evaluation stores a run and its findings; it does not modify the policy. Mandatory findings block a merge, and push feedback follows the import rather than rolling it back. Evaluation infrastructure errors are reported separately from findings.

Only static checks are supported. Runtime guards, decision logs and executable policy test blocks are reserved for future releases. A check passing is not proof of runtime behavior or compliance.`,
  ai_hints: `Use the authenticated Xano MCP policy tools when available. Their workspace and instance come from the authenticated request, not tool arguments. The standalone developer MCP offers documentation and local language-server validation; it does not carry a workspace credential. Validate policy source with the native policy/parse endpoint, not a second local policy grammar. Do not infer current status from a run made before the most recent policy or workspace changes.`,
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
      description: method === "POST" ? "Create a policy on the selected branch." : "Update the selected branch's existing policy; the server increments its version.",
      parameters: method === "POST" ? [workspace] : [workspace, policyId],
      request_body: { type: "object", properties: {
        branch: { type: "string", description: "Branch label; empty selects live" },
        data: { type: "object", required: true, description: "{source: canonical XanoScript}; omit all structured fields when supplying source" },
      }, example: { branch: "dev", data: { source: policyExample } } },
    })),
    { method: "DELETE", path: prefix + "/{policy_id}", description: "Soft-delete a policy on the selected branch.", parameters: [workspace, policyId, branch] },
    {
      method: "POST", path: prefix + "/evaluate", description: "Evaluate active policies against the selected branch and store the run.", parameters: [workspace],
      request_body: { type: "object", properties: {
        branch: { type: "string", description: "Branch label; empty selects live" },
        trigger: { type: "string", description: "manual for an explicit check; push for post-import feedback" },
      }, example: { branch: "dev", trigger: "manual" } },
    },
    { method: "GET", path: prefix + "/run", description: "List retained runs newest first; at most twenty runs are retained per branch.", parameters: [workspace, branch, { name: "limit", type: "integer", in: "query", description: "Maximum number of runs to return" }] },
    { method: "GET", path: prefix + "/run/{run_id}", description: "Read one retained run on the selected branch.", parameters: [workspace, branch, { name: "run_id", type: "integer", required: true, in: "path", description: "Run ID" }] },
  ],
};
