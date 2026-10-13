Yes. Two policies cover what you described. Both are built from Xano's standard templates and are saved as advisory, so they flag problems without blocking any merge or deploy.

**1. SEC-013: External requests time out quickly** (`out/SEC-013.xs`)
- Every external request (`api.request`, `stream.from_request`, `webflow.request`, `api.microservice`, `api.lambda`) must set a `timeout` of 30 seconds or less.
- It also requires the `timeout` to be written out explicitly. Without that, a request with no timeout is judged at a 10-second default and would pass silently, which is the gap that let your outage hang the app.

**2. LOG-010: External calls handle their own failures** (`out/LOG-010.xs`)
- Every external call must sit inside the `try` block of a `try_catch`. That covers HTTP requests, streams, microservices, lambdas, cloud search, external database queries, MCP tool calls, and AI agent runs (`ai.agent.run`).
- The policy only checks that the call is inside a `try`. It cannot tell whether the `catch` does something sensible, such as returning a fallback or an error the caller can act on. That still needs a code review.

**What this will flag in your workspace.** I read the files but did not run an evaluation, so these are my readings, not findings from the platform:
- `acme_get_tracking`: sets `timeout = 60`, above the 30-second limit. It is inside a `try_catch`, so it passes LOG-010.
- `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks`, `api/app/shipments/quote`: no `timeout`, so SEC-013 flags them. None is inside a `try_catch`, so LOG-010 flags them too.
- `api/app/payments/charge`, `fraud_check`, `bank_accounts/link`, and the `issue_refund` tool: have timeouts, but no `try_catch`, so LOG-010 flags them. `charge` is the one to look at first, since it is a card charge.
- The three `ai.agent.run` calls (`summarize_ticket`, `nightly_ticket_summaries`, `support/chat`): I did not read their surrounding code, so I can't say whether they pass.

**Not covered by these two policies:**
- The `catch` block's behaviour, as above.
- Retry loops. `retry_failed_webhooks` has a `while` loop that retries without a limit. No check bounds retry counts.
- Timeouts on the AI and external database statements, which take no `timeout` setting in Xano, so they cannot be bounded this way.

**Something I noticed outside your ask:** `acme_notify_sms` has a Twilio credential written directly into its URL. Move it to an environment variable and rotate the value. The `SEC-012` policy ("No secrets are hardcoded") would catch it. I can write that one if you want it.

Nothing is published. The files are in `out/` for you to review before anything goes into the workspace.
