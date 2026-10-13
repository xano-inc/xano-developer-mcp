I've drafted two policies that together cover the timeout and error-handling part of what you asked for. Nothing is published yet: the files are in `out/` and I haven't pushed them to your workspace.

**What's in the drafts**

- **`SEC-013`: External requests time out quickly** (medium, active, advisory). Two rules:
  - Every `api.request` and `stream.from_request` must have a `timeout` of 30 seconds or less.
  - Every such request must set `timeout` explicitly. The runtime default doesn't count, so an omitted timeout is flagged even though the default is 10 seconds.
- **`LOG-010`: External calls handle their own failures** (medium, active, advisory). Two rules:
  - Every `api.request` and `stream.from_request` must sit inside a `try_catch`.
  - Every `try_catch` must have at least one statement in its `catch` branch.

**What I found in your workspace**

Your workspace has no policies yet. Reading the pulled code, most of your external calls would be flagged today:

- No `try_catch` around any `api.request` except the one in `acme_get_tracking`. That covers `shipments/quote_POST`, `payments/fraud_check_POST`, `payments/charge_POST`, `bank_accounts/link_POST`, `acme_sync_shipping_rates`, `acme_notify_sms`, the `retry_failed_webhooks` task, and the `issue_refund` AI tool.
- Missing `timeout` on `shipments/quote_POST`, `acme_sync_shipping_rates`, `acme_notify_sms` and `retry_failed_webhooks`.
- `acme_get_tracking` has a `try_catch` but sets `timeout = 60`, which is over the 30-second limit.

These are predictions from reading the code, not the output of `xano policy evaluate`, which I didn't run. I'd expect them to show up when you run it after publishing.

**What the policies don't cover**

- **Whether the error handling is any good.** `LOG-010` checks that a `catch` branch does something, not that it does the right thing when a vendor is down, such as falling back, returning a clear error, or alerting someone.
- **Calls that aren't `api.request` or `stream.from_request`.** Your workspace has none today, but database external calls and AI/MCP calls aren't covered by these rules, and their timeouts can't be bounded by a policy.
- **Retry loops and shared-resource hangs.** A `while` loop around a call, like the one in `retry_failed_webhooks`, can keep retrying even with a timeout set. The policies don't check retry limits or whether a slow call blocks other work.

**Things you should decide**

- **The 30-second limit.** I used the template's limit. Your shipping vendor may need longer, and the exemption belongs to your policy owner, not to a tag added in code.
- **Blocking or advisory.** Both are advisory, so they report findings without blocking a merge or push. Switching to blocking would stop the existing calls from being pushed live until they're fixed. Tell me if you want that.

**Also noticed, outside your ask**

`acme_notify_sms` puts a credential directly in its URL. That's a secret in code and isn't covered by these two policies. The `SEC-012` template ("No secrets are hardcoded") covers it, and I can draft that too if you want.

Next steps: tell me whether to publish these two as they are, and whether to add the `SEC-012` policy.
