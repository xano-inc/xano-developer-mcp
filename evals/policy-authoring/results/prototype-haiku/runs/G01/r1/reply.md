I've set up policy CONF-010 ("Sensitive tables are only reached by logged-in endpoints"). It checks every endpoint that reaches your invoices table, directly or through a function, and reports any that don't require login.

It's saved as active and advisory, so it flags findings but doesn't block anything yet. If you want it to block a merge or a set-live that would add an unauthenticated invoice endpoint, that's a separate change, and I'll make it when you say so.

Two things to check:
- The policy assumes the invoices table carries the tag `invoices`. Tag the table with that tag (or tell me your tag name and I'll change the policy). Until a table has the tag, the policy judges nothing.
- It covers the "no login" case. It does not check how much data a logged-in caller gets back, so a whole-table read by a logged-in user is not caught by this policy.
