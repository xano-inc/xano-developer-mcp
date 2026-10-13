# Plan: account erasure and two-year retention

Your ask has two parts: when a user deletes their account, their data goes everywhere; and personal data is not kept longer than two years. I checked the workspace's tables, the `delete_user_account` function and the existing `purge_expired_sessions` task. Here is the plan before I build anything.

## Gaps I found today

- `delete_user_account` removes `users`, `sessions` and `user_address`. It does **not** touch `support_tickets` (linked by `user_id` and holding `requester_email` and the ticket body), `newsletter_subscribers` (keyed by the same email), or `orders` (linked by `user_id`).
- Nothing deletes records by age except sessions. `support_tickets` and `webhook_deliveries` have no retention job.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| task | `purge_stale_personal_data` | `task/purge_stale_personal_data.xs` | Daily. Deletes `support_tickets` and `webhook_deliveries` rows older than 730 days. |

## Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| function `delete_user_account` | `function/delete_user_account.xs` | Reads the user's email first, then also deletes their `support_tickets` (by `user_id`) and their `newsletter_subscribers` row (by email). It **detaches** their `orders` (sets `user_id` to null) rather than deleting them, because orders are financial records that EU tax law usually requires you to keep. The existing deletes stay. Tag: `erasure`. |
| table `users`, `user_address`, `sessions`, `support_tickets`, `newsletter_subscribers` | their table files | Tag: `personal`. |
| table `sessions`, `support_tickets`, `webhook_deliveries` | their table files | Tag: `retained`. |

## Policies

1. **`RET-002`** (template "Retained data has a cleanup task", advisory, active). Rule: `table.coverage_required` with `tags: ["retained"]` and `referenced_by` = tasks that run `db.del`, `db.bulk.delete`, `db.truncate` or `db.direct_query`. Covers: every retained table has a scheduled cleanup task. `sessions` is covered by the existing `purge_expired_sessions`.
2. **`GDPR-ERASE`** (own policy, advisory, active). Rule: `table.coverage_required` with `tags: ["personal"]` and `referenced_by` = functions tagged `erasure` that run `db.del` or `db.bulk.delete`. Covers: every personal-data table is deleted by the erasure function.

## What stays unchecked

- **The two-year age itself.** No check reads the age a task deletes at. RET-002 confirms a cleanup task exists; the 730-day value is only visible in the task file.
- **Legal retention for orders and invoices.** I did not add deletion for `orders`, `invoices`, `payments` or `refunds`. You will need to decide whether their retention period conflicts with the two-year rule.
- **Patients and clinical notes.** `patients`, `appointments` and `clinical_notes` are not linked to user accounts in the schema. I have not covered them.
- **Copies outside the workspace**: payment processor, email provider, AI vendor (ticket summaries), backups, and logs. No policy reads these.
- **Customer records** (`customers`, `customer_notes`) are keyed by email with no link to a user account, so the erasure function does not reach them.

## Result

**Built**
- `task/purge_stale_personal_data.xs`: nightly at 04:00 UTC, deletes `support_tickets` and `webhook_deliveries` older than 730 days.
- `policies/RET-002.xs` and `policies/GDPR-ERASE.xs`: both active and advisory (see above).

**Changed**
- `function/delete_user_account.xs`: now also deletes the user's `support_tickets` and `newsletter_subscribers` row (matched by the user's email), and detaches their `orders` by setting `user_id` to null, one `db.patch` per order. It is tagged `erasure`.
- Tags added: `personal` on `users`, `user_address`, `sessions`, `support_tickets`, `newsletter_subscribers`; `retained` on `sessions`, `support_tickets`, `webhook_deliveries`.

**Dry run** (`xano workspace push -d ./workspace --dry-run`): no critical errors. It lists 2 policies created, 6 tables and 1 function updated, 1 task created. My first draft failed on `db.bulk.patch` (syntax error: "Missing block: items"); I replaced it with a query and a per-row `db.patch`. The dry run did not run the policies; I have not run `xano policy evaluate`, so I cannot say what the rules will report.

**Parse warnings:** `xano policy parse` reports that `retained`, `personal` and `erasure` are not on anything on the branch yet. That is expected, since these tags come in with this change.

**Before you push**
- Read the 730-day filter in `purge_stale_personal_data`. The age is set there, and no check can verify it.
- Orders are detached, not deleted. If your accountant needs a different treatment, change `delete_user_account` before the push.
- Nothing here reaches Stripe, the email provider, the AI vendor, backups or logs. Those copies are outside what any policy can see.
- Patients, clinical notes, customers and customer notes are not covered by the erasure function.
- Both policies are advisory, so they block nothing. Making them blocking is the policy owner's call.

**Confidence the policy achieves the goal: low.** The two rules check that tagged tables are reached by a cleanup task and an erasure function. They do not check the data, the age, or what the functions actually delete.
