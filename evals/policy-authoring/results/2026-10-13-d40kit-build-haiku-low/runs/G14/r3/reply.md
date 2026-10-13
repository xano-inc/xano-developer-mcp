# Plan: cost guard and customer-email audit trail

Your two asks map to three policies, backed by one new audit table and one new audit function.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `audit_log` | `workspace/table/audit_log.xs` | One row per change: which table, which record, what action, who did it, when. |
| function | `record_audit_event` | `workspace/function/record_audit_event.xs` | The only code that writes `audit_log`. Each customer-data write calls it right after the write. |

## Changes to existing objects

Each change adds one `function.run record_audit_event` call directly after a write to a customer-email table (`customers`, `users`, `newsletter_subscribers`).

| Object | File | Change |
| --- | --- | --- |
| `customers_POST` (query) | `workspace/api/app/customers_POST.xs` | Audit the `db.add customers`. |
| `customers/{customer_id}` PATCH (query) | `workspace/api/app/customers/customer_id_PATCH.xs` | Audit the `db.patch customers`. |
| `newsletter/subscribe` POST (query) | `workspace/api/app/newsletter/subscribe_POST.xs` | Audit the `db.add newsletter_subscribers`. |
| `auth/signup` POST (query) | `workspace/api/app/auth/signup_POST.xs` | Audit the `db.add users`. |
| `me` PATCH (query) | `workspace/api/app/me_PATCH.xs` | Audit the `db.patch users`. |
| `delete_user_account` (function) | `workspace/function/delete_user_account.xs` | Audit the `db.del users`. |

No existing behaviour changes beyond the audit row. I am not changing any retry or AI-call logic here (see "Proposed, not built" below).

## Policies

1. **`RET-001`** (template `audit_log_protected`, SOC 2 and HIPAA). Rules:
   - `workspace.object_required` with `names: ["audit_log"]`: the audit table must exist.
   - `table.write_location_restricted` with `restricted_tables: ["audit_log"]` and `allowed_functions: ["record_audit_event"]`: only that function writes the audit log, and nothing edits or deletes an entry.
2. **`CUSTOMER-EMAIL-AUDIT`** (custom; no template covers "who changed what" for named tables). Rules, each `object.statement_required` with `functions: ["record_audit_event"]`, `placement: "unconditional"`, scoped by `when.tables: ["customers", "users", "newsletter_subscribers"]`:
   - one rule for `db.add`,
   - one for `db.patch`,
   - one for `db.edit`,
   - one for `db.del`.
3. **`SPEND-GUARD`** (custom; cost and runaway-loop guard). Rules:
   - `statement.containment` on `ai.agent.run` and `ai.external.mcp.tool.run` with `must_not_be_inside: ["foreach", "for", "while"]`: no AI call inside a loop.
   - `statement.containment` on `api.request` with `must_not_be_inside: ["while"]`, scoped to `object_kinds: ["task"]`: a task cannot make an outbound request inside a `while` loop. This is a **proxy** for "retries forever": it catches the `while` shape, not a retry counted with a `for` or a `foreach`.

## What stays unchecked

- **Dollar spend.** No check reads what an AI call costs or caps spend.
- **Task retries.** No setting exists that a check can read. The proxy above is the only coverage, and it does not bound retries.
- **Table coverage beyond the three named tables.** `support_tickets` also stores `requester_email`. I am leaving it out of the audit scope (its writes are AI-summary updates, not contact changes). Say so if you want it in.
- **Function writes under `CUSTOMER-EMAIL-AUDIT`.** `object.statement_required` judges query, tool, task and message objects, not functions. The `delete_user_account` call is in place, but no rule reads it.
- **Who made the change.** `actor_id` comes from the signed-in user; public signup has none. Nothing checks that a caller is authenticated at runtime.
- **Runtime data, retention age, people and training, infrastructure.** Policies read definitions only.

## Proposed, not built (your decision)

- Batch or move the AI summary call out of the `foreach` in `nightly_ticket_summaries`. `SPEND-GUARD` will report it until you do.
- Add a retry cap to `retry_failed_webhooks`. It loops with `while` until a 200 arrives; `SPEND-GUARD` will report it until you do.

## What I built and changed

I built the two objects above and changed the six write sites listed in the plan. Each change is one `function.run record_audit_event` call placed right after the write. I wrote three policy files: `workspace/policies/RET-001.xs`, `workspace/policies/CUSTOMER-EMAIL-AUDIT.xs` and `workspace/policies/SPEND-GUARD.xs`. All three parse with `xano policy parse`. The only warnings were that `audit_log` and `record_audit_event` do not exist on the branch yet, which this change creates.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0 and reported no blocked objects and no missing references:

- Policies: 3 created (`CUSTOMER-EMAIL-AUDIT`, `RET-001`, `SPEND-GUARD`).
- Table: 1 created (`audit_log`).
- Functions: 1 created (`record_audit_event`), 1 updated (`delete_user_account`).
- Endpoints: 5 updated (`customers POST`, `customers/{customer_id} PATCH`, `newsletter/subscribe POST`, `auth/signup POST`, `me PATCH`).

The dry run validates and previews only. It does not evaluate policies, so I have not yet seen which findings the rules produce. Expect `SPEND-GUARD` to report two existing objects: `nightly_ticket_summaries` (an AI call inside a `foreach`) and `retry_failed_webhooks` (an outbound request inside a `while`). I left both untouched on purpose.

## Before you push

- **Nothing is evaluated yet.** Run the push, or `xano policy evaluate`, after you review the change to see the findings.
- **Two existing behaviours will show findings.** Both are yours to decide. The AI summary call inside the loop costs money per ticket. The webhook retry loops until a 200 arrives, with no cap.
- **`me PATCH` has a separate problem I did not touch.** It accepts a `role` input and passes `$input[""]` straight into `db.patch users`, so a signed-in user may be able to set their own role. No rule in this change covers that. It needs its own policy (`AUTH-030`'s check, `db.write_from_input_forbidden`) and a fix you approve.
- **The audit trail covers writes from endpoints and the one delete function, not every path.** `support_tickets` also stores customer email addresses (`requester_email`). I left it out of the audit scope because its writes are AI-summary updates. Tell me if you want it in.
- **Who changed what is only as good as the caller.** `actor_id` comes from the signed-in user. Public signup and the newsletter form record no actor.

## What no object or policy here can see

- Dollar spend and spend caps. No check reads what AI calls cost.
- Task retry limits. Tasks have no retry setting a check can read. `SPEND-GUARD` only catches the `while` shape of a retry loop.
- How long audit entries are kept. Retention age is not checked.
- Runtime data, people and training, infrastructure. Policies read stored definitions only.
