# Plan

Your ask has two parts that a policy can check, and one part it cannot.

## 1. AI calls inside a loop, and tasks that retry forever

**Objects to build:** none. The fix lives in code that already exists.

**Changes to existing objects:** none.

**Policy `COST-001`** (advisory, active):
- `statement.containment` on `ai.agent.run` and `ai.external.mcp.tool.run`: must not be inside `foreach`, `for` or `while`. This catches the $900 pattern. It flags `task/nightly_ticket_summaries`, which calls `ai.agent.run` inside a `foreach`.
- `stack.statement_forbidden` on `while` for `task` objects. This is an approximation: it bans the `while` loop in `task/retry_failed_webhooks`, which is the shape of the forever-retry. It does not catch retries written any other way.

**Not checkable:** spend caps (no check reads what an AI call costs), and task retry settings (tasks have none that a check can read).

## 2. Every table that stores customer emails is tracked for who changed what

**Objects to build:**
- Table `audit_log`: one row per change, with the table, the record id, the action, the actor and the time.
- Function `record_audit_event`: takes `table_name`, `record_id`, `action` and an optional `actor_id`, and adds one `audit_log` row with `db.add`.

**Changes to existing objects** (each gets one `function.run record_audit_event` call after its write):
- `api/app/customers_POST.xs`: `db.add customers`, action `create`.
- `api/app/customers/customer_id_PATCH.xs`: `db.patch customers`, action `update`.
- `api/app/auth/signup_POST.xs`: `db.add users` (public endpoint; the actor is the new user).
- `api/app/me_PATCH.xs`: `db.patch users`, action `update`.
- `api/app/newsletter/subscribe_POST.xs`: `db.add newsletter_subscribers` (public endpoint; no actor).
- `function/delete_user_account.xs`: `db.del users`, action `delete`.
- `function/summarize_ticket.xs`: `db.edit support_tickets`, action `update`.
- `task/nightly_ticket_summaries.xs`: `db.edit support_tickets`, action `update`.

**Tables treated as storing customer emails:** `customers`, `users`, `newsletter_subscribers`, `support_tickets` (`requester_email`), `patients`. `orgs.billing_email` is left out because it is a business contact, not a customer's email. The list is written into the rules by name; no tags are added.

**Policy `AUDIT-001`** (advisory, active):
- `workspace.object_required`: `audit_log` must exist (RET-001).
- `table.write_location_restricted`: only `record_audit_event` writes `audit_log`, and nothing edits or deletes an audit entry (RET-001).
- `object.statement_required` for `db.add`, `db.edit`, `db.patch` and `db.del` on the five tables above: each object that makes such a write must call `record_audit_event` unconditionally.

**Not checkable or not covered:**
- Bulk writes (`db.bulk.*`, `db.add_or_edit`, `db.truncate`) on these tables are not required to be audited.
- `object.statement_required` inspects only queries, tools, tasks and messages. Functions that write (`summarize_ticket`, `delete_user_account`) get the call, but a future write added to a function would not be flagged.
- Who the actor was, when the caller is anonymous, is not checkable.
- Access reviews and who may read the audit log are not checkable.

## Nothing else is built or changed.

Not built: any spend cap, any retry limit, any change to the nightly summary logic. Those are for you to decide.

---

# Result

## Built

- Table `audit_log`: `workspace/table/audit_log.xs`.
- Function `record_audit_event`: `workspace/function/record_audit_event.xs`. It is the only function that writes `audit_log`.
- Policy `COST-001` (advisory, active): `workspace/policies/COST-001.xs`. Two rules: AI agent and MCP tool calls must not sit inside `foreach`, `for` or `while`; tasks may not use `while`.
- Policy `AUDIT-001` (advisory, active): `workspace/policies/AUDIT-001.xs`. Six rules: `audit_log` exists; only `record_audit_event` writes it; `db.add`, `db.edit`, `db.patch` and `db.del` on `customers`, `users`, `newsletter_subscribers`, `support_tickets` and `patients` each call `record_audit_event` unconditionally.

## Changed

Each change adds one `function.run record_audit_event` call directly after the write:

- `api/app/customers_POST.xs`: create, actor is the logged-in user.
- `api/app/customers/customer_id_PATCH.xs`: update, actor is the logged-in user.
- `api/app/auth/signup_POST.xs`: create, actor is the new user (the endpoint is public).
- `api/app/me_PATCH.xs`: update, actor is the logged-in user.
- `api/app/newsletter/subscribe_POST.xs`: create, no actor (public endpoint).
- `function/delete_user_account.xs`: delete, actor is the user being deleted.
- `function/summarize_ticket.xs`: update, no actor (the function has no caller identity).
- `task/nightly_ticket_summaries.xs`: update, no actor (scheduled task).

No endpoint's access, no table's fields and no existing data changed.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0. It would create `AUDIT-001`, `COST-001`, `audit_log` and `record_audit_event`, and update `delete_user_account`, `summarize_ticket`, `nightly_ticket_summaries`, `auth/signup POST`, `customers/{customer_id} PATCH`, `customers POST`, `me PATCH` and `newsletter/subscribe POST`. It reported no blocked objects and no missing references.

`xano policy parse` passed for both policy files. For `AUDIT-001` it printed warnings that `audit_log` and `record_audit_event` are not on the branch yet. Those names come from this change, so the warnings are expected.

I did not run `xano policy evaluate` or a real push, as the brief forbids them. So I have no finding list. Expect these findings once the change is pushed:

- `COST-001`: `task/nightly_ticket_summaries` calls `ai.agent.run` inside a `foreach`. This is the $900 pattern, and the policy will flag it. Fixing it means changing how the nightly summary runs (for example, one batched call, or a cap on tickets per run). That is your decision, so I did not change it.
- `COST-001`: `task/retry_failed_webhooks` uses `while ($delivered == false)`. The policy will flag it. This is the forever-retry. Replacing the loop with a bounded retry is your decision.

## What to know before pushing

- **Both policies are advisory.** They report findings but block nothing. Making them blocking is your call, and it would block any push that adds a finding.
- **Spend is not capped.** Nothing here reads what an AI call costs. The `COST-001` rules keep AI calls out of loops and stop the `while` retry shape. They do not stop a single run from being expensive, and they do not limit how many times a task runs.
- **Task retries are not bounded by a check.** The `while` rule catches that one loop shape. A retry written with recursion, or a `foreach` over a list that never empties, is not caught.
- **Audit covers only the listed tables and only single-record writes.** Bulk writes (`db.bulk.*`, `db.add_or_edit`, `db.truncate`) on those tables are not required to be audited.
- **Functions are not inspected by the call rules.** The `object.statement_required` checks only look at queries, tools, tasks and messages. I added the audit call to the two functions that write, but a future write added inside a function would not be flagged.
- **The table list is my judgement.** I treated `customers`, `users`, `newsletter_subscribers`, `support_tickets` and `patients` as storing customer emails. I left out `orgs.billing_email`. Please check the list.
- **The audit trail records who and when, not what changed.** `audit_log` holds the table, record id, action, actor and time. It does not hold the old and new values.
- **Who can read `audit_log` is not checked.** No check reads which roles can query that table.

## Not touched, seen in passing

- `function/acme_notify_sms.xs` has a Twilio credential written into the URL. A secret check (SEC-012) would flag it. I did not change it, because it is outside this ask.
- `api/app/me_PATCH.xs` accepts a `role` input. A check for self-promotion (AUTH-030) would flag it. Not in this ask, so I left it.
