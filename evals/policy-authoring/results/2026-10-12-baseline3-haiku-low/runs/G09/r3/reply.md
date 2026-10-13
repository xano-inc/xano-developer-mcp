Thanks for the GDPR question. I looked through your workspace (`policy-authoring-eval`) and drafted one policy. I have not published it, and I have not changed anything in the workspace. Two parts of your ask are only partly covered, and one is not covered at all.

## What I drafted: `ERASURE-010` (in `out/ERASURE-010.xs`)

"Account deletion runs the erasure function." Every DELETE endpoint must always call `delete_user_account`. In your workspace, the only DELETE endpoint is `DELETE /account` (`api/app/account_DELETE.xs`), and it calls that function on every path. The rule is advisory and tagged `gdpr`, so it reports findings but blocks nothing. It parses cleanly.

What it does **not** check: whether `delete_user_account` deletes everything. It is a check that the function is called, not a check of what the function removes.

## What I found when I read the code

1. **Deletion is incomplete.** `delete_user_account` removes `user_address`, `sessions` and the `users` row. It does not touch:
   - `support_tickets`, which has `user_id`, plus `requester_email`, `subject` and `body` (personal data).
   - `orders`, which has `user_id`. Orders may need to be kept for accounting, but in that case `user_id` should be cleared, not left pointing at the deleted user.
   - `audit_log`, which keeps `actor_id`. This may be fine as a legal record, but it is a decision for you.

   I can't write a policy that catches this yet. No check tests that a delete reaches every table holding a user's data. Fixing the code is the real fix. I have not changed `delete_user_account`, because that is a change to deletion behaviour and you should decide it first.

2. **The 2-year limit is not covered.** The only cleanup task is `purge_expired_sessions`, which deletes expired login sessions. That is not a retention rule for customer data. The check for this is `RET-002` (retained data has a cleanup task). It works only on tables tagged `retained`, and none of your tables carry that tag. A rule for it would match nothing until the tag exists.

## Decisions for you

- **Tag the personal-data tables** (for example `support_tickets`, `orders`, `customers`, `user_address`) with `retained`, if you want the 2-year cleanup check. Adding tags changes which policies apply, so this is your call. Once the tags exist, I can propose `RET-002` scoped to them, plus a cleanup task. A task that only deletes rows older than 2 years would also need a `created_at` filter, which I have not written.
- **Confirm how deleted accounts should be handled** for `orders`, `support_tickets` and `audit_log`: delete, anonymise (clear `user_id`), or keep, and why.
- **Confirm the policy's scope.** `ERASURE-010` covers every DELETE endpoint in the workspace today. Tell me if you want it limited to specific API groups.

I have not run `xano policy evaluate` or `xano workspace push`, because I was asked to keep the workspace unchanged. Before you publish, run `xano policy parse` and then `xano policy evaluate` to confirm the findings yourself.

Nothing in this policy makes the workspace GDPR-compliant. It only checks that the deletion endpoint calls the erasure function.
