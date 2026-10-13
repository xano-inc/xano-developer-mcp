# Plan: external API calls always have a timeout and handle failure

## Objects to build
None. The enforcement is an edit to existing objects, not a new middleware or table. (A shared "call vendor" function was considered and rejected: each call site needs a different failure response, and the rules judge `api.request` directly.)

## Changes to existing objects
Every `api.request` statement in scope gets wrapped in `try_catch`. The catch either re-raises a readable error to the caller (`throw`) or logs and falls back where the existing code already does so.

- `function/acme_sync_shipping_rates`: wrap the carrier rate call; catch logs which carrier failed and substitutes an empty status so the loop moves on.
- `function/acme_notify_sms`: wrap the Twilio call; catch throws "SMS provider unavailable".
- `function/acme_get_tracking`: already wrapped with a fallback. No change.
- `ai/tool/issue_refund`: wrap the Stripe refund; catch throws "Refund provider unavailable" so the agent does not report a refund that did not happen.
- `task/retry_failed_webhooks`: wrap the delivery attempt; catch logs and leaves the delivery undelivered so it is retried.
- `api/app/shipments/quote_POST`: wrap the vendor quote; catch throws "Shipping quote unavailable".
- `api/app/payments/fraud_check_POST`: wrap the score call; catch throws "Fraud check unavailable". (Fails closed; the customer should confirm that is the right default.)
- `api/app/payments/charge_POST`: wrap the Stripe charge; catch throws "Payment provider unavailable" so no payment row is written without a payment intent.
- `api/app/bank_accounts/link_POST`: wrap the Plaid exchange; catch throws "Bank link provider unavailable".

No existing `api.request` lacks a timeout that would fail the timeout rule: the ones without `timeout` take the 10-second default, which is within the 30-second bound. I am not adding timeouts where they are absent.

## Policies (advisory, active)
- `SEC-013` (template `requests_have_timeout`): `statement.param_bound` on `api.request`, `stream.from_request`, `webflow.request`, `timeout` max 30 seconds. Covers the "nothing had a timeout" part of the ask.
- `LOG-010` (template `external_calls_handle_errors`): `statement.containment` requires `api.request` inside `try_catch`. Covers the "error handling" part of the ask.

Both stay advisory. Making them blocking is the policy owner's choice.

## Not covered
- `ai.external.mcp.*` and `db.external.*` calls: no timeout can be set and the error rule does not list them. Stated, not fixed.
- Catch branches are judged only for presence, not for whether they handle the failure well.
- `task/retry_failed_webhooks` retries with no attempt cap, so a dead vendor still keeps that task looping. That is a hang risk no check reads. Flagged for the customer, not changed.
- `function/acme_notify_sms` contains a literal credential in its URL. Out of scope for this ask; `literal.credential_shape` would flag it. Flagged, not changed.
- Runtime behaviour: the policy reads stored definitions, not whether a vendor actually responds in time.

# What I built and changed

**Policies (new, `active = true`, `enforcement = "advisory"`):**
- `workspace/policies/SEC-013.xs`: "External requests time out quickly", from template `requests_have_timeout`.
- `workspace/policies/LOG-010.xs`: "External calls handle their own failures", from template `external_calls_handle_errors`.

**Objects changed (each `api.request` now sits in a `try_catch`):**
- `function/acme_notify_sms`: catch throws "SMS provider unavailable".
- `ai/tool/issue_refund`: catch throws "Refund provider unavailable", so the agent never reports a refund that did not happen.
- `function/acme_sync_shipping_rates`: catch logs the failing carrier and substitutes a 503 response, so the loop moves on.
- `task/retry_failed_webhooks`: catch logs and substitutes a 503, so the delivery stays undelivered and is retried.
- `api/app/shipments/quote_POST`: catch throws "Shipping quote unavailable".
- `api/app/payments/fraud_check_POST`: catch throws "Fraud check unavailable". This fails closed; confirm that is the default you want.
- `api/app/payments/charge_POST`: catch throws "Payment provider unavailable", so no payment row is written without a payment intent.
- `api/app/bank_accounts/link_POST`: catch throws "Bank link provider unavailable".

`function/acme_get_tracking` already had a try/catch and is unchanged.

**Dry run** (`xano workspace push -d ./workspace --dry-run`): clean. It reports 2 policies created, 2 functions, 1 task, 1 tool and 4 endpoints updated, with no blocked objects and no missing references.

**Before you push:**
- The timeout rule already passes today. Every existing `api.request` either sets a timeout of 20 or less or takes the 10-second default. The policy will guard against future calls that omit one or set one above 30 seconds.
- The catch blocks are checked for presence only. The rule does not confirm the catch handles the failure well.
- `ai.external.mcp.*` and `db.external.*` calls cannot take a timeout and are not covered by either rule.
- `task/retry_failed_webhooks` still retries with no attempt cap. If a vendor stays down, that task keeps looping. No check reads this, and I did not change the retry logic.
- `function/acme_notify_sms` has a literal Twilio credential in its URL. That is outside this ask, but `literal.credential_shape` would flag it, and the credential should be rotated and moved to `$env`.
- The policies read stored definitions. They cannot show whether a vendor responds within the timeout at runtime.
