# Plan: keep AI agents from deleting records or emailing customers without approval

## What I found

- Two agents: `Support Agent` (4 tools: `lookup_order`, `delete_customer_note`, `send_customer_email`, `issue_refund`) and `Ticket Summarizer` (no tools).
- `delete_customer_note` deletes a row (`db.del customer_notes`).
- `send_customer_email` sends mail (`util.send_email`) straight away, with no approval step.
- No policies exist in the workspace yet.

## Objects I will build

| Kind | Name | File | What it does |
|---|---|---|---|
| table | `email_approvals` | `workspace/table/email_approvals.xs` | One row per email a person must approve: recipient, subject, body, and `status` (`pending`, `approved`, `rejected`, `sent`). |
| function | `require_human_approval` | `workspace/function/require_human_approval.xs` | Loads the approval row by id and stops the call with a precondition error unless `status` is `approved`. |

## Changes to existing objects

| Kind | Name | File | Change |
|---|---|---|---|
| tool | `send_customer_email` | `workspace/ai/tool/send_customer_email.xs` | Adds an input `approval_id` and calls `require_human_approval` with it before `util.send_email`. Nothing else changes. |

I will not change `delete_customer_note`. Removing it from the agent or from its stack changes behaviour, so that is your call. The policy below will report it.

## Policy `HITL-001`

No template fits: the closest recipe is "Keep AI calls affordable and agents safe", and I am using its approval and delete rules. The key is my own, not a template prefix. Written `active = true` and `advisory`, so it blocks nothing and its findings are visible.

1. **`stack.statement_forbidden`**, `{statements: ["db.del", "db.bulk.delete", "db.truncate"], object_kinds: ["tool"]}`
   Keeps AI tools from deleting records. This also covers deletes made inside any function a tool calls. It will flag `delete_customer_note`.
2. **`stack.statement_order`**, `{before: {functions: ["require_human_approval"]}, after: ["util.send_email"], object_kinds: ["tool"]}`
   Requires the approval check to run before any tool sends email. The check confirms the call comes first. It does not confirm what the approval record says.

I left deletes out of rule 2's `after` list. Tools cannot delete at all under rule 1, so an approval before a delete would never be needed.

## What stays unchecked

- **Tools an agent was not given.** No check limits which tools an agent may expose. Rule 1 only stops tools from deleting. The agent's `tools` list is still the only control. This is a gap in the platform.
- **Who sets an approval to `approved`.** Nothing I build creates or approves rows. A person needs a real review step, outside Xano. Until then, anything that can write to `email_approvals` can approve.
- **`issue_refund`.** It moves money but is neither a delete nor an email, so no rule here covers it.
- **Runtime behaviour.** Policies read definitions only. They cannot see what the agent actually sends or whether a person reviewed it.
- **Blocking.** The policy is advisory. Making it blocking is its owner's choice.

## Checks I will run

- `xano policy parse` on the policy file.
- `xano workspace push -d ./workspace --dry-run`. Only the dry run, never a real push.

## What I built and changed

- **Built** `email_approvals` table: `workspace/table/email_approvals.xs`.
- **Built** `require_human_approval` function: `workspace/function/require_human_approval.xs`. It loads the approval row and stops the call unless `status` is `approved`.
- **Changed** `send_customer_email` tool: `workspace/ai/tool/send_customer_email.xs`. It now takes `approval_id` and calls `require_human_approval` before `util.send_email`.
- **Built** policy `HITL-001`: `workspace/policies/HITL-001.xs`, advisory, active. Two rules, as planned.

## Checks run

- `xano policy parse ./workspace/policies/HITL-001.xs` (exit 0). One rule warning, as expected: `HITL-001.R2: Function "require_human_approval" is not on this branch, so it never satisfies this rule.` It clears once the push creates the function.
- `xano workspace push -d ./workspace --dry-run` (exit 0). Output:
  - `CREATE policy HITL-001`
  - `CREATE table email_approvals`
  - `UPDATE tool send_customer_email`
  - `CREATE function require_human_approval`
  - No blocked objects or missing references were reported.
- I did not run `xano policy evaluate`. Only the dry run was permitted.

## Before you push

- **`delete_customer_note` will be flagged** by `HITL-001.R1`. It runs `db.del`, so the policy will report it. I did not change it. To clear the finding, remove the delete step or remove the tool from the Support Agent. Both change behaviour, so that is your call.
- **Approvals need a real review step.** Nothing I built creates or approves rows. Until you build that, anything that can write to `email_approvals` can approve. A check cannot see who approved a row.
- **Not covered: which tools an agent may use.** No check limits an agent's tool list. Your `tools = [...]` list in `support_agent.xs` is the only control, so review it by hand.
- **`issue_refund` is not covered.** It moves money, but it is neither a delete nor an email.
- **The policy is advisory.** Making it blocking is your call, and it would block merges, saves and pushes that add a finding.
- **The approval check confirms order, not content.** `HITL-001.R2` confirms `require_human_approval` runs before the send. The function itself decides whether to allow it.
