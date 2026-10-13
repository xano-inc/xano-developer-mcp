Yes. Two policies cover this. I've drafted them as policy files (`SEC-013.xs` and `LOG-010.xs`). Nothing is published yet.

**1. `SEC-013`: External requests time out quickly** (medium, advisory)
- Every outbound `api.request`, `stream.from_request` and `webflow.request` must set a `timeout` explicitly.
- The timeout must be 30 seconds or less.
- An unset timeout is not enough: Xano would otherwise judge it at a 10-second default, so the rule requires the value to be written out.

**2. `LOG-010`: External calls handle their own failures** (medium, advisory)
- Every outbound `api.request` and `stream.from_request` must sit inside a `try_catch`, so a vendor outage reaches your error handling instead of hanging or crashing the caller.
- This checks that the call is wrapped in a try. It cannot check that the catch branch does something sensible, so review that by hand. A fallback like the one in `acme_get_tracking` is the pattern to copy.

**What the workspace looks like against these rules, from reading the code (I did not run an evaluation):**
- `shipments/quote` (POST): no timeout and no try. Fails both rules. This is the kind of call that hung your app.
- `acme_sync_shipping_rates`: no timeout and no try. Fails both rules.
- `acme_get_tracking`: wrapped in a try with a fallback, so it passes LOG-010, but its timeout is 60 seconds. Fails SEC-013.
- `acme_notify_sms`: no try. Fails LOG-010. It also has a credential written directly into the URL, which the credentials check (`literal.credential_shape`) should flag separately. Move it to an environment variable and rotate the exposed secret. I'd treat that as more urgent than this policy.
- `task/retry_failed_webhooks`: its `api.request` has no timeout and no try, and the retry loop has no exit on repeated failure. That loop is outside what this policy measures, but it can hang a task just as a vendor outage can.

**Things to decide before you publish:**
- Both policies are advisory, so they report findings but block nothing. If you want them to block merges or live changes, set `enforcement = "blocking"`. Do that only after you've fixed the findings above, or every branch will be blocked.
- These rules don't cover database calls to external systems (`db.external`) or AI/MCP calls. Xano can't set a timeout on those, so they need a separate process.

Want me to make the enforcement blocking, or leave them advisory for now?
