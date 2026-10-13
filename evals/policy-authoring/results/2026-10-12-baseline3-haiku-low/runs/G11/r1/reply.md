Yes. Two policies cover the timeout and error-handling part of this. I have written them but not published them, so nothing is enforced yet.

**1. `SEC-013`: External requests time out quickly** (medium, advisory)
- Every `api.request` and `stream.from_request` must set `timeout` explicitly, and the value must be 30 seconds or less. The second rule is the one that matters for your outage: a request with no timeout set is not flagged by the 30-second bound alone, because a missing timeout is judged at its 10-second default.
- Your workspace already sets timeouts on most calls, but not all. `api.request` calls in `quote_POST` (the shipping quote), `acme_sync_shipping_rates`, `acme_notify_sms` and `retry_failed_webhooks` have none set. `acme_get_tracking` sets `timeout = 60`, which is over the limit.

**2. `LOG-010`: External calls handle their own failures** (medium, advisory)
- Every `api.request` and `stream.from_request` must sit inside a `try` block, so a vendor failure reaches a `catch` instead of propagating up and hanging or failing the caller.
- In the workspace, I only found one `try` block, in `acme_get_tracking`, which falls back to a 503 response. By reading the code, I expect most other outbound calls, including the shipping quote, to be flagged. I have not run the check to confirm this.

**What the policies do not cover**
- They check that a `try` block and a timeout exist. They do not check what the `catch` branch does. An empty catch passes. Whether a failure is handled well is not something a check can verify.
- Retries, circuit breakers and fallbacks are not checked by any policy.
- External calls made through AI tool MCP servers and `db.external` statements are not covered. Their timeouts cannot be set, so they cannot be bounded.

**Something I noticed while reading, not a policy finding**
- `workspace/function/acme_notify_sms.xs` has a URL with credentials embedded in it. That is a secret in code. The `SEC-012` template (no hardcoded secrets) would flag it. The value should move to an environment variable, and anyone with the value should rotate it. I have not quoted it here.

**Next steps**
- Publishing these would turn on advisory findings for the calls above. Neither policy is blocking, so nothing will be refused.
- I have not run `xano policy evaluate` or pushed anything. The workspace's current policy list is empty.
- Your team decides whether to make either policy blocking, and whether any call (such as a deliberately long-polling request) should be exempted. The exemption is the policy owner's call.
