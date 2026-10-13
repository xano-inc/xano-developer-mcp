I've drafted two policies that cover the timeout and error-handling parts of your request. I have not published them, and nothing in your workspace has changed.

**1. `SEC-013`: external requests time out (`/policies/SEC-013.xs`)**
- Every outbound request (`api.request`, `stream.from_request`, `webflow.request`) must set its own `timeout`, at most 30 seconds.
- The first rule is the platform's standard timeout template. On its own it would accept a request with no timeout, because an unset timeout is judged at the 10-second default. So I added a second rule that requires `timeout` to be set explicitly. One side effect: a timeout of exactly 10 also counts as "not set" to this check, so use a value other than 10.

**2. `LOG-010`: external calls sit inside a try block (`/policies/LOG-010.xs`)**
- Every `api.request` and `stream.from_request` must sit inside a `try` block, so a vendor failure reaches error handling instead of stalling the caller.
- This checks only that the `try` exists. It does not check what the `catch` branch does, so an empty catch would pass. That needs a code review.

Both are active and advisory, so they report findings but block nothing. Severity is medium, the template's default. If the hang you had last week should be treated as higher priority, tell me and I'll raise it. Changing severity is your call.

**What these will likely flag in your workspace (predictions, not run):**
- `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks`, and `quote_POST` have no timeout and no try block, so they would fail both rules.
- `acme_get_tracking` has a try block but sets `timeout = 60`, which is over the 30-second limit.
- `issue_refund`, `fraud_check_POST`, `charge_POST`, and `link_POST` have a timeout but no try block, so they would fail LOG-010.

**Not covered by these policies:**
- What the `catch` does with a vendor failure. No check reads it.
- Outbound calls made through MCP or direct database statements. They can't take a timeout, so the timeout rule can't check them, and I left them out of the containment rule too.
- Whether a timeout of 30 seconds is right for each vendor, and whether a failure falls back to something sensible. Those are design decisions.
- `retry_failed_webhooks` retries in a `while` loop with no limit. That's outside this request, but it's worth a look.

**Something I noticed outside this request:** `acme_notify_sms` has a credential written directly into its URL. Move it to an environment variable and rotate the exposed value. I haven't repeated the value here.

**Next steps:** If you're happy with both policies, I can publish them with `xano policy create` or put the files in your `policies/` folder. Publishing is a change to your workspace, so I'll wait for your go-ahead. After that I can run `xano policy evaluate` and report the actual findings.
