# Plan

## Objects to build

- **table `email_change_log`** (`workspace/table/email_change_log.xs`): one row per change to a customer-email record: who (`actor_id`), which table and record, what action, when.
- **function `record_email_change`** (`workspace/function/record_email_change.xs`): adds one `email_change_log` row with `actor_id` from `$auth.id`. Every object that writes a customer-email table calls it unconditionally.

## Changes to existing objects

- **task `retry_failed_webhooks`**: remove the unbounded `while` loop. Each run makes one attempt per failed delivery that has fewer than 5 attempts; after the fifth failed attempt the delivery is set to `abandoned`. Uses the existing `webhook_deliveries.attempts` field, so no schema change.
- **task `nightly_ticket_summaries`**: delete. It calls the AI summariser once per open ticket inside a `foreach`, which is the loop that cost money. Nothing else calls it. `summarize_ticket` stays for on-demand use.
- **tables holding customer emails** (`customers`, `users`, `newsletter_subscribers`, `patients`, `support_tickets`, `orgs`): add the table tag `customer-email`. These are the tables with an email-type field (`orgs` has `billing_email`).

## Policies

1. **RET-001** (template `audit_log_protected`, "Only the audit function writes the audit log"): `workspace.object_required` names `email_change_log`; `table.write_location_restricted` restricts `email_change_log` to `record_email_change`.
2. **AUDIT-010** (own policy): 
   - `table.tag_required` requires the tag `customer-email` on tables with the fields `email`, `requester_email` or `billing_email`.
   - `object.statement_required` requires `record_email_change` to run unconditionally in every object that reaches a `customer-email` table.
3. **COST-010** (own policy): `statement.containment` forbids `ai.agent.run`, `ai.external.mcp.tool.run` inside `foreach`, `for` and `while`.
4. **COST-020** (own policy): `stack.statement_forbidden` forbids `while` in every object, so no loop can run without a bound.

## What stays unchecked

- **Spend.** No check reads what AI calls cost or caps spend. COST-010 only stops AI calls inside loops; many single calls can still add up. Set a spend cap in the billing console.
- **Task retries.** No check reads how often a task reruns. The bounded retry in `retry_failed_webhooks` is code I wrote, and no policy confirms it.
- **Writes that skip the audit.** AUDIT-010 checks that the object calls `record_email_change` unconditionally. It cannot see whether the call runs with the right values or whether a write happens elsewhere, such as in a database trigger or a direct SQL write.
- **Runtime data.** Policies read definitions, not the rows in the tables or what the audit log actually holds.

---

# Result

## Built

- `table email_change_log` (`workspace/table/email_change_log.xs`): audit rows for customer-email changes.
- `function record_email_change` (`workspace/function/record_email_change.xs`): writes one audit row, with the actor from `$auth.id`.
- Policies `RET-001`, `AUDIT-010`, `COST-010`, `COST-020` (`workspace/policies/`). All four parse.

## Changed

- `task retry_failed_webhooks`: the `while` loop is gone. Each run makes one attempt per failed delivery with fewer than 5 attempts; the fifth failure sets the status to `abandoned`. Uses the existing `attempts` field.
- `nightly_ticket_summaries` (task): **file deleted.** It made one AI call per open ticket inside a `foreach`. `summarize_ticket` remains.
- Tables `customers`, `users`, `newsletter_subscribers`, `patients`, `support_tickets`, `orgs`: tagged `customer-email`.

## Dry run

`xano workspace push -d ./workspace --dry-run` reported: 4 policies created, 1 table created, 6 tables updated, 1 function created, 1 task updated. No blocked objects or missing references were listed.

Two things the dry run did not show:

- **The deleted task is not in the preview.** The preview lists `retry_failed_webhooks` as updated but no delete for `nightly_ticket_summaries`. Deletes may need a flag I was not allowed to use, so check this before you push, or restore the file if the delete will not happen.
- **Policies are not evaluated.** The dry run does not run them, so I do not know the findings yet. Run `xano policy evaluate` after the push.

Parse warnings were expected: `AUDIT-010` and `RET-001` name `customer-email`, `email_change_log` and `record_email_change`, which only exist once this change is pushed.

## Expected findings after the push

- **AUDIT-010 will report existing writers.** Endpoints that write customer-email tables do not call `record_email_change`, so they will fail until they do. Among them: `api/app/customers_POST`, `api/app/auth/signup_POST`, `api/app/newsletter/subscribe_POST`, and any endpoint or function that writes `patients`, `support_tickets`, `orgs` or `users`. I did not edit them, because that is a change to every write path and needs your review.
- **Policies are advisory.** Findings report but do not block a push.

## Before you push

- **Spend is not covered.** No check reads what AI calls cost. COST-010 stops AI calls inside loops, but a loop-free endpoint can still make many paid calls. Set a spend cap in your billing settings.
- **Retry bounds are my code, not a policy.** Task retries are not checkable. COST-020 stops `while` loops, and the 5-attempt cap in `retry_failed_webhooks` is a line I wrote. No policy confirms it stays.
- **The audit trail can be bypassed.** AUDIT-010 checks that an object calls `record_email_change`. It cannot check the values passed, writes through database triggers or direct SQL, or whether the rows are ever read.
- **Not part of this change, but noticed:** `function acme_notify_sms` has a Twilio credential written into its URL. SEC-012 (`no_secrets_in_code`) would flag it. I did not touch it. `support_tickets.xs` has a comment saying tickets are summarised nightly, which is now stale.
