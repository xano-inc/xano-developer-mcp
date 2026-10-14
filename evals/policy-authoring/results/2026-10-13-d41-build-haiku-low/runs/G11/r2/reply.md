# Plan

**Objects to build:** none. Two templates fit this ask and both check the external calls that already exist. A new wrapper would change how those calls run, so I did not add one.

**Changes to existing objects:** none. Nine places in the workspace call an outside vendor, and most of them would be flagged (see the result below). Fixing them means changing how payment, refund and shipping code fails, which is your call and not something a policy change should do.

**Policies** (each from a template; `active = true`, `enforcement = "advisory"`, so they block nothing):

1. **`LOG-010`**, from template `external_calls_handle_errors` ("External calls handle their own failures"). Rule `statement.containment`: every external call sits inside a `try_catch`. The statement list covers every outbound call type the check can see: `api.request`, `stream.from_request`, `webflow.request`, `ai.external.mcp.tool.run`, `ai.external.mcp.tool.list`, `ai.external.mcp.server_details`, and the five `db.external.*.direct_query` statements.
2. **`SEC-013`**, from template `requests_have_timeout` ("External requests time out quickly"). Two rules, both on `api.request`, `stream.from_request`, `webflow.request`:
   - `statement.param_required` on `timeout`, so every call writes its timeout explicitly. I added this because the template's bound check alone passes an omitted timeout at its 10-second default, which does not match "has a timeout set".
   - `statement.param_bound` on `timeout`, max 30 seconds.
   MCP and external-database statements take no timeout parameter, so they are left out; the check cannot bound them.

**What stays unchecked:**
- Whether a `catch` block actually handles the failure. An empty catch passes LOG-010.
- Timeouts on MCP and external-database calls. There is no timeout setting to check.
- Whether a vendor outage reaches the user as a clean error, and whether anything hangs at run time. Policies read stored definitions, not traffic.
- Retry loops. `retry_failed_webhooks` retries an external call in a `while` loop until it succeeds. No check reads retry behaviour.

# Result

Built and changed:
- `workspace/policies/LOG-010.xs` (new)
- `workspace/policies/SEC-013.xs` (new)
- No objects built or changed.

Dry run (`xano workspace push -d ./workspace --dry-run`): `policy +2 created` (LOG-010, SEC-013). No blocked objects and no missing references. Both files parse.

I did not run `xano policy evaluate`, which is outside what I was asked to run. The expected findings below come from reading the files, not from an evaluation. Confirm them with `xano policy evaluate` after you push.

Expected findings, from reading the existing call sites:

| Call site | LOG-010 (try_catch) | SEC-013 (timeout) |
| --- | --- | --- |
| `function/acme_sync_shipping_rates` | fails, no try | fails, timeout not set |
| `function/acme_notify_sms` | fails, no try | fails, timeout not set |
| `function/acme_get_tracking` | passes | fails, timeout 60 |
| `ai/tool/issue_refund` | fails, no try | passes, timeout 20 |
| `task/retry_failed_webhooks` | fails, no try | fails, timeout not set |
| `api/app/shipments/quote_POST` | fails, no try | fails, timeout not set |
| `api/app/payments/fraud_check_POST` | fails, no try | passes, timeout 15 |
| `api/app/payments/charge_POST` | fails, no try | passes, timeout 20 |
| `api/app/bank_accounts/link_POST` | fails, no try | passes, timeout 20 |

**Before you push, know:**
- Both policies will report findings on the current workspace, as listed above. They are advisory, so nothing is blocked. Making one blocking is your call; a blocking policy would refuse any merge or push that adds a finding.
- Wrapping calls in `try_catch` only passes LOG-010. What the `catch` does (return an error, use a fallback, log) is up to the code, and the check does not read it.
- Things I noticed in the existing code but did not change or cover with these policies:
  - `function/acme_notify_sms` has a Twilio username and token in the URL. That is a credential-in-code problem, which `SEC-012` covers.
  - `api/app/payments/charge_POST` logs its whole input with `debug.log`, including `card_number` and `card_cvv`. That is a logging-of-card-data problem, which `LOG-001` covers.
