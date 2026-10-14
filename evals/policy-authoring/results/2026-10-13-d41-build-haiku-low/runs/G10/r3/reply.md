# Plan

Your ask has three parts: agents must not delete anything or email customers without a human approving first, and agents may only call tools you have explicitly given them. Here is what I will build.

## Objects to build

- **table `approvals`** (`workspace/table/approvals.xs`): one row per approval. Holds the action (`delete_customer_note` or `send_customer_email`), the record it applies to, who asked, who approved, and when.
- **function `require_approval`** (`workspace/function/require_approval.xs`): looks for an approvals row for this action and record, approved by someone other than the requester. If none exists it stops with a precondition error, so the delete or email never runs.

## Changes to existing objects

- **tool `delete_customer_note`**: call `require_approval` before the `db.del`.
- **tool `send_customer_email`**: call `require_approval` before the `util.send_email`.

Nothing else changes. The agent's `tools` list stays as it is.

## Policy

Policy key **AGENT-001**, "Agents use only approved tools, and deletes and emails wait for approval." Two rules:

1. `agent.tool_allowlist` (template AI-001 pattern) on agent `Support Agent`: the approved tools are `lookup_order`, `delete_customer_note`, `send_customer_email`, `issue_refund`, the four tools the agent is configured with today. Any tool added to the agent later is reported.
2. `stack.statement_order` on tools: `require_approval` must run before every `db.del`, `db.bulk.delete` and `util.send_email`. Scoped to `object_kinds: ["tool"]`.

## Not covered

- Whether an approval is genuine. The policy checks that `require_approval` is called. It cannot check who clicked approve, or that the approval was given by a human.
- Runtime behaviour. Policies read stored definitions only, not the approvals table or requests.
- `issue_refund` is not a delete or an email, so it is not gated by the approval rule. It is in the allowlist only.
- Deletes in other places (for example `delete_user_account`, reached by `DELETE /account`) are not agent paths and are not gated here.

## Result

### What I built and changed

- **New table `approvals`**: `workspace/table/approvals.xs`. Records the action, the record, who asked, who approved and when.
- **New function `require_approval`**: `workspace/function/require_approval.xs`. Stops with an access-denied error unless an approval exists for this action and record, approved by someone other than the requester.
- **Changed tool `delete_customer_note`**: calls `require_approval` before `db.del`.
- **Changed tool `send_customer_email`**: calls `require_approval` before `util.send_email`.
- **New policy `AGENT-001`**: `workspace/policies/AGENT-001.xs`. Two rules: the agent's allowlist (`lookup_order`, `delete_customer_note`, `send_customer_email`, `issue_refund`), and approval-before-delete/email for tools.

Decisions I made for you, so you can redirect them:
- I treated the four tools already on Support Agent as the list you explicitly gave it. If you want a narrower list, edit `tools` in `AGENT-001.xs`.
- Deletes and emails are allowed with approval, not forbidden. The recipe's "AI tools cannot delete records" rule would block them outright, so I left it out.
- `issue_refund` is allowlisted but not approval-gated, since it is neither a delete nor an email. Say if you want it gated too.
- Tools have no logged-in caller, so `requested_by` is the constant `support-agent`. The email tool has no record id, so it passes `0`.

### Dry run

`xano workspace push -d ./workspace --dry-run` is clean. It would create the policy `AGENT-001`, the table `approvals` and the function `require_approval`, and update the two tools. `xano policy parse` warns that `require_approval` is not on the branch yet. That is expected, because the function is new in this change.

### Before you push

- **Nothing in this change makes a human approve anything.** The policy checks that the tools call `require_approval` before a delete or email. It cannot see who approved, or whether an approval row was written by a person. Build a way for a human to write `approvals` rows (an endpoint or admin screen) before relying on this.
- The policy reads stored definitions only. It does not check the approvals table at runtime, what requests send, or what the agent does on a live run.
- Deletes and emails outside agent tools are not gated. For example, `delete_user_account` (reached by `DELETE /account`) is not an agent path, so it is not covered here.
- `db.query ... return = {type: "count"}` in `require_approval` is my syntax guess. The dry run does not validate function bodies in depth, so test the approval path once before you push.
- The policy is `enforcement = "advisory"`, so it reports findings but does not block a push. Change it if you want a block.

### Confidence

Medium. The allowlist and the approval ordering are both checked by the platform. The approval itself is only as strong as the human process behind the `approvals` table, which no policy can see.
