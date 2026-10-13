Thanks for the GDPR ask. I looked at your workspace (policy-authoring-eval) and wrote two policy files. I have not published or evaluated them; nothing in the workspace has changed. Two things need your decision before they can judge anything, and one part of the ask can't be checked by a policy at all.

**What I wrote**

1. **`GDPR-ERASE-001`: account deletion erases every linked table** (severity high, advisory). Every table with a link to `users` must be deleted from by a function tagged `erasure`. It covers the "delete their stuff everywhere" part for data linked to a user account.
2. **`RET-002`: retained data has a cleanup task** (severity medium, advisory). Every table tagged `retained` must be deleted from by a scheduled task. This is the built-in template for retention.

**What the policies will find once the tags exist**

- `delete_user_account` deletes `sessions`, `user_address` and `users`. It does **not** delete `orders` or `support_tickets`, which both carry a `user_id` link to `users`. So the first policy would flag a real gap today. The fix is in the function, which you would need to approve. I have not changed it.
- `purge_expired_sessions` already cleans up `sessions`, so that table would be covered.

**Decisions for you (I have not made these changes)**

- **Tag the function** `delete_user_account` with `erasure`. Until then, `GDPR-ERASE-001` checks nothing and warns that the tag is on no function.
- **Tag the tables** with `retained` (for the 2-year cleanup) and, if you want, `personal`. Until then `RET-002` checks nothing and warns that the tag is on no table.
- **Customer data linked by organisation, not by user.** `customers`, `invoices`, `payments`, `payment_method` and `patients` link to an org or customer, not to a user. The policy can't tell which rows belong to a person who deletes their account. You need to decide how those rows are linked to a person before erasure can cover them.

**What no policy can check**

- **The 2-year limit.** `RET-002` only confirms that a cleanup task exists for each retained table. No check reads how old a row is when it is deleted, so the 2-year period has to be set in each task's query and reviewed by a person.
- **Whether GDPR is met.** These policies check the stored definitions against their rules. They do not show that you comply with GDPR, that a deletion request is actually carried out, or that backups, logs and vendors are cleared. Those are process and infrastructure questions.

Once you tell me which tables should carry `retained` and `erasure` (and how the customer-side rows link to a person), I can finish the policy files and check them with `xano policy parse`. Publishing and evaluating are for you to run.
