# Plan: GDPR account deletion and 2-year retention

## Objects I will build
- **Task `purge_expired_customer_data`** (`workspace/task/`): runs daily, deletes `support_tickets` and `webhook_deliveries` rows whose `created_at` is more than 730 days old.

## Changes to existing objects
- **Function `delete_user_account`** (`workspace/function/`): when a user deletes their account, it also
  - deletes that user's `support_tickets` (by `user_id`),
  - sets `orders.user_id` to null (orders are kept for accounting; the link to the person is removed),
  - keeps the existing deletes of `user_address`, `sessions` and `users`,
  - gets the tag `erasure`.
- **Tag `personal`** on tables `users`, `user_address`, `sessions`, `support_tickets`, `orders`.
- **Tag `retained`** on tables `support_tickets` and `webhook_deliveries` (the two the new task purges).

## Policies
- **`RET-002`** (template "Retained data has a cleanup task", `table.coverage_required`, `tags: ["retained"]`, `referenced_by`: a task with `db.del` or `db.bulk.delete`). Keeps true: every retained table is purged by a task.
- **`ERASE-001`** (own key, no template fits exactly; `table.coverage_required`, `tags: ["personal"]`, `referenced_by`: a function tagged `erasure` with `db.del`, `db.bulk.delete` or `db.bulk.patch`). Keeps true: `delete_user_account` reaches every personal table.

## What stays unchecked
- **Age of records:** no check reads how old a record is when the task deletes it. The 730-day cutoff lives in the task's own query.
- **Tables not in the 2-year purge:** `customers`, `customer_notes`, `invoices`, `invoice_item`, `payments`, `payment_method`, `refunds`, `orders`. These hold customer data. Deleting them may conflict with accounting/tax retention, so this is a decision for the customer, not something I will guess. Only tagged tables are judged.
- **Untagged personal data:** a table the team forgets to tag is not judged at all.
- **Copies outside the workspace:** Stripe, email provider, webhook receivers, logs, backups, and the runtime data itself.
- **Personal fields in responses and logs, and field-level sensitive marking:** not asked for here; left out.
- **People and process:** who approves retention periods and deletion requests.

## Deviation from the plan
- **Orders are not anonymised.** The plan said `delete_user_account` would set `orders.user_id` to null. I could not get `db.bulk.patch` to parse: the first form failed with `Missing block: items`, and `items = {...}` failed with `Invalid block: where`. I removed the statement and did not tag `orders` as `personal`. When an account is deleted, its orders keep their `user_id`, so they still point at the deleted user. Please decide whether to anonymise them, and I will then need the correct `db.bulk.patch` syntax.

## What I built and changed
- `workspace/task/purge_expired_customer_data.xs`: new nightly task, deletes `support_tickets` and `webhook_deliveries` with `created_at` older than 730 days. It has no `guid` line; the dry run did not ask for one.
- `workspace/function/delete_user_account.xs`: now also deletes the user's `support_tickets` (by `user_id`), and carries the tag `erasure`.
- Tags: `personal` on `users`, `user_address`, `sessions`, `support_tickets`. `retained` on `support_tickets` and `webhook_deliveries`.
- `workspace/policies/RET-002.xs`: template policy. `table.coverage_required` with `tags: ["retained"]`, covered by a task with `db.del` or `db.bulk.delete`.
- `workspace/policies/ERASE-001.xs`: own key, since no template covers this exactly. `table.coverage_required` with `tags: ["personal"]`, covered by a function tagged `erasure` with `db.del` or `db.bulk.delete`.
- Both policies are `active = true` and `advisory`, so they block nothing.

## Dry run
`xano workspace push -d ./workspace --dry-run` exited 0 with no critical errors. It reports: +2 policies (ERASE-001, RET-002), ~5 tables updated, ~1 function updated, +1 task. The `policy parse` warnings say `retained`, `personal` and `erasure` are on no object yet. That is expected, because this change adds them. The dry run did not check the `subtract_days` filter in the task beyond syntax.

## Before you push
1. **Accounting and tax retention.** `customers`, `customer_notes`, `orders`, `invoices`, `invoice_item`, `payments`, `payment_method`, `refunds` and `shipments` are not purged. Many EU jurisdictions require invoices and payments to be kept longer than 2 years. Please decide the retention rule for these tables with your finance and legal team. Then tag them `retained` and add a task, or leave them as they are on purpose.
2. **Orders keep `user_id` after a deletion.** See the deviation above.
3. **The 2-year cutoff is in the task's query, not checked by any policy.** No check reads the age of rows a task deletes.
4. **Only tagged tables are judged.** A new table that holds personal data is not checked until someone tags it.
5. **Copies outside this workspace are not erased.** Stripe, the email provider, webhook receivers, logs and backups are outside the policies' view. The existing ask (delete "everywhere") is only partly covered.
6. **Not built, because they were not in the ask:** marking personal fields as sensitive (CONF-011), keeping them out of responses (DATA-010), and keeping them out of logs (LOG-001).
7. **Not policy-checkable at all:** who approves a deletion request and how quickly it is handled. These are process questions.

Nothing was pushed, and `xano policy evaluate` was not run, per the brief.
