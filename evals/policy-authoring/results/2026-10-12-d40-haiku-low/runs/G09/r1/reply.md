Thanks. I've drafted one policy for this, `PRIV-010`, in `out/PRIV-010.xs`. It is not published yet. It would be active and advisory, so it blocks nothing, and its findings would be visible to your team. It helps with the two parts of your ask that the platform can check. It does not make you GDPR-compliant, and it cannot check everything you asked for.

**What it checks**

1. **Account deletion reaches your personal data.** Every table with a foreign key to `users` must be reached by a function that deletes from it (`db.del` or `db.bulk.delete`). In your workspace, `delete_user_account` already covers `user_address`, `sessions` and `users`.
2. **Old data has a cleanup.** Every table with a `created_at` column must be reached by a scheduled task that deletes rows. Right now only `sessions` has one (`purge_expired_sessions`).

**What I predict it would report** (from reading your workspace, not from running it)

- Rule 1: `support_tickets` and `orders`. Both have a `user_id` that points at `users`, but `delete_user_account` does not delete them, so a deleted account would leave those rows behind. This may be a real gap, and you should check it before deciding anything.
- Rule 2: 16 tables, which is most of your schema. The rule only confirms that a cleanup task exists. It does not read how old a row is before it is deleted.

**What the policy cannot see**

- **The 2-year limit itself.** No check reads the age a task deletes at. That number lives in each cleanup task's query and has to be reviewed by a person. The policy only shows which tables have a cleanup at all.
- **Tables you need to keep longer.** Invoices and orders often must be kept for tax reasons, and `audit_log` may need to live longer than 2 years. The policy does not exempt them, so each one will show up as a finding until a cleanup task exists for it, or until your data owner decides it is kept on purpose.
- **Newsletter sign-ups and support tickets from non-users.** `newsletter_subscribers` and `support_tickets.requester_email` hold personal data with no link to `users`, so rule 1 does not see them.
- **Copies outside Xano**, such as backups, exports, logs and third-party tools. Policies only read the workspace's stored definitions.
- **Process.** Who handles erasure requests and how fast, and whether people are trained, are outside what a policy can read.

**Changes I did not make** (the workspace is untouched)

- Tagging the tables holding personal data (for example `personal`) and the erasure function (for example `erasure`) would let the policy be narrower and more precise. Tags also change which policies apply, so this is your team's decision. Tell me if you want that version.
- Nothing has been pushed or published, and I did not run `xano policy evaluate`. Once you approve the file, I can publish it and run the evaluation so you see the real findings.

Decisions for you:
- Do you want the policy to stay advisory (the default I wrote) or block merges? Blocking is your team's call, and it would stop a merge that adds a new table without a cleanup.
- Which tables must be kept longer than 2 years? Coverage rules have no exemption list, so the way to narrow the rule is to scope it to the tables you name, or to give those tables their own cleanup task.
