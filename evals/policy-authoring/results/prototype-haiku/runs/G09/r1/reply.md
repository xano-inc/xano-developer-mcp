I set up two policies for the GDPR side. They are advisory and active, so they flag gaps and never block a merge or push.

**GDPR-010: Account deletion removes all personal data.** Every table tagged `personal-data` must be cleaned by a function tagged `account-deletion` that deletes rows (`db.del` or `db.bulk.delete`). The account deletion endpoint, tagged `account-deletion`, must call `delete_account_data` on every path. This catches a table that no deletion code touches, and an endpoint that forgets to call the deletion function.

**RET-002: Retained data has a cleanup task.** Tables tagged `retained` must be cleaned by a scheduled task. The policy also requires a task named `purge_expired_customer_data` to exist and run on a repeating schedule. This is the standard GDPR retention template, with the task name set to match.

What these checks cannot do, so you should not rely on them alone:
- They confirm that the deletion and purge code exists and is wired up. They do not confirm that it deletes the right records, that it reaches everything, or that it removes data held by third parties such as Stripe or your email provider.
- The "older than 2 years" limit is enforced only if `purge_expired_customer_data` filters on the right date. The policy cannot read that filter, so review it by hand.

Assumptions I made, which you should check against your workspace: the tags `personal-data`, `account-deletion` and `retained`, the function name `delete_account_data`, and the task name `purge_expired_customer_data`. Until your tables and objects carry these tags and names, the rules match nothing (the parser warns about this).

Nothing here makes the workspace GDPR compliant. A pass only means the stored definitions matched the rules when they ran.
