# Plan: timeouts and error handling on external calls

## Objects to build
None. No new middleware, function or table is needed. The policies read the stored definitions of every existing object, so they judge each outbound call wherever it sits.

## Changes to existing objects
None in this change. The workspace already has violations (listed under "Result" once the dry run is done). Fixing them changes runtime behaviour of live endpoints, so I will not edit them without your go-ahead.

## Policies
1. **LOG-010 - External calls handle their own failures** (template `external_calls_handle_errors`, medium).
   - Rule `statement.containment`: every outbound statement in the workspace (`api.request`, `stream.from_request`, `webflow.request`, `api.microservice`, `api.lambda`, `ai.external.mcp.tool.run`, `db.external.*.direct_query`) must sit inside a `try_catch`. Covers: "some kind of error handling". The template only lists `api.request`; I extend it to the other external statements, as its limits suggest.
2. **SEC-013 - External requests time out quickly** (template `requests_have_timeout`, medium).
   - Rule `statement.param_bound`: `timeout` on `api.request`, `stream.from_request`, `webflow.request`, `api.microservice`, `api.lambda` must be 30 seconds or less. Covers: "a timeout set" (upper bound).
   - Rule `statement.param_required`: `timeout` must be set explicitly on the same statements. Covers: "a timeout set" (explicit). Not in the template; added here because the template alone lets an omitted timeout pass at the 10-second default.

Both policies are `active = true`, `enforcement = "advisory"`, so they record findings and do not block a push.

## What stays unchecked
- Whether the `catch` branch does anything useful (a fallback, a retry, a log line). The check only confirms the call sits inside a `try_catch`.
- Whether a timeout is a sensible value for a given vendor. The check only enforces the 30-second ceiling.
- Whether the request is actually bounded at runtime. `ai.external.mcp.*` and `db.external.*` take no timeout, so they can only be wrapped, not bounded.
- Retries, circuit breaking, and what happens to a job that hangs or fails after its timeout.
- Calls made by code the workspace does not hold (for example, outside Xano).

## What I built and changed
- Policy `workspace/policies/LOG-010.xs`: one rule (`statement.containment`) requiring every outbound statement to sit inside a `try_catch`.
- Policy `workspace/policies/SEC-013.xs`: two rules, `statement.param_bound` (timeout ≤ 30s) and `statement.param_required` (timeout set explicitly), on the outbound statements.
- No existing objects changed. No new objects built.
- Both files pass `xano policy parse` with no rule warnings.

## Dry run
`xano workspace push -d ./workspace --dry-run` reports: `policy +2 created` (LOG-010, SEC-013). No blocked objects, no missing references.

I did not run `xano policy evaluate`, which the brief forbids, so I do not have the findings from the platform. From reading the workspace files, the policies should flag these (advisory, so none block a push):

- **No `try_catch` around the call** (LOG-010): `api.request` in `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks` (inside a `while` loop), `shipments/quote_POST`, `payments/charge_POST`, `payments/fraud_check_POST`, `bank_accounts/link_POST`, and `issue_refund`. Only `acme_get_tracking` has a `try_catch`.
- **No timeout set** (SEC-013 explicit rule): `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks`, and `shipments/quote_POST`.
- **Timeout over 30s** (SEC-013 bound rule): `acme_get_tracking` sets `timeout = 60`. This is the shipping vendor call that the ask is about.

Two things I noticed but did not act on, because they are outside this policy: `acme_notify_sms` has a Twilio auth token in its URL (a credential in source), and `acme_sync_shipping_rates` is marked as legacy by its own comment.

## Before you push
- Both policies are advisory: they record findings and do not block pushes. Say so if you want `blocking`.
- The findings above will appear once the policies are evaluated. Fixing them changes live endpoints, so I left that for you to decide.
- The `try_catch` rule checks that the call is wrapped, not that the `catch` does anything useful. A fallback is not enforced.
- `statement.param_required` treats `timeout = 10` as not explicitly set, because it equals the default. Anyone who sets 10 on purpose will be flagged.
- `ai.external.mcp.*` and `db.external.*` take no timeout, so only the try/catch rule covers them. A hung database or MCP call is not bounded.
- Retries, backoff, and circuit breaking are not checked. The `retry_failed_webhooks` loop is a retry with no timeout, so a hang there is only partly covered.
- Calls made outside this workspace are invisible to these policies.

## Result
Built: 2 policies (`LOG-010`, `SEC-013`). Confidence that the policies achieve the goal as far as a policy can: medium. The checks enforce the wrapper and the timeout value, not the quality of the error handling or any runtime behaviour.
