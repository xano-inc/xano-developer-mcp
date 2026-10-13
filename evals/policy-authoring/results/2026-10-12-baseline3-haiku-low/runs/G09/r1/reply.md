Thanks for the question. Here is what a policy can and can't do for the two GDPR requirements, based on your workspace (`policy-authoring-eval`) as it stands today.

**1. Retention: no personal data kept longer than 2 years**

I wrote `out/RET-002.xs`, based on the platform's "Retained data has a cleanup task" template. It requires every table tagged `retained` to be cleaned up by an active scheduled task that deletes from it. It is set to `active = true` and `enforcement = "advisory"`, so it blocks nothing.

It does not yet check anything, for two reasons:

- No table in your workspace carries a `retained` tag, so the rule selects nothing and passes trivially. You would need to tag the personal-data tables (for example `users`, `customers`, `support_tickets`, `orders`, `sessions`, `user_address`). Tagging is your decision, so I have not proposed a tag set beyond this one name.
- The policy checks that a cleanup task exists, not that it enforces 2 years. The check cannot read a retention period, and the existing `purge_expired_sessions` task only deletes sessions whose `expires_at` has passed. Your 2-year rule needs a task that filters on the record's age, and nothing in the catalogue verifies that filter's value.

**2. Account deletion removes data everywhere**

No check verifies that a deletion reaches every place personal data lives. I can't write a policy for this part.

Looking at `delete_user_account` by hand, it removes `user_address`, `sessions` and the `users` row. It does not touch these tables, which reference a user:

- `support_tickets` (`user_id`, plus `requester_email`)
- `orders` (`user_id`)

Whether those records must be deleted, anonymised or kept for legal reasons is a decision for you and your DPO, not something a policy can settle.

**What you can do next**

- Tag the personal-data tables with `retained` (or a tag you prefer), then I can help you check the policy's coverage.
- Decide on the retention period for each table and add a scheduled task that deletes records older than that period. I can draft that as a code change for your review.
- Decide how `support_tickets` and `orders` should be handled on account deletion. The deletion function is code, so the change would be yours to approve.

I have not published the policy, pushed anything or changed the workspace.
