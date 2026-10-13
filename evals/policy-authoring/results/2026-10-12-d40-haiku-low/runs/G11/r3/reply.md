Yes. I've drafted two policies that cover this. Neither is published; they're files in `out/` for you to review.

**1. `LOG-010`: External calls handle their own failures** (medium, advisory)
Every outbound request (`api.request`, `stream.from_request`, `api.microservice`, `api.lambda`) must sit inside a `try` block, so a vendor failure reaches your error handling instead of stopping the endpoint.

**2. `SEC-013`: External requests time out quickly** (medium, advisory)
Every outbound request (`api.request`, `stream.from_request`, `webflow.request`, `api.microservice`, `api.lambda`) must have a `timeout` of at most 30 seconds. A call with no `timeout` set uses a 10-second default, so it passes this rule. If you want every call to name its timeout explicitly, tell me and I'll change the rule.

Both policies are advisory, so they report findings but don't block saves, merges or pushes. Say if you want either one to block.

**What I expect the rules to flag in your workspace** (a prediction from reading the code, not an evaluation run):
- `LOG-010` would flag these calls, which are not inside a `try`: `acme_sync_shipping_rates`, `acme_notify_sms`, `shipments/quote` (POST), `payments/fraud_check` (POST), `payments/charge` (POST), `bank-accounts/link` (POST), `issue_refund` (AI tool), and the `retry_failed_webhooks` task. `acme_get_tracking` already has a `try` and a fallback, so it passes.
- `SEC-013` would flag `acme_get_tracking`, which sets `timeout = 60`. The other calls either set 20 or 15 seconds or leave the default, so they pass.

**What these policies do not cover:**
- **Whether the error handling is useful.** `LOG-010` checks that a `try` wraps the call. It does not check what the `catch` does. An empty `catch` passes. No check can judge that, so please review the `catch` blocks yourself.
- **Whole-app hangs.** A 30-second cap per call limits each call, not how many of them run at once or how long a retry loop keeps going. `retry_failed_webhooks` loops until each delivery succeeds, which a per-call timeout does not stop.
- **Calls made through database or AI integrations.** `db.external.*` and `ai.external.mcp.*` calls have no timeout setting, so no rule can bound them.

**Something I noticed while reading the code (not part of this policy):** `acme_notify_sms` has a username and password for Twilio written into the URL. The "No secrets are hardcoded" template (`SEC-012`) would flag it. I'd move it into an environment variable.

Nothing in your workspace has been changed.
