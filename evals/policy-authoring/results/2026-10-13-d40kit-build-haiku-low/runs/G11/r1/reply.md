# Plan

Your ask has two parts: every external call has a **timeout**, and every external call has **error handling**. Two existing templates cover them, and I'll use both, one policy each:

1. **SEC-013** (template `requests_have_timeout`): external requests time out within 30 seconds.
2. **LOG-010** (template `external_calls_handle_errors`): external requests sit inside a `try_catch`, so a vendor failure reaches error handling.

Both templates list only `api.request`, `stream.from_request` and `webflow.request`. Your ask says *any* external call, so I'll extend both rules with `api.microservice` and `api.lambda`, which also make network calls with a `timeout` param. Nothing else in the templates changes.

**Objects I will build:** none. The policies check the calls that already exist.

**Changes to existing objects:** none. I'm not editing your endpoints or functions. That means the policies will report the existing calls that break the rules; fixing them changes runtime behaviour, so it's a separate decision for you.

**Policies:**
- `SEC-013`: rule `statement.param_bound`, statements `api.request, stream.from_request, webflow.request, api.microservice, api.lambda`, param `timeout`, max 30 seconds. It keeps true that every listed call sets a timeout no longer than 30 seconds. A call with no timeout is judged at its 10-second runtime default.
- `LOG-010`: rule `statement.containment`, statements `api.request, stream.from_request, webflow.request, api.microservice, api.lambda`, `must_be_inside: ["try_catch"]`. It keeps true that every listed call sits inside a try block.

Both are `active = true`, `enforcement = "advisory"`, severity `medium`, as the templates set. Advisory means they block nothing. Making them blocking is your owner's choice.

**What stays unchecked:**
- A timeout is checked only where it is set as a literal or a variable with a literal value. A value computed at runtime is reported as unresolvable.
- The `catch` branch is not checked. The policy confirms the call is in a try block, not that the catch does anything useful.
- `db.external.*.direct_query` and `ai.external.mcp.*` take no timeout. The timeout rule cannot bound them. The try-block rule can be extended to them, but I left them out to match the template.
- Tasks have no retry setting a check can read, so retry behaviour is not checked.
- Whether a vendor responds quickly, and what happens after a timeout (fallback, queueing, alerts), is runtime behaviour that no check can see.
- Calls made through the `cloud.*` statements are not covered by either rule.

# What I built and changed

- Built: `workspace/policies/SEC-013.xs` and `workspace/policies/LOG-010.xs`. No other files changed. No objects built, no existing objects changed.
- Both parse with `xano policy parse` (exit 0).
- `xano workspace push -d ./workspace --dry-run` (exit 0, saved to `out/dry-run.txt`) reports: `policy +2 created`, `CREATE policy LOG-010`, `CREATE policy SEC-013`. No warnings, no blocked objects, no missing references. I did not run `xano policy evaluate` or a real push, so no findings are reported yet.

# What to know before you push

Pushing creates both policies as **advisory**. Nothing will be blocked. The findings will show up once the policies are evaluated.

From reading the workspace (a prediction, not an evaluation run):
- **SEC-013** should flag `acme_get_tracking` (function), which sets `timeout = 60`, above the 30-second limit.
- **LOG-010** should flag calls outside a `try_catch`. These include `acme_sync_shipping_rates`, `acme_notify_sms`, `issue_refund` (AI tool), the `retry_failed_webhooks` task, `quote_POST`, `fraud_check_POST`, `charge_POST` and `link_POST`. I checked these by reading the files, not for every object.
- Calls with no `timeout` are judged at the 10-second runtime default, so SEC-013 passes them. A call that never sets a timeout is still a real risk if the default changes, but the rule does not report it.

Your outage last week likely came from the calls above with no try block, or from the 60-second timeout. Fixing those is a runtime change to your endpoints and functions. I did not make it, because you asked for the policy. Tell me which ones to fix and I will.

# What no policy can see

- The `catch` branch. LOG-010 checks that the call is inside a try block, not that the catch does anything useful, such as a fallback or a clear error to the caller.
- Vendors that are slow but under 30 seconds. A 30-second timeout on every call can still stack up if many requests queue behind it.
- `db.external.*.direct_query`, `ai.external.mcp.*` and `cloud.*` calls. The timeout rule cannot bound them, and neither rule covers `cloud.*`.
- Tasks have no retry setting a check can read, so retry storms are not checked.
- Runtime values: a timeout computed in code is reported as unresolvable rather than checked.
- Whether a timeout actually fires in production, and what the app does after it. Only a load or outage test can show that.
