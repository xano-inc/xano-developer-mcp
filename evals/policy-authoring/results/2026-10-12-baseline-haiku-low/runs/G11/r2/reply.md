I've drafted two policies for this. Neither is in your workspace yet: I only read the workspace and wrote the files locally. Nothing has been published or pushed, and I have not run `xano policy evaluate`, so the findings below are my reading of the code, not a run.

## What I wrote

**`out/SEC-013.xs`: external requests time out (timeout).** Starts from the platform's "External requests time out quickly" template, with two rules on `api.request`, `stream.from_request` and `webflow.request`:
- The timeout must be 30 seconds or less.
- The timeout must be written out explicitly. This second rule is the one that matters for your outage. The template alone does not catch a request with no timeout, because the platform judges an omitted timeout at its 10-second default and that passes a 30-second limit.

**`out/LOG-010.xs`: external calls handle failures (error handling).** Starts from the "External calls handle their own failures" template. Every `api.request`, `stream.from_request` and `webflow.request` must sit inside a `try` block, so a vendor failure goes to error handling rather than failing the caller.

Both are `active = true` and `enforcement = "advisory"`, which is the template default. Advisory means they report findings and block nothing. If you want a failing call to block a push, that is your decision to make later.

## What I expect the policies to flag in your workspace

From reading the files, not from a run:
- **Timeout too long:** `function/acme_get_tracking.xs` sets `timeout = 60`, above the 30-second limit.
- **No timeout written:** the `api.request` in `function/acme_sync_shipping_rates.xs`, `function/acme_notify_sms.xs`, `task/retry_failed_webhooks.xs` and `api/app/shipments/quote_POST.xs` has no `timeout`.
- **Not inside a try:** most external calls are not wrapped. Only `function/acme_get_tracking.xs` has a try around its request. The others include the calls in `ai/tool/issue_refund.xs`, `api/app/payments/charge_POST.xs` and `api/app/bank_accounts/link_POST.xs`.

The timeouts on `fraud_check_POST`, `charge_POST`, `link_POST` and `issue_refund` are set to 15 to 20 seconds, so they pass the timeout rules.

## What the policies do not cover

- **The catch block is not checked.** The error-handling policy confirms a `try` is there, not that the `catch` does anything useful. An empty catch would pass.
- **Retry loop.** `task/retry_failed_webhooks.xs` retries in a loop with no timeout on each attempt and no limit on the number of tries. The timeout rule will flag the missing timeout, but no check looks at the retry loop itself.
- **Other outbound kinds.** The workspace has no MCP or direct database external calls, so none are covered. If you add them later, they need their own rules.

## Two things I noticed that are not part of this request

- `function/acme_notify_sms.xs` has a credential written directly in its URL. Move it to an environment variable and rotate the exposed value. A credential-detection policy would catch this; I have not written one.
- `api/app/payments/charge_POST.xs` writes the card number, CVV and expiry to a debug log. This is worth fixing separately.

## Next steps

Review the two files, then tell me if you want them published. Publishing is a change to your workspace, so I will wait for your go-ahead. Once published, I can run `xano policy evaluate` and report the real findings.
