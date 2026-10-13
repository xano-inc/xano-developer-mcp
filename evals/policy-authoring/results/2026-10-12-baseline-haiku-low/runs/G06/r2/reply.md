Here are three policies that cover the three things you're tired of reviewing. They're written to `out/` and parse cleanly, but nothing is published yet: I haven't created or evaluated anything in your workspace, and there are no policies in it today.

**1. Missing error handling → `LOG-010` (external calls handle their own failures)**
Every `api.request` must sit inside a `try_catch`, so a vendor failure reaches error handling instead of an unhandled error. Medium severity.

**2. No tests → `CHG-001` (endpoints and functions are tested)**
Every endpoint and function must be called by a workflow or unit test that asserts something, and every login-protected endpoint needs a test that an anonymous call is rejected. Low severity. Two limits: the check reads test definitions without running them, and it confirms that an assertion follows the call, not what the assertion checks.

**3. Giant functions → `CONV-040` (endpoints and functions stay short)**
Endpoints and functions can hold at most 30 statements and nest at most 3 levels deep. Low severity. This combines the catalogue's two shape templates (CONV-040 and CONV-041) into one rule.

All three are active and advisory. That means they record findings and never block a merge, save or deploy. If you want a finding to block a push, that's a separate decision you can make later.

**What I'd expect to see in your workspace (predictions, not evaluation results):**
- `LOG-010`: `api.request` appears in several endpoints and functions with no `try_catch` (for example `payments/charge`, `payments/fraud_check`, `shipments/quote`, `bank_accounts/link`, `acme_sync_shipping_rates`). Only `acme_get_tracking` wraps its request.
- `CHG-001`: the workspace has only two workflow tests, both smoke tests, so most endpoints and functions will be reported.
- `CONV-040`: your largest file is about 82 lines, not 200. `acme_sync_shipping_rates` is the likeliest to exceed the nesting limit, with a loop nested five levels deep. I don't expect any stack to exceed 30 statements, but I haven't counted them.

**Not covered:**
- Naming, descriptions, input validation, and secrets in code are possible to check, but you didn't ask for them. I can add them if you want.
- "Juniors breaking prod" as a general idea can't be checked by a policy. Policies only read stored definitions, so anything that depends on runtime behaviour or on your review process is outside them.

Next steps if you want these live: confirm the three rules and severities, then I'll publish them. Publishing and evaluating are your call, so I won't do either until you say so.
