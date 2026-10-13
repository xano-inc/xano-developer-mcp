Yes. Two policies cover this, one for timeouts and one for error handling. Both are advisory, so they flag code without blocking any merge or push. Making either one blocking is your policy owner's decision.

**1. `SEC-013`: External requests time out quickly** (medium)
- Rule 1 caps every `api.request`, `stream.from_request` and `webflow.request` timeout at 30 seconds.
- Rule 2 requires each of those calls to set `timeout` explicitly. This matters because a call that leaves timeout out is judged at a 10-second default, so the cap alone would let it pass.

**2. `LOG-010`: External calls handle their own failures** (medium)
- Every `api.request`, `stream.from_request` and `webflow.request` must sit inside a `try_catch`.

What these rules cannot see:
- The error-handling rule checks that a `try` block is there, not what the `catch` does. A catch that returns a fake success still passes. A person needs to review what each catch returns to the caller.
- Calls made through AI agents, MCP servers and direct database connections (`ai.external.mcp.*`, `db.external.*`) are not covered. Neither are `api.microservice`, `api.lambda` or `cloud.*` calls. Tell me if you use those and I will add them.
- Nothing in a policy can check how your vendor behaves. These rules only make sure each call has a bounded wait and a catch block.

**What I expect the first run to flag** (from reading your code; I have not run the policy checks, so treat these as predictions):
- Timeout over 30 seconds: `acme_get_tracking` sets `timeout = 60`.
- No timeout set: `quote_POST` (`shipments/quote`), `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks`.
- Call not inside a `try_catch`: `quote_POST`, `payments/charge`, `payments/fraud_check`, `bank-accounts/link`, `issue_refund`, `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks`.

Not flagged by these rules, but worth fixing: `acme_notify_sms` has a Twilio credential written directly into its URL. That is a secrets problem, not a timeout one, and it needs its own rule (`SEC-012`). Rotate that credential, and move it into an environment variable.

Nothing is published yet. The policy files are in `out/`. Once you are happy with them, I can add them to your `policies/` folder and run `xano policy evaluate` to check the real results.
