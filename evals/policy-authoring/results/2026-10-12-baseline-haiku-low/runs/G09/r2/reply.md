Thanks. I wrote one policy, `RET-002`, for the retention part. It does not cover the account-deletion part, and it does not enforce the 2-year limit by itself. Details below.

**What the policy does**

`RET-002` ("Retained data has a cleanup task", medium, active, advisory) checks that every table tagged `retained` is cleaned up by a scheduled task that deletes from it (`db.del`, `db.bulk.delete`, `db.truncate` or `db.direct_query`). It is the platform's retention template, with the tags `gdpr` and `storage-limitation` added.

**What it does not do**

- **It does not check the 2-year period.** No check can read a retention period. The task's `where` filter has to enforce the 2 years, for example `created_at < now - 2 years`, and the policy cannot see that.
- **Nothing is tagged yet.** Your workspace has no table with a `retained` tag, so right now the rule selects nothing and passes trivially. To make it bite, the personal-data tables need that tag. Candidates I saw are `users`, `customers`, `user_address`, `patients`, `clinical_notes`, `payments` and `support_tickets`. Adding the tag is your decision, and I have not changed the workspace.
- **Today only `sessions` has a cleanup task**, `purge_expired_sessions`, and it deletes expired sessions, which is not the 2-year rule.
- **Account deletion is not covered by any check.** `DELETE /account` calls `delete_user_account`, which deletes `user_address`, `sessions` and `users`. Looking at the code, it does not touch the other tables that may hold the user's data, such as `customers` (linked by email, not by user id), `support_tickets`, `payments` or `audit_log`. Whether that is a gap depends on how each table links to a user, which I did not fully trace. No check verifies that a deletion reaches every table, so this part needs a code review or a test, not a policy.

**Before you rely on this**

- I have not run `xano policy evaluate` or pushed anything. The file parses with one warning (the `retained` tag is on no table).
- The file is `out/RET-002.xs`. Publish it only after you have decided which tables get the tag.

**Decisions for you**

1. Which tables hold personal data and should get the `retained` tag?
2. Where is the 2-year cut-off to be enforced: a new cleanup task, or extending `purge_expired_sessions`-style tasks per table?
3. Should `delete_user_account` be extended to every table that holds user data? That is a code change, so I have not made it.
