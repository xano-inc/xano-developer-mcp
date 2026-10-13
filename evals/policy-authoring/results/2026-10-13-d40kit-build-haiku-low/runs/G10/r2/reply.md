# Plan

Your ask: AI agents must not delete anything or email customers without a human approving it first, and must not call tools you haven't given them.

I read the workspace: the Support Agent (`ai/agent/support_agent.xs`) has four tools. Two of them act on customers:

- `delete_customer_note` runs `db.del` on `customer_notes`.
- `send_customer_email` runs `util.send_email`.

`issue_refund` (charges Stripe) and `lookup_order` (read-only) are not in your ask, so they are left alone.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `approval_requests` | `table/approval_requests.xs` | One row per action an agent wants to take: the action, its target, and whether a human approved it. |
| function | `require_human_approval` | `function/require_human_approval.xs` | Loads an approval request by id and stops the call unless its status is `approved`. |

## Existing objects I will change

| Object | File | Change |
| --- | --- | --- |
| tool `delete_customer_note` | `ai/tool/delete_customer_note.xs` | Adds an `approval_id` input. Calls `require_human_approval` before the `db.del`. |
| tool `send_customer_email` | `ai/tool/send_customer_email.xs` | Adds an `approval_id` input. Calls `require_human_approval` before the `util.send_email`. |

Effect: both tools now refuse to run unless a human has marked a matching `approval_requests` row `approved`.

## Policy

Key `AGENT-010`, title "AI agents wait for human approval before deleting or emailing", advisory, active. Scoped to `tool` objects, so the agent's tools are judged and ordinary endpoints are not.

1. `stack.statement_order`: `before: {functions: ["require_human_approval"]}`, `after: ["db.del", "db.bulk.delete", "db.truncate", "util.send_email"]`. Every delete or email in an agent tool must follow the approval call. This is the recipe's approval rule, extended to truncate.

Templates: none fits this as a whole. `ai_cost_and_agent_safety` recipe covers the same approval idea; I took its rule and did not use its other rules, which the ask does not mention.

## What stays unchecked

- **"Can't call tools I haven't given them"**: no check limits which tools an agent exposes. The agent's `tools = [...]` list is the only control, and no policy reads it. This part is not covered.
- **Who approves**: the policy checks that the approval function runs and that it reads an `approved` row. It does not check who wrote that row or whether a person saw the request. Nothing I build creates an approval UI or endpoint for a human, so until you add one, approvals can only be set by hand in the table.
- **The agent passing its own approval id**: the agent could be given a tool that inserts an `approved` row. None exists today; keep it that way.
- **Existing `delete_customer_note` and `send_customer_email`**: the policy will report them until the approval call is wired into the agent flow. Agents will also need to pass an `approval_id`, which nothing supplies yet.
- **Refunds (`issue_refund`)**: not in your ask, so no rule covers it.
- **Policy severity/blocking**: I write the policy advisory. Making it blocking is the policy owner's choice.

# What I built and changed

- Built: `table/approval_requests.xs`, `function/require_human_approval.xs`, `policies/AGENT-010.xs`.
- Changed: `ai/tool/delete_customer_note.xs` and `ai/tool/send_customer_email.xs` (new `approval_id` input, approval call before the delete or email).
- Not changed: the agent's `tools` list, `issue_refund`, `lookup_order`.

`AGENT-010` parses. It has one remaining warning: `require_human_approval` is not on the branch yet. That is expected, because this change creates it.

# Dry run

`xano workspace push -d ./workspace --dry-run` (run from the project root) exited 0 and reported:

- CREATE policy `AGENT-010`
- CREATE table `approval_requests`
- CREATE function `require_human_approval`
- UPDATE tool `delete_customer_note`
- UPDATE tool `send_customer_email`

No blocked objects and no missing references were reported. I did not evaluate the policy and did not push.

# Before you push

- **Approvals have no way in yet.** Nothing lets a person set `status` to `approved`. Until you add an endpoint or Studio step for it, every delete and email from these two tools will be refused.
- **Agents don't know about approvals.** The two tools now require an `approval_id`. The agent has no flow that creates the request or passes its id, so the tools will fail in the agent until one exists.
- **Tool access is not controlled by any policy.** Which tools the agent may call is set only by its `tools` list. No check reads that list, so I did not build anything for it. Review the list yourself.
- **Approval is not verified.** The policy confirms that the approval function runs and reads an `approved` row. It does not confirm who approved, or that the human saw the exact action.
- **The policy is advisory.** It reports findings but does not block a push. Making it blocking is the policy owner's choice.
- **`issue_refund` is outside this policy.** It charges Stripe and is not covered by approval, since your ask named only deletes and emails.
