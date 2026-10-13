Thanks. Here is what I could do with Xano policies, what I could not, and what you need to decide.

## What I wrote

`out/RET-002.xs` (key `RET-002`, from the platform template "Retained data has a cleanup task"). It is active and advisory, so it blocks nothing. It parses cleanly.

It checks that every table tagged `retained` is deleted from by an active scheduled task (`db.del`, `db.bulk.delete`, `db.truncate` or `db.direct_query`). That covers the storage-limitation side of your ask only partly, as explained below.

## Why it does nothing yet

Your tables carry no `retained` tag. The parser warns that the tag "is on no table on this branch, so it selects nothing". Until you tag the personal-data tables, the rule passes without checking anything. Tagging is a change to your tables and it decides which policies apply, so I have not made it. Tables that would need the tag include `users`, `customers`, `orders`, `sessions`, `support_tickets`, `customer_notes`, `patients`, `payments` and `user_address`. You decide which of these hold data that must expire, and which tag name to use.

## What no check covers

- **Deletion everywhere on account deletion.** No check can verify that deleting a user removes all their data across tables. The current `delete_user_account` function (called by `DELETE /account`) deletes `user_address`, `sessions` and `users`. It does not touch `support_tickets` (`user_id`), `orders` (`user_id`), `customer_notes`, `payments` or `patients`, and `audit_log` keeps `actor_id`. Those gaps are visible in your code but no policy check reads them. Please review that function with your DPO; I have not changed it.
- **The 2-year limit itself.** RET-002 confirms that a scheduled delete exists for each tagged table. It does not check the cutoff the task uses. Nothing here reads the age of a record, so you would need a review of each cleanup task's `where` clause.
- **Existing cleanup.** The only scheduled delete in the workspace is `purge_expired_sessions` (login sessions by `expires_at`). It is not a retention rule for customer data.

## Not run

I did not run `xano policy evaluate` or push anything, because this session is read-only. Nothing is published. Run `xano policy evaluate` after you tag the tables to see the real result.
