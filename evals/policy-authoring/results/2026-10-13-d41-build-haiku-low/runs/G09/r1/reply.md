# Plan: account deletion reaches your personal data, and personal data expires after 2 years

## What I found in the workspace

- `DELETE /account` (`api/app/account_DELETE.xs`) calls `delete_user_account`, which removes `user_address`, `sessions` and `users` rows. Nothing else.
- Rows that point at the user and survive deletion today: `support_tickets` (user_id, requester_email), `orders` (user_id), and `newsletter_subscribers` (email, matched on the same address as the account).
- No table has a retention cleanup. The only nightly delete is `purge_expired_sessions`, which covers sessions only.

## Objects I will build

1. **task `purge_expired_personal_data`** (`workspace/task/purge_expired_personal_data.xs`). Runs daily. Deletes rows of `support_tickets`, `newsletter_subscribers` and `orders` whose `created_at` is more than 730 days ago, using `db.bulk.delete` with `created_at < now|timestamp_subtract_days:730`. This is the 2-year limit.

## Changes to existing objects

2. **function `delete_user_account`** (`workspace/function/delete_user_account.xs`):
   - new input `email` (text)
   - adds `db.bulk.delete support_tickets` where `user_id` is the user
   - adds `db.bulk.delete newsletter_subscribers` where `email` is the user's email
   - adds `db.bulk.patch orders` setting `user_id` to null (order records are kept and unlinked, because they are commercial records)
   - adds `tags = ["erasure"]`
3. **api `account` DELETE** (`workspace/api/app/account_DELETE.xs`): passes `email: $auth.email` to the function.
4. **Table tags** (tags only, no schema change):
   - `personal`: `users`, `user_address`, `sessions`, `support_tickets`, `newsletter_subscribers`, `orders`
   - `retained`: `support_tickets`, `newsletter_subscribers`, `orders`

## Policy `GDPR-010` (new, active, advisory, severity high)

| Rule | Check | Params | What it keeps true |
| --- | --- | --- | --- |
| 1 | `table.coverage_required` | `tags: ["personal"]`, `referenced_by: {object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete", "db.bulk.patch"]}` | Every personal table is reached by `delete_user_account` with a delete or patch. |
| 2 | `table.coverage_required` | `tags: ["retained"]`, `referenced_by: {object_kinds: ["task"], max_age_days: 730, age_field: "created_at"}` | Every retained table has an active scheduled task that deletes rows older than 730 days. |

No template covers this goal as a whole. I used the recipe `personal_data_erasure` as the shape, and took its two coverage rules. I left out its field-attribute rules (see below).

## What stays unchecked (for the customer)

- Inactive accounts: nothing expires an account that has not logged in. That needs a decision on the inactivity period.
- `customers`, `patients`, `clinical_notes`, `appointments`: not linked to a user account. Patient and clinical data is health data and needs its own policy.
- `orders` and invoice-type records: you may have legal duties to keep financial records longer than 2 years. Those duties are yours to confirm before the purge runs.
- Copies outside the workspace: backups, logs, Stripe and email vendors, analytics.
- Field-level sensitivity marks and response/log exposure of personal fields.
- Whether the deletion is complete at runtime. The policy reads definitions only. It does not show that a deletion ran.
- Multi-step deletes have no transaction, so a failure midway leaves partial deletes.

## Next

Build the files above in one change, run `xano policy parse` on the policy, and run `xano workspace push --dry-run`. I will not push.

---

# What I built and changed

Built (all in `workspace/`):
- `task/purge_expired_personal_data.xs`: daily at 04:00 UTC. Deletes `support_tickets`, `newsletter_subscribers` and `orders` rows where `created_at < now|timestamp_subtract_days:730`.
- `policies/GDPR-010.xs`: policy, active, advisory, high. Two rules, both `table.coverage_required` (see plan).

Changed:
- `function/delete_user_account.xs`: takes a new `email` input. Also deletes the user's `support_tickets` (by `user_id`) and `newsletter_subscribers` (by `email`). Unlinks the user's `orders` (sets `user_id` to null, row by row with `db.query` and `db.edit`). Added `tags = ["erasure"]`.
- `api/app/account_DELETE.xs`: passes `email: $auth.email` to the function.
- Table tags: `personal` on `users`, `user_address`, `sessions`, `support_tickets`, `newsletter_subscribers`, `orders`; `retained` on `support_tickets`, `newsletter_subscribers`, `orders`.

One deviation from the plan: I planned `db.bulk.patch` for the order unlink. The parser rejects `db.bulk.patch` and `db.bulk.update` in this form ("Missing block: items"), so I used a `db.query` loop with `db.edit`. The policy's erasure rule accepts `db.edit` for that reason.

# Dry run

`xano workspace push -d ./workspace --dry-run` reports, with no critical errors:
- CREATE policy GDPR-010
- UPDATE table newsletter_subscribers, orders, sessions, support_tickets, user_address, users
- UPDATE function delete_user_account
- CREATE task purge_expired_personal_data
- UPDATE query account DELETE

`xano policy parse workspace/policies/GDPR-010.xs` succeeds. It prints three rule warnings: the tags `personal`, `erasure` and `retained` are on no object on the live branch yet. These clear once this change is pushed. I did not run `xano policy evaluate`, and I did not push.

# Before you push: what this does not cover

- **Financial records vs. the 2-year limit.** The purge deletes `orders` after 730 days. Invoices and orders often have legal retention duties, often longer than 2 years. Confirm before pushing, or remove `orders` from the purge.
- **Inactive accounts.** Nothing expires a user who never deletes their account. That needs an inactivity period from you.
- **Other customer and patient data.** `customers`, `patients`, `clinical_notes` and `appointments` are not linked to a user account, so erasure does not reach them. `patients` and `clinical_notes` hold health data and need their own rules and a decision on who may delete them.
- **Staff references.** `refunds.requested_by` and `approved_by` point at users, and they stay after erasure.
- **`webhook_deliveries.payload`** may contain personal data and is not covered.
- **Outside the workspace.** Backups, logs, the payment processor, the email vendor, and analytics copies are not visible to any policy.
- **Field marking.** The personal fields are not marked `sensitive`, so they are not kept out of responses or logs by policy.
- **No transaction.** The deletion steps run one after another. A failure midway leaves partial deletion.
- **What the policy proves.** It checks the stored definitions only. It does not show that a deletion ran or that data was removed.
