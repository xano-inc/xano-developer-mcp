# Plan: GDPR account deletion and 2-year retention

## What I will build and change

**New objects**
- `task purge_retained_personal_data` (`workspace/task/purge_retained_personal_data.xs`): runs daily and deletes `support_tickets`, `customer_notes` and `newsletter_subscribers` rows created more than 2 years ago. This is the retention cleanup.

**Changed existing objects**
- `function delete_user_account` (`workspace/function/delete_user_account.xs`): tagged `erasure`. Besides what it already deletes (`user_address`, `sessions`, `users`), it will:
  - delete the user's `support_tickets` (personal content);
  - null out `user_id` on `orders`, and `requested_by` / `approved_by` on `refunds`, so the business records remain but no longer point to the person.
- Table tags (in the table files, no schema change):
  - `personal`: `users`, `user_address`, `sessions`, `support_tickets` (the tables the erasure function must reach).
  - `retained`: `support_tickets`, `customer_notes`, `newsletter_subscribers` (the tables the 2-year task must clean).

**Policies** (one file each, `workspace/policies/`)
- `RET-002` (template `retained_data_cleaned_up`, tags `["retained"]`): every table tagged `retained` is referenced by a scheduled task that deletes from it.
- `GDPR-ERASE-001` (own key, no template covers "erase on account deletion"): `table.coverage_required` on tables tagged `personal`, requiring a function tagged `erasure` that runs `db.del` or `db.bulk.delete` on them.

## What stays unchecked (and is not built)
- The 2-year limit itself. The task's `created_at` cutoff is a value in its own query; no check reads record age (catalogue: retention age). RET-002 only confirms the task exists and deletes.
- Personal data outside the account: `customers`, `payment_method`, `patients`, `clinical_notes`, `customer_notes`, `newsletter_subscribers` (erasure), and `orders` / `payments` / `invoices`, which I keep as business records (anonymised, not deleted). Whether financial records can be kept needs a legal decision, not a code change.
- Copies: backups, logs, the AI summariser's output, and any data already exported. Policies read stored definitions only.
- Legal basis, notices, consent, and whether a user's request is processed in time.

## Decisions I made (flagged for review)
- Financial records are anonymised, not deleted.
- The 2-year cutoff is 63,072,000 seconds (730 days), applied to the three retained tables only.
- I am not changing auth, endpoints, or any table's fields.

---

# Result

## Built and changed (in ./workspace, nothing pushed)
- **New** `task purge_retained_personal_data` (`workspace/task/purge_retained_personal_data.xs`): daily at 04:00 UTC, deletes `support_tickets`, `customer_notes` and `newsletter_subscribers` rows whose `created_at` is more than 63,072,000 seconds (730 days) old.
- **Changed** `function delete_user_account` (`workspace/function/delete_user_account.xs`): tagged `erasure`. It now also deletes the user's `support_tickets`, and nulls `user_id` on `orders` and `requested_by` / `approved_by` on `refunds` (one `db.query` plus a per-row `db.patch` each, because the bulk patch form did not parse). It still deletes `user_address`, `sessions` and `users`.
- **Changed table tags**: `personal` on `users`, `user_address`, `sessions`, `support_tickets`; `retained` on `support_tickets`, `customer_notes`, `newsletter_subscribers`.
- **Policies**: `workspace/policies/RET-002.xs` (template `retained_data_cleaned_up`, tags `["retained"]`) and `workspace/policies/GDPR-ERASE-001.xs` (own key; `table.coverage_required` over `personal` tables, referenced by a function tagged `erasure` that runs `db.del` or `db.bulk.delete`). Both are active and advisory.

## Dry run
`xano workspace push -d ./workspace --dry-run`: no critical errors, no blocked objects. It previews 2 policies created, 6 tables updated, 1 function updated, 1 task created. My first draft used `db.bulk.patch`, which the parser rejected ("Missing block: items"), and then `db.patch` with a `where` block, also rejected; the per-row version passed. `xano policy parse` on both policy files exits 0; it warns that the `personal`, `retained` and `erasure` tags are on nothing yet, which is expected until the push creates them. I did not run `xano policy evaluate`, which the brief forbids, so I have no finding output.

## Before you push: what this does not cover
- **The 2-year limit is not enforced by any check.** The cutoff is a value inside the task's query. RET-002 only confirms that a scheduled task deletes from each retained table. It does not confirm the age, which is a listed gap.
- **Personal data outside the account is not erased.** `customers`, `payment_method`, `customer_notes`, `newsletter_subscribers` and `patients` are not linked to the user record, so `delete_user_account` does not reach them. A user's email may still sit in `newsletter_subscribers`. Covering them needs a decision on how to match them to the person.
- **Financial and business records are anonymised, not deleted** (`orders`, `refunds`). Keeping them is a legal call: tax or accounting rules may require keeping them for years, which conflicts with the 2-year limit. Please confirm with counsel.
- **Health data**: `patients` and `clinical_notes` hold health-related data and are not in the 2-year task. A medical-records retention rule may apply in some EU countries and conflicts with a flat 2-year limit.
- **Copies:** backups, logs, data already exported, and the AI summariser's output are not touched by any policy.
- **Legal basis, notices, consent, and the time allowed to answer an erasure request** are outside the definitions.
- **Unused variables** in `delete_user_account` (`$addresses`, `$sessions`, `$tickets`, and the `_done` results) were already there or came from my patches; they do not affect behaviour.
- Policy tags on tables only take effect once the tables are pushed; until then `RET-002` and `GDPR-ERASE-001` select nothing.
