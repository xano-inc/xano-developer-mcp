# Plan: keep AI agents from deleting, from emailing without approval, and from using unlisted tools

Your agent is `Support Agent` (`workspace/ai/agent/support_agent.xs`). It currently enables four tools: `lookup_order`, `delete_customer_note`, `send_customer_email`, `issue_refund`. Two of those break your ask today: `delete_customer_note` deletes, and `send_customer_email` emails with no approval step.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `approvals` | `workspace/table/approvals.xs` | One row per action a human has approved: the action, its target, its status and who approved it. |
| function | `require_approval` | `workspace/function/require_approval.xs` | Looks for an `approved` row in `approvals` for the given action and target. Stops with a precondition error when there is none. |

## Changes to existing objects

| Kind | Name | File | Change |
| --- | --- | --- | --- |
| tool | `send_customer_email` | `workspace/ai/tool/send_customer_email.xs` | Calls `require_approval` (action `send_customer_email`, target = the recipient address) before `util.send_email`, so an email goes out only once a human has approved it. |

No other existing object changes. I am not removing `delete_customer_note` from the agent, and I am not changing the agent's tool list. Those are your decisions. The policy will report them.

## Policy

**`AI-001`** (template: AI agents use only approved tools, severity high)
- Rule: `agent.tool_allowlist` on `object_kinds: ["agent"]`, with `tools: ["lookup_order", "send_customer_email", "issue_refund"]`.
- What it keeps true: the agent enables only these three tools. `delete_customer_note` is reported as an unapproved tool.
- Assumption: I took the three tools other than `delete_customer_note` as your explicit approvals. Tell me if `issue_refund` should not be on the list.

**`AGENT-GUARD`** (own key, advisory, active)
- Rule 1: `stack.statement_forbidden` with `statements: ["db.del", "db.bulk.delete", "db.truncate"]` and `object_kinds: ["tool"]`. Keeps every AI tool from deleting records, including through functions it calls. `delete_customer_note` is reported here.
- Rule 2: `stack.statement_order` with `before: {functions: ["require_approval"]}` and `after: ["util.send_email"]`, on `object_kinds: ["tool"]`. Keeps each tool's email send behind a call to `require_approval`. `send_customer_email` passes once the change above is in place.

Both policies are advisory: they block nothing and their findings are visible. Making either one blocking is your decision, and it would block any push that introduces a finding.

## What stays unchecked

- **Who approves.** No endpoint or screen is built for a human to approve an action. Someone must insert `approvals` rows with `status = "approved"`. That is outside what I built, and no policy can see it.
- **Whether the approver is a different person from the requester.** `require_approval` checks that an approved row exists. It does not compare the approver with the requester.
- **What the approval covers.** The check confirms a call to `require_approval` comes first. It does not check that the function's decision is right.
- **Deletes outside tools.** Rule 1 covers tools only. Ordinary endpoints can still delete.
- **Email outside tools.** Rule 2 covers tools only. `acme_send_invoice_email` and other non-agent functions are not judged.
- **Tool use at run time.** The allowlist checks the agent's enabled tools in the definition. It cannot see what the model asks the agent to do.
- **Refund limits.** `issue_refund` moves money. No check limits its amount or asks for approval.
- **Spend and retries.** Not covered by any check.

## Result

### Built
- Table `approvals` (`workspace/table/approvals.xs`): action, target, status (`requested | approved | rejected`), requested_by, approved_by.
- Function `require_approval` (`workspace/function/require_approval.xs`): finds an `approved` row for the action and target; stops with `precondition` otherwise.

### Changed
- Tool `send_customer_email` (`workspace/ai/tool/send_customer_email.xs`): calls `require_approval` with action `send_customer_email` and the recipient as target, before `util.send_email`.

### Policies (`workspace/policies/`)
- `AI-001` (template, advisory, active): `agent.tool_allowlist` on agents, tools = lookup_order, send_customer_email, issue_refund.
- `AGENT-GUARD` (advisory, active):
  - `stack.statement_forbidden`: no db.del, db.bulk.delete or db.truncate in tools.
  - `stack.statement_order`: require_approval before util.send_email in tools.

Both parse. The parser warns that `require_approval` is not on the branch yet, which is expected because this change creates it.

### Dry run
`xano workspace push -d ./workspace --dry-run` exited 0 and reported: 2 policies created, 1 table created, 1 function created, 1 tool updated. No blocked objects or missing references. I have not run `xano policy evaluate`, so I do not know what the findings will be yet.

### Expected findings (predictions, not yet run)
- `delete_customer_note` (tool, Support Agent): AGENT-GUARD flags its db.del. AI-001 flags it as not on the approved list.
- `issue_refund`: not a delete or email, so no rule flags it. It is on the approved list only because I took it from the agent's current tools.

### Before you push
1. **Nobody can approve yet.** I built no endpoint or screen for a human to approve. Until one exists, someone must insert `approvals` rows with `status = "approved"`, or `send_customer_email` will always stop.
2. **The approver is not checked against the requester.** `require_approval` checks only that an approved row exists.
3. **Remove `delete_customer_note` from the agent** (or otherwise decide what to do with it). I did not change the agent. The policy will keep reporting it until you do.
4. **Confirm the tool list.** `issue_refund` moves money and has no amount limit or approval step. It is on the approved list because it is on the agent today.
5. **Both policies are advisory.** They block nothing. Making either one blocking is your call, and then any push that introduces a finding would be refused.

### What no check can see
- Who approves an action, and whether they should.
- What the model asks an agent to do at run time, or whether it tries to call a tool that is not enabled.
- Deletes and emails outside tools. `acme_send_invoice_email` and any ordinary endpoint can still send or delete. The rules cover AI tools only.
- Refund amounts, spend, and task retries.
