# Plan

## Objects to build

- **Table `audit_log`** (`workspace/table/audit_log.xs`): one row per change to a customer-email table. Holds who (`actor_id`), which table, which record, the action and when.
- **Function `record_audit_event`** (`workspace/function/record_audit_event.xs`): takes the table name, record id and action, and adds an `audit_log` row with the caller from `$auth`. It is the only code allowed to write `audit_log`.

## Changes to existing objects

Each one adds a call to `record_audit_event` right after the write, so the call always runs:

| Object | File | Change |
| --- | --- | --- |
| endpoint `customers` POST | `api/app/customers_POST.xs` | call the audit function after `db.add customers` |
| endpoint `customers/{customer_id}` PATCH | `api/app/customers/customer_id_PATCH.xs` | call the audit function after `db.patch customers` |
| endpoint `newsletter/subscribe` POST | `api/app/newsletter/subscribe_POST.xs` | call the audit function after `db.add newsletter_subscribers` (public endpoint; actor will be empty) |
| endpoint `auth/signup` POST | `api/app/auth/signup_POST.xs` | call the audit function after `db.add users` (public endpoint; actor will be empty) |
| endpoint `me` PATCH | `api/app/me_PATCH.xs` | call the audit function after `db.patch users` |
| function `delete_user_account` | `function/delete_user_account.xs` | call the audit function after `db.del users` |

No tags, field attributes, middleware or auth settings change.

## Policies

### `AUDIT-001`: Changes to customer-email tables are recorded
Audited tables: `customers`, `newsletter_subscribers`, `users`.

- Rule: `audit_log` exists (`workspace.object_required`, names `audit_log`).
- Rule: only `record_audit_event` writes `audit_log` (`table.write_location_restricted`, restricted `audit_log`, allowed function `record_audit_event`).
- Rules: every `db.add`, `db.edit`, `db.patch` and `db.del` on those three tables calls `record_audit_event` unconditionally (`object.statement_required`, four rules).

### `COST-001`: AI calls and retried requests stay out of loops
- Rule: `ai.agent.run` and `ai.external.mcp.tool.run` are never inside `foreach`, `for` or `while` (`statement.containment`).
- Rule: `api.request` is never inside `while` (`statement.containment`). This is the only check that touches the forever-retry; it does not bound retries.

## Not covered

- **Spend caps.** No check reads what AI calls cost or caps spend.
- **Task retries.** No check reads how often a failed task runs again. `retry_failed_webhooks` has no cap; a rule can only keep requests out of a `while`, not stop the task retrying.
- **`support_tickets.requester_email`.** Deliberately left out of `AUDIT-001`: its only writer is the nightly summary task, which edits inside a loop, so the unconditional-call rule cannot be met without a design decision. Decide with the owner.
- **`patients.email`**, `orgs.billing_email`: not customer tables in the sense asked; not audited.
- **Writes not visible by name.** Writes that reach a table through a function that is not in the list above are not seen.
- **Who made a change from a task or a public endpoint.** `actor_id` is empty there (no `$auth`).
- **Batch writes** (`db.bulk.*`) on the audited tables are not among the four statements.
- **Who may read the audit log**, and access reviews, sit outside the definitions.

## Known findings the policies will raise (not fixed here)

- `task/nightly_ticket_summaries.xs`: `ai.agent.run` inside a `foreach` (COST-001).
- `task/retry_failed_webhooks.xs`: `api.request` inside a `while` (COST-001).
- `api/app/me_PATCH.xs`: `db.patch users` takes its whole input (`$input[""]`), which includes `role` (not in AUDIT-001; outside this ask).

# What I built and changed

**Built**
- `workspace/table/audit_log.xs`: the audit table.
- `workspace/function/record_audit_event.xs`: the only writer of `audit_log`.
- `workspace/policies/AUDIT-001.xs`: audit trail for `customers`, `newsletter_subscribers`, `users`.
- `workspace/policies/COST-001.xs`: AI calls kept out of loops; `api.request` kept out of `while`.

**Changed** (one `function.run record_audit_event` added right after each write)
- `workspace/api/app/customers_POST.xs`
- `workspace/api/app/customers/customer_id_PATCH.xs`
- `workspace/api/app/newsletter/subscribe_POST.xs`
- `workspace/api/app/auth/signup_POST.xs`
- `workspace/api/app/me_PATCH.xs`
- `workspace/function/delete_user_account.xs`

Both policies are `active = true` and `enforcement = "advisory"`: they block nothing, and their findings are visible. Making either blocking is your call.

**Dry run** (`xano workspace push -d ./workspace --dry-run`, exit 0)
- Creates 2 policies, 1 table, 1 function. Updates 1 function and 5 endpoints.
- The first run was blocked by `delete_user_account`: `db.del` does not take `as`. I removed the `as $deleted` and the second run was clean.
- `xano policy parse` reported only "not on this branch" warnings for `audit_log` and `record_audit_event`, which this change creates. They should clear once it is pushed.
- Nothing was pushed. I did not run `xano policy evaluate`, so the outcome below is a prediction, not a result.

**Predicted findings after push** (not run)
- COST-001: `task/nightly_ticket_summaries.xs` (AI call inside `foreach`).
- COST-001: `task/retry_failed_webhooks.xs` (`api.request` inside `while`).
- AUDIT-001: I expect none, but the rule has not been evaluated.

## Before you push

- **The retry task is not fixed.** `retry_failed_webhooks` retries every 5 minutes with no cap. COST-001 flags it and cannot stop it. A cap needs a number from you.
- **The nightly summary task is not fixed.** Batching the AI calls out of the loop is a design change, so I did not make it.
- **`support_tickets` is not audited.** It stores `requester_email`, but its only writer is the nightly task, which updates inside a loop and so cannot satisfy the unconditional-call rule. Say if you want it included once that task is redesigned.
- **Audit rows from a task or a public endpoint have no actor.** `$auth` is empty there.
- **Sign-up and newsletter rows** are audited, but the actor is empty because both are public.
- **`me_PATCH` writes the whole input.** `db.patch users` takes `$input[""]`, which includes `role`. This is outside your ask; it is the kind of thing `AUTH-030` would catch.
- **Not covered:** spend caps, retry counts, batch (`db.bulk.*`) writes, `patients.email`, `orgs.billing_email`, who may read the audit log, and access reviews.
