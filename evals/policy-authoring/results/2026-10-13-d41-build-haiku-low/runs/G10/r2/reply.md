# Plan: keep support agents from deleting, from emailing without approval, and from using unlisted tools

## Objects to build

- **table `approvals`** (`workspace/table/approvals.xs`): one row per action a human must approve: `action`, `record_id`, `requested_by`, `approved_by`, `approved_at`. This is where approval lives.
- **function `require_approval`** (`workspace/function/require_approval.xs`): looks up the approvals row by `approval_id`. Stops with an access-denied precondition unless the row exists, its `action` matches, and `approved_by` is set.
- **endpoint `approvals/{approval_id}/approve` (POST)** (`workspace/api/app/approvals/approval_id/approve_POST.xs`): lets a logged-in human approve a row by setting `approved_by` to `$auth.id`. Without it, nobody can approve, so this is the human step.

## Changes to existing objects

- **`ai/agent/support_agent.xs`**: remove `delete_customer_note` from the agent's `tools` list. The agent can no longer enable it.
- **`ai/tool/send_customer_email.xs`**: add an input `approval_id` (int). Before `util.send_email`, call `require_approval` with action `send_customer_email`, so the email can only go out with an approved row.

## Policies

1. **`AI-001`** (template `agents_use_approved_tools`, active, advisory). Fill: `tools = ["lookup_order", "issue_refund", "send_customer_email"]`. Every tool the support agent enables must be one of these. Any new tool the agent gains is reported.
2. **`AI-010`** (own policy, active, advisory, three rules, all with `object_kinds: ["tool"]`):
   - `rules[0]`: `stack.statement_forbidden` with `db.del`, `db.bulk.delete`, `db.truncate`. Agent tools cannot delete. Also follows functions a tool calls.
   - `rules[1]`: `stack.statement_order` with `after: ["util.send_email"]`, `before.functions: ["require_approval"]`. Every email a tool sends must be preceded by the approval check.
   - (the `rules[2]` of the template recipe is not needed: no tool deletes, so no delete-before-approval rule.)

## What stays unchecked

- Whether a human actually reviewed the request before approving. The policy only sees that `approved_by` is set.
- Who creates `approvals` rows. Nothing in this change creates them; the product or staff workflow must.
- Emails sent outside agent tools, for example `acme_send_invoice_email`, `newsletter/subscribe`. The policy scopes to tools.
- Refunds (`issue_refund`) are not limited by this ask; they are on the allowlist as you listed them.
- `delete_user_account` (called by `DELETE /account`) is not agent-reachable, so it is out of scope.
- Runtime behaviour: which records an agent actually touches, and whether the model passes a valid `approval_id`.

---

# Result

## Built

- `table/approvals.xs`: the approvals table.
- `function/require_approval.xs`: stops with an access-denied error unless the approval exists, matches the action, and has `approved_by` set.
- `api/app/approvals/approval_id/approve_POST.xs`: `POST /approvals/{approval_id}/approve` sets `approved_by` to the logged-in user.

## Changed

- `ai/agent/support_agent.xs`: removed `delete_customer_note` from the agent's tools.
- `ai/tool/send_customer_email.xs`: new `approval_id` input; calls `require_approval` before `util.send_email`.

## Policies

- `policies/AI-001.xs` (template `agents_use_approved_tools`): the agent may enable only `lookup_order`, `issue_refund`, `send_customer_email`.
- `policies/AI-010.xs`: agent tools may not use `db.del`, `db.bulk.delete` or `db.truncate`; every `util.send_email` in a tool must come after `require_approval`.

Both are `active = true`, `enforcement = "advisory"`. Advisory means they report findings but block nothing. Making them blocking is your call; if you do, they would block any change that adds a finding.

## Parse

Both policy files parse. `AI-010` gives one warning: `require_approval` is not on the branch yet. That is expected because the function is part of this change.

## Dry run

`xano workspace push -d ./workspace --dry-run` passed (exit 0). It previewed: 2 policies created, 1 table, 1 function and 1 endpoint created, the agent and the `send_customer_email` tool updated. It reported no blocked objects and no missing references.

## Before you push

- **`ai/tool/delete_customer_note.xs` still exists** and still contains `db.del`. The agent no longer enables it, but `AI-010` checks tool objects directly, so it will be reported as a finding. Delete the file yourself if you don't need it; I did not delete it.
- **Nothing creates `approvals` rows.** A row must exist before a human can approve it, and the agent must be given its `approval_id`. The system prompt doesn't tell it to do that yet. Until then, the email tool will always refuse.
- **Refunds are not gated.** `issue_refund` moves money and is not covered by any approval. This was outside your ask; say if you want it added.
- **Emails outside agent tools are not covered**, for example `acme_send_invoice_email`. Those are not reachable from the agent, so the policy doesn't look at them.
- **Who may approve is not checked.** The approve endpoint accepts any logged-in user. The policy only sees that `approved_by` is set.
- **Not checkable here:** whether a human reviewed the request, what the agent actually does at runtime, and which records it touches.
