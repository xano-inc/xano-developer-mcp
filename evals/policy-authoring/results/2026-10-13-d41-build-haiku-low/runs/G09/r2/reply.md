# Plan: GDPR erasure and two-year retention

Your ask has two parts. Deleting a user's data when they delete their account is enforced at runtime by the erasure function and the account endpoint. Keeping data no longer than two years is enforced by a scheduled purge. The policies check that both stay wired in. The Xano policies can only see the objects in the workspace. They cannot see what a database, a backup, a vendor or a person does outside it.

## Objects to build

- **Task `purge_expired_support_tickets`** (`task/purge_expired_support_tickets.xs`): runs nightly and deletes `support_tickets` rows whose `created_at` is older than 730 days, using a literal two-year cutoff.

## Changes to existing objects

- **Function `delete_user_account`** (`function/delete_user_account.xs`): also deletes the user's `support_tickets` (by `user_id`), so the account deletion reaches every user-linked table. Tagged `erasure` so the erasure rule can recognise it.
- **Table `users`**, **`user_address`**, **`sessions`**, **`support_tickets`**: tagged `personal`, the set the erasure function must reach.
- **Table `support_tickets`**: also tagged `retained`, so the two-year rule judges it.

## Policies

1. **`RET-003`** (template: Retained data is deleted after a set number of days). Rule: `table.coverage_required` with `tags: ["retained"]` and `referenced_by: {object_kinds: ["task"], max_age_days: 730}`. Keeps the purge task in place for `support_tickets`.
2. **`ERASE-001`** (own policy, no template covers the erasure rule). Rules:
   - `rules[0]`: `table.coverage_required` with `tags: ["personal"]` and `referenced_by: {object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete"]}`. Keeps `delete_user_account` reaching every personal table.
   - `rules[1]`: `object.auth_required` scoped to `paths: ["account"]`. Keeps the deletion endpoint logged-in only.

## What stays unchecked

- `customers`, `orders`, `invoices`, `payments`, `refunds`: they hold end-customer personal data and card or bank fields. Whether they are erased or kept for tax and accounting is a legal decision for you. I did not change them.
- `payments.card_number`, `card_cvv`: stored as plain text fields. No check in this build covers that. This is a PCI and GDPR concern to raise separately.
- `patients`, `clinical_notes`, `appointments`: health data. Not in erasure. Needs your decision and its own policy.
- `newsletter_subscribers`, `customer_notes`, `payment_method`: keyed by email or customer, not by user. Not in erasure.
- Backups, logs, exports and copies in other systems. No object here can see them.
- Whether the purge's two-year cutoff matches your retention schedule for each table.
- Sensitive-field marking on personal fields: I did not add it, because I could not confirm the XanoScript attribute syntax from the workspace.

## What I built and changed

- Built: task `purge_expired_support_tickets` (`workspace/task/purge_expired_support_tickets.xs`).
- Changed: `delete_user_account` (`workspace/function/delete_user_account.xs`) now deletes `support_tickets` for the user and is tagged `erasure`.
- Changed: tags added to `users`, `user_address`, `sessions` (`personal`) and `support_tickets` (`personal`, `retained`).
- Policies: `workspace/policies/RET-003.xs` and `workspace/policies/ERASE-001.xs`. Both parse. Their only warnings name the `personal`, `erasure` and `retained` tags this change adds, so they clear once the push lands.

## Dry run

`xano workspace push -d ./workspace --dry-run` reported: 2 policies created (ERASE-001, RET-003), 4 tables updated, 1 function updated, 1 task created. It reported no blocked objects and no missing references.

## Before you push

- The erasure path does not reach `newsletter_subscribers`, `customer_notes`, `payment_method`, `customers`, `orders`, `invoices`, `payments`, `refunds`, `patients`, `clinical_notes` or `appointments`. See the gap list above.
- `payments.card_number` and `card_cvv` are plain text fields. Fix this separately.
- Nothing here covers backups, logs or copies outside the workspace.
- `RET-003` only checks that a purge task exists for `support_tickets`, and that it deletes by a 730-day cutoff. It does not check your retention schedule for other tables.
