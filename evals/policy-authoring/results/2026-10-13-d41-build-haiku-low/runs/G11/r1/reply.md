# Plan: every external API call gets a timeout and error handling

Your outage happened because nothing bounded a vendor call and nothing caught its failure. This plan puts both in place on each existing call site, then adds two advisory policies that keep them there.

## 1. Objects I will build

None. Each outbound call already lives in an existing object, so I will change those objects in place instead of adding a shared helper. That keeps the change small and easy to review.

## 2. Changes to existing objects

Nine statements in the workspace call an external API. Each one gets an explicit `timeout` (30 seconds or less) and sits inside a `try_catch`.

| Object | Kind | Change |
| --- | --- | --- |
| `acme_sync_shipping_rates` | function | add `timeout = 30`; wrap in `try_catch`; catch sets an empty 503 response so the other carriers still sync |
| `acme_notify_sms` | function | add `timeout = 30`; wrap in `try_catch`; catch throws |
| `acme_get_tracking` | function | lower `timeout` from 60 to 30 (it already has a try/catch with a 503 fallback; left as is) |
| `issue_refund` | tool | keep `timeout = 20`; wrap in `try_catch`; catch throws, so a failed refund never reports `refunded: true` |
| `retry_failed_webhooks` | task | add `timeout = 30`; wrap in `try_catch`; catch throws, so the task run fails instead of looping on a dead vendor |
| `quote_POST` (shipments/quote) | endpoint | add `timeout = 30`; wrap in `try_catch`; catch throws |
| `fraud_check_POST` (payments/fraud_check) | endpoint | keep `timeout = 15`; wrap in `try_catch`; catch throws |
| `charge_POST` (payments/charge) | endpoint | keep `timeout = 20`; wrap in `try_catch`; catch throws, so no payment row is written when Stripe fails |
| `link_POST` (bank-accounts/link) | endpoint | keep `timeout = 20`; wrap in `try_catch`; catch throws |

Catch branches that throw surface the failure to the caller instead of continuing with a missing result. The one exception is `acme_sync_shipping_rates`, which is inside a loop over carriers and should carry on.

## 3. Policies

Two policies, one per template. Both are `active = true` and `enforcement = "advisory"`, so they block nothing. Making either one blocking is the policy owner's decision.

**`SEC-013`: External requests time out quickly** (from template `requests_have_timeout`)
- Rule 1 (template rule): `statement.param_bound` on `api.request`, `stream.from_request`, `webflow.request`, `api.microservice` and `api.lambda`, param `timeout`, max 30 seconds. Covers "the call ends". Note that the check judges an omitted timeout at its 10-second default, so it cannot on its own prove a timeout is set.
- Rule 2 (added): `statement.param_required` on the same statements, param `timeout`. Covers "a timeout is set explicitly", which rule 1 does not.

**`LOG-010`: External calls handle their own failures** (from template `external_calls_handle_errors`)
- Rule 1 (template rule, statements extended): `statement.containment` with `must_be_inside: ["try_catch"]` on every outbound statement in the catalogue: `api.request`, `stream.from_request`, `webflow.request`, `api.microservice`, `api.lambda`, `ai.external.mcp.tool.run`, `ai.external.mcp.tool.list`, `ai.external.mcp.server_details`, and the five `db.external.*.direct_query` statements. Covers "the call sits in a try block".

## 4. What stays unchecked

- **Whether the catch does the right thing.** LOG-010 confirms a `try_catch` exists, not that every path through the catch handles the failure. A reviewer must read each catch.
- **Retries and backoff.** No check reads how often a call is retried. `retry_failed_webhooks` loops on failed deliveries with no delay; that is a separate fix that needs a decision on retry limits and backoff. Not changed here.
- **Mcp and direct database calls.** Those statements take no timeout, so SEC-013 cannot bound them. LOG-010 covers their try blocks only.
- **Runtime behaviour.** Whether a timeout fires within 30 seconds during a real outage is a runtime fact. Nothing in the definitions proves it.
- **Idempotency.** Retrying a failed charge is not something a check can see. `charge_POST` throws on failure rather than retrying, so no duplicate charge comes from this change, but the vendor call itself is not idempotent.
- **Credentials found while reading.** `acme_notify_sms` contains a Twilio auth token in its URL. This is a secret-in-code finding (SEC-012 would flag it). Out of scope for this ask and not changed; it needs its own fix.

## 5. What I built and changed

Nothing new was created as an object. The change is:

- **Nine existing call sites** (listed in section 2) now have an explicit `timeout` of 30 seconds or less and sit inside a `try_catch`. Failed calls in endpoints, the tool and the task throw with a named error, so the caller sees the failure and no payment row, refund or "refunded: true" response is produced after a failure. `acme_sync_shipping_rates` falls back to an empty 503 response per carrier and keeps going.
- **`acme_get_tracking`**: timeout lowered from 60 to 30 seconds to meet the policy. Its existing try/catch fallback is unchanged.
- **Policy `SEC-013`** (`workspace/policies/SEC-013.xs`): `statement.param_bound` (timeout max 30 seconds) and `statement.param_required` (timeout set explicitly).
- **Policy `LOG-010`** (`workspace/policies/LOG-010.xs`): `statement.containment` (every outbound statement must be inside a `try_catch`).

Both policies are `active = true` and `enforcement = "advisory"`.

## 6. Checks run

- `xano policy parse` on `SEC-013.xs` and `LOG-010.xs`: both parsed, exit 0, no warnings.
- `xano workspace push -d ./workspace --dry-run`: exit 0, no blocked objects or missing references. It previews `+2 policy created` (LOG-010, SEC-013), and `~9` updates: 1 tool, 3 functions, 1 task, 4 endpoints.
- I did not run `xano policy evaluate`, and I did not push. Whether the rules flag the right objects is still a prediction until you run evaluate after pushing.

## 7. Before you push

- **Throw on failure is a behaviour change.** Charge, fraud check, quote, bank link, refund and SMS now return an error when the vendor is down, where before they failed with a raw vendor error or, in the refund's case, still returned success. Confirm that is the error you want callers to see.
- **Timeouts are 30 seconds or less**, not tuned to each vendor's real latency. `charge_POST` and `issue_refund` were 20 and `fraud_check` 15; I kept those.
- **The retry task loops with no delay on failure.** `retry_failed_webhooks` still retries in a tight loop when a webhook endpoint is down. My change makes it stop the run with an error instead of looping on a dead call, but backoff and a retry cap are a decision for you.
- **Credential in code.** `acme_notify_sms` has a Twilio auth token in its URL. It is out of scope for this change and I did not touch it. It needs its own fix, and a secrets policy would flag it.
- **Gaps no check sees:** whether catch branches do the right thing, whether a timeout actually fires within 30 seconds during a real outage, and whether retried charges are idempotent. See section 4.
- **Not covered by a timeout:** `ai.external.mcp.*` and `db.external.*` statements take no timeout, so SEC-013 cannot bound them. LOG-010 requires their try block only.
