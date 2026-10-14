# Plan: timeouts and error handling on external calls

## What I will build

- **New objects:** none. A policy can check each outbound call where it sits, so no wrapper function or table is needed.
- **Changes to existing objects:** none. Fixing the call sites this policy will flag is a separate step, and you asked for the policy first.

## The policy

Two policies, one per template, since both templates fit the ask exactly.

1. **`SEC-013`** (template `requests_have_timeout`): External requests time out quickly.
   - Rule 1 (template): `statement.param_bound` on `api.request`, `stream.from_request`, `webflow.request`, param `timeout`, max 30 seconds. Keeps a slow vendor from holding a call past 30 seconds.
   - Rule 2 (added): `statement.param_required` on the same three statements, param `timeout`. Requires the timeout to be set explicitly. Without this rule, a call with no timeout is judged at Xano's 10-second default and passes, which is the gap that let your outage hang the app.

2. **`LOG-010`** (template `external_calls_handle_errors`): External calls handle their own failures.
   - Rule 1 (template, extended): `statement.containment` with `must_be_inside: ["try_catch"]` on every outbound statement: `api.request`, `stream.from_request`, `webflow.request`, the three `ai.external.mcp.*` statements, and the five `db.external.*.direct_query` statements. The template lists only `api.request`; I added the rest so the rule covers "any external call", as you asked.

## What stays unchecked

- **Error handling quality:** LOG-010 confirms a `try_catch` wraps the call, not that the `catch` does anything useful. An empty catch passes.
- **Runtime values:** a timeout set from a variable or environment value is judged only where it resolves to a literal.
- **Timeout semantics:** the check reads the setting, not whether 30 seconds is right for each vendor.
- **Vendor outages themselves:** no check can see how the app behaves when a vendor is down; that needs a test or an outage drill.
- **Calls outside the listed statements:** any other way of reaching a vendor (a new statement type, a custom integration) is not covered until it is added to the rule.

## Predicted findings (not evaluated)

I will not run `xano policy evaluate` (not permitted here). From reading the workspace, I expect:

- `SEC-013` rule 1: `acme_get_tracking` (timeout 60) is over the 30-second maximum.
- `SEC-013` rule 2: calls with no `timeout` set: `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks`, `quote_POST`.
- `LOG-010`: `api.request` calls outside any `try_catch`: `acme_sync_shipping_rates`, `acme_notify_sms`, `retry_failed_webhooks`, `quote_POST`, `issue_refund`, `fraud_check_POST`, `charge_POST`, `bank_accounts/link_POST`. `acme_get_tracking` is inside a `try_catch` and should pass.

## What I built and changed

- **Objects built:** none.
- **Objects changed:** none.
- **Policy files written:**
  - `workspace/policies/SEC-013.xs`: two rules, the template's `statement.param_bound` (max 30 seconds) and an added `statement.param_required` on `timeout`.
  - `workspace/policies/LOG-010.xs`: `statement.containment` requiring a `try_catch` around every listed external statement. I extended the template's single `api.request` to the other outbound statements you need covered.
- Both policies are `active = true`, `enforcement = "advisory"`, so they block nothing.

## Checks run

- `xano policy parse` on each file: both parsed, exit 0.
- `xano workspace push -d ./workspace --dry-run`: no problems reported. It would create 2 policies, `LOG-010` and `SEC-013`, and nothing else. Exit 0.
- I did not run `xano policy evaluate` or a real push, as those are outside this task. The findings below are predictions from reading the code.

The predicted findings listed in the plan above still stand; they are not yet confirmed by an evaluate run.

## Before you push

- **Blocking:** both policies are advisory. Making either one blocking is your call, and it would then block merges and set-live for any change that introduces a finding.
- **Gap, important:** without the added `param_required` rule, a call with no timeout passes the template's 30-second check, because Xano judges it at its 10-second default. That is why the second rule exists.
- **Not checked:** what a `catch` does with the error (an empty catch passes LOG-010), whether a timeout is right for each vendor, runtime values that a check cannot resolve, and how the app behaves during a real vendor outage. Those need code review and an outage test.
- **Unrelated, not changed:** `acme_notify_sms` has a literal credential in its request URL. That is a secret-in-code issue (SEC-012 would flag it), outside this ask. I have not quoted the value. It should be moved to an environment variable and rotated.
- **Parse output:** `xano policy parse` printed the policies without their `severity` line. Both files set `severity = "medium"`, so please confirm it is stored after push.
