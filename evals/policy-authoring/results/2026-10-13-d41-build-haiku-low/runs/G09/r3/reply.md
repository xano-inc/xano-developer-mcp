# Plan: erasure on account delete, and a 2-year limit on support tickets

Your ask has two parts: (1) when a user deletes their account, their data goes everywhere, and (2) customer data is not kept longer than 2 years. I checked the workspace and found the following.

- `DELETE /account` (`api/app/account_DELETE.xs`) already exists and calls `function delete_user_account`. That function deletes `user_address`, `sessions` and `users`. It does **not** touch `support_tickets` (which has `user_id` and `requester_email`).
- The only scheduled cleanup is `purge_expired_sessions`, which removes sessions by `expires_at`. No task removes anything by age.

## Objects I will build

| Kind | Name | File | What it does |
|---|---|---|---|
| task | `purge_old_support_tickets` | `workspace/task/purge_old_support_tickets.xs` | Runs daily. Deletes `support_tickets` rows whose `created_at` is older than 730 days (`now|timestamp_subtract_days:730`). This is the retention cleanup. |

## Changes to existing objects

| Object | File | Change |
|---|---|---|
| function `delete_user_account` | `workspace/function/delete_user_account.xs` | Add a `db.bulk.delete support_tickets` where `user_id` equals the input user. Tag the function `erasure` so the policy finds it. |
| table `users` | `workspace/table/users.xs` | Tag `personal`. |
| table `user_address` | `workspace/table/user_address.xs` | Tag `personal`. |
| table `sessions` | `workspace/table/sessions.xs` | Tag `personal`. |
| table `support_tickets` | `workspace/table/support_tickets.xs` | Tag `personal` and `retained`. |

No endpoint, auth or middleware changes. No field attribute changes.

## Policy `GDPR-001`

Title: "Personal data is erased with the account and expires after 2 years". Starts active and advisory. Nothing is blocked.

| Rule | Check | Params | What it keeps true |
|---|---|---|---|
| 1 | `table.coverage_required` | `tags: ["personal"]`, `referenced_by: {object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete"]}` | Every `personal` table (`users`, `user_address`, `sessions`, `support_tickets`) is deleted from by the erasure function `delete_user_account`. |
| 2 | `table.coverage_required` (RET-003) | `tags: ["retained"]`, `referenced_by: {object_kinds: ["task"], max_age_days: 730}` | `support_tickets` has a scheduled task that deletes rows older than 730 days, which is `purge_old_support_tickets`. |

## What stays unchecked

Things I did not cover, and why:

- **Order and payment records** (`orders`, `payments`, `invoices`, `refunds`): they hold `user_id` or `requested_by`, and the function does not delete them. Keeping financial records for tax is usually a legal duty, so deleting them is a decision for you, not for me. The policy does not see this.
- **The 2-year limit on user accounts and `customers`:** no check reads "last activity". `users` has no age-based cleanup. Whether the clock starts at creation or last login is your decision.
- **Copies outside the workspace:** the nightly AI summary sends ticket bodies to a model provider, and any mail or payment processor copies. Backups, logs and other branches or tenants. No check reads these.
- **Whether the erasure function is complete:** the rules check that the function *deletes from* each personal table. They do not check that it deletes the right rows.
- **Who can call the erasure function, and whether the deletion is confirmed to the user.**

---

## What I built and changed

- Built: task `purge_old_support_tickets` (`workspace/task/purge_old_support_tickets.xs`). Daily, deletes support tickets older than 730 days.
- Changed: function `delete_user_account` now also deletes the user's `support_tickets` rows and is tagged `erasure`.
- Changed: tables `users`, `user_address`, `sessions` tagged `personal`. `support_tickets` tagged `personal` and `retained`.
- Policy: `workspace/policies/GDPR-001.xs`, active and advisory. It parses. Two rules, as planned.

## Dry run

`xano workspace push -d ./workspace --dry-run` printed:

```
policy               +1 created
Tables               ~4 updated
Functions            ~1 updated
Tasks                +1 created

CREATE           policy             GDPR-001
UPDATE           table              sessions
UPDATE           table              support_tickets
UPDATE           table              user_address
UPDATE           table              users
UPDATE           function           delete_user_account
CREATE           task               purge_old_support_tickets
```

The dry run reported no blocked objects and no missing references. I did not run `xano policy evaluate`, so I have not seen the policy's findings. Parsing printed three rule warnings: tags `personal`, `erasure` and `retained` are on no object yet. They are new in this change, so the warnings are expected. They should go away once you push the tags.

## Before you push

- **Orders and payments are not erased.** `orders`, `payments`, `invoices` and `refunds` still link to the user. Deleting them may break tax or accounting obligations. Decide whether to unlink them (set `user_id` null) or keep them as they are.
- **The 2-year limit only covers support tickets.** Nothing here removes inactive user accounts or old `customers` rows. Decide whether the clock starts at account creation or last login, and whether inactive accounts should be deleted. Neither is built.
- **No check sees the content of what is erased.** The policy confirms that the erasure function deletes from each personal table. It does not confirm that the right rows are deleted, or that the user is told it happened.
- **Copies outside the workspace.** Support ticket text goes to the AI summariser nightly. Mail or payment processors, backups, logs and other tenants keep their own copies. No policy can see these.
- **Who can call `DELETE /account`:** the endpoint is for signed-in users only. No check confirms that.
