I wrote two policies in `out/`. Neither is published, and I have not run `xano policy evaluate`, so nothing below is a result yet. Both files parse. Only part of your ask is covered.

**1. `GDPR-ERASURE`: account deletion reaches every table holding user data** (severity high, active, advisory)

Rule: `table.coverage_required` on every table with a field linking to `users`. Each such table must be deleted from by a function, endpoint or task. I found four of these tables in your workspace:
- `sessions` and `user_address`: covered by `delete_user_account`.
- `orders` (`user_id`) and `support_tickets` (`user_id`): nothing deletes from them, so I expect two findings here.

Expected findings, as a prediction only: `orders` and `support_tickets`.

Two things to decide:
- Invoices and orders often have to be kept for tax reasons. You may want to anonymise these rows instead of deleting them. The check cannot tell the two apart. It only confirms some delete exists.
- The check passes if a delete statement exists on the table. It does not check that the delete targets the deleted user.

**2. `RET-002`: retained data has a cleanup task** (the template, severity medium, active, advisory)

Rule: `table.coverage_required` on tables tagged `retained`, each needing a scheduled task that deletes from it.

Problem: no table in your workspace carries a `retained` tag today, so this rule currently checks nothing. The parser warns about this. Adding the tag to the tables that need it is a workspace change, and I did not make it. Tell me which tables should be retained and I will suggest the tags. You would add them yourself.

**What is not covered**
- **The two-year limit.** No check reads the age condition in a cleanup task. RET-002 only confirms a task deletes from the table. Whether the task deletes records older than two years is not checked. You would need a review or a test for that.
- **Customer data.** `customers`, `payments`, `payment_method`, `patients` and `customer_notes` are linked to customers, not to user accounts. `GDPR-ERASURE` does not look at them. `delete_customer_note` is an AI tool, and the check skips tools.
- **External systems.** Deletes at Stripe, the shipping vendor, your email provider or your logs are outside what policies can see.
- **The audit log.** `audit_log` keeps `actor_id` and changes, and nothing removes or limits those entries.

Nothing here makes you compliant with GDPR. These policies only show whether the stored definitions match the rules when they run.
