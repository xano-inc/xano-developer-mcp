# Plan

Three things you asked for, and what each one can and cannot do.

## 1. Stop AI calls from running up cost in loops

**Objects built:** none.

**Changes to existing objects:**
- `task/retry_failed_webhooks` (`workspace/task/retry_failed_webhooks.xs`): replace the unbounded `while` retry loop with a fixed `for` of 5 attempts per delivery. A delivery that still fails is marked `retry_exhausted` instead of being re-selected on every run.

**Policies:**
- `AI-COST-001` (custom, active, advisory). Rule: `statement.containment` on `ai.agent.run` and `ai.external.mcp.tool.run`, forbidden inside `foreach`, `for`, `while`. It keeps any AI call out of a loop. It will report `task/nightly_ticket_summaries`, which calls `ai.agent.run` inside a `foreach`. I am not rewriting that task, because removing the loop changes what it does. That finding is yours to decide on.

## 2. Stop a background task retrying forever

**Policies:**
- `TASK-001` (custom, active, advisory). Rule: `stack.statement_forbidden` forbids `while` in tasks. This is a proxy. No check reads task retry settings, so this only stops the unbounded-loop shape a task uses to retry. It is not a retry limit.

**Gap:** how often a failed task runs again is not checkable. The change in section 1 bounds the retry inside one run. The scheduled task still runs every 5 minutes, but a delivery is marked `retry_exhausted` after its 5 attempts and is no longer selected.

## 3. Track who changed customer email data

**Objects built:**
- `table/audit_log` (`workspace/table/audit_log.xs`): append-only record with actor, table, record, action, time.
- `function/record_audit_event` (`workspace/function/record_audit_event.xs`): writes one `audit_log` row.

**Changes to existing objects:** add the tag `customer-email` to the five tables that hold customer email addresses:
- `customers` (`email`)
- `newsletter_subscribers` (`email`)
- `support_tickets` (`requester_email`)
- `users` (`email`)
- `patients` (`email`)

I am tagging the tables only. The endpoints and functions that edit or delete these tables do not yet call `record_audit_event`, so the policy will report them. Wiring them is a separate change you should review.

**Policies:**
- `RET-001` (template `audit_log_protected`, active, advisory). Rules: `audit_log` must exist; only `record_audit_event` may write to `audit_log`.
- `AUDIT-001` (custom, active, advisory). Rules, in order:
  1. Every table with an `email` field carries the tag `customer-email` (`table.tag_required`). This also catches future tables.
  2. Any object reaching a `customer-email` table requires login and calls `record_audit_event` unconditionally (`object.tagged_table_access`).
  3. Edits (`db.edit`) of the five tables call `record_audit_event` (`object.statement_required`).
  4. Patches (`db.patch`) of the five tables call it.
  5. Deletes (`db.del`) of the five tables call it.

**Gap:** the policy checks that the audit call is written in the code. It does not check that the audit row is correct, that the actor is the real user, or that the audit table is backed up or retained.

## Not covered

- Cost ceilings and spend caps: no check reads what AI calls cost. The loop rule limits the shape, not the amount.
- Retry limits and backoff for tasks: not checkable.
- Who approved a change: outside the workspace definitions.
- Runtime data: policies read stored definitions only, not records.

## Build order
1. Write `audit_log` table and `record_audit_event` function.
2. Tag the five tables.
3. Bound the webhook retry task.
4. Write four policy files, parse each.
5. Dry-run push, fix what it reports.

---

# What I built and changed

**Built:**
- `workspace/table/audit_log.xs`: `audit_log` table.
- `workspace/function/record_audit_event.xs`: writes one `audit_log` row (actor, table, record, action).

**Changed:**
- `workspace/table/customers.xs`, `newsletter_subscribers.xs`, `support_tickets.xs`, `users.xs`, `patients.xs`: added tag `customer-email`.
- `workspace/task/retry_failed_webhooks.xs`: the `while` retry loop is now `for (5)`. A delivery that still fails after 5 attempts is set to `retry_exhausted`, so later runs stop selecting it. The task still runs every 5 minutes.

**Policies** (`workspace/policies/`, all `active = true`, `enforcement = "advisory"`):
- `AI-COST-001`: AI agent runs and MCP tool runs may not be inside `foreach`, `for` or `while`.
- `TASK-001`: tasks may not use `while`. This is a proxy for unbounded retries, not a retry limit.
- `RET-001`: template `audit_log_protected`. `audit_log` must exist, and only `record_audit_event` may write to it.
- `AUDIT-001`: every table with an email field is tagged `customer-email`. Anything reaching those tables requires login and calls `record_audit_event`. Every edit, patch and delete of the five tables calls it.

All four parse. The parse warnings that name `record_audit_event`, `audit_log` and the `customer-email` tag are expected: those objects are in this change and not yet on the branch.

## Dry run

`xano workspace push -d ./workspace --dry-run` reported no blocked objects and no missing references:

- Policy: +4 created
- Tables: +1 created, 5 updated
- Functions: +1 created
- Tasks: 1 updated

I did not run `xano policy evaluate`, so I have no actual findings. From reading the code, expect these to report once you push:

- `AI-COST-001`: `task/nightly_ticket_summaries`, which calls `ai.agent.run` inside a `foreach`. **This is the loop that cost money, and I did not change it.** Fixing it means removing the AI call from the loop, for example by batching tickets into one call. That changes what the task does, so it's your decision.
- `AUDIT-001`: `delete_user_account` (`db.del users`), `customer_id_PATCH` (`db.patch customers`), `me_PATCH` (`db.patch users`), `summarize_ticket` and `nightly_ticket_summaries` (`db.edit support_tickets`). The tagged-access rule will also flag endpoints that reach these tables without the audit call, including the public `auth/signup_POST` and `newsletter/subscribe_POST`. The write rules cover edit, patch and delete only, so inserts such as `customers_POST` are reported only by the tagged-access rule.
- `RET-001` and `TASK-001`: no findings expected.

## Before you push

- **Who changed what is not complete.** The audit table and function exist, but the endpoints and functions that write customer email data do not call `record_audit_event` yet. Until they do, `AUDIT-001` reports them and the audit log will miss those changes.
- **Policies are advisory.** They report findings but block nothing. Making any of them blocking is your call, and it would block merges and pushes to live that introduce a finding.
- **Not covered by any check:** how much AI calls cost or cap spend; how often a task retries and its backoff; who approved a change; the actual data in tables; retention age of the audit log.
- **Retry behaviour changed.** A webhook that fails all 5 attempts in one run is now marked `retry_exhausted` and is never retried again automatically. Check that this is what you want before you push.
- **`users` tagged.** I treated your app users as customers for the email tag. If `users` holds only staff or internal accounts, remove the tag and its audit rules change with it.
