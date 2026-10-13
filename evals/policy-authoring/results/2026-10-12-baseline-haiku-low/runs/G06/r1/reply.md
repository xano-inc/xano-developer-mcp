Hi, I looked at your workspace (policy-authoring-eval) and wrote three policies you can review. None are published yet. I'd like your go-ahead before anything is pushed.

**What I wrote (all `active = true`, `enforcement = "advisory"`, so they flag but block nothing):**

1. **CHG-001 – Endpoints are tested** (`out/CHG-001.xs`). Every query endpoint must be called by a test that asserts something, and protected endpoints need a test that an anonymous call is rejected. This is the "no tests" part. Your workspace has only two workflow tests (`health_check`, `invoices_require_login`), so expect many findings here.
2. **CONV-040 – Endpoints stay short** (`out/CONV-040.xs`). Endpoints and functions get at most 30 statements and 3 levels of nesting. This is the "giant function" part, with one catch: the check counts statements, not lines. Your largest function is about 82 lines, so it may not trip this check at all.
3. **LOG-010 – External calls handle their own failures** (`out/LOG-010.xs`). Every `api.request` must sit inside a try block. This covers the error-handling part only for outbound HTTP calls. For example, `payments/charge` calls Stripe with no try block, so it should be flagged.

**What these don't cover:**
- General error handling. Only outbound `api.request` calls are checked. Nothing checks database writes or other failures.
- Test quality. The tests check that an endpoint is called and asserts something, not that the assertions are meaningful.
- Line counts. The check counts statements and nesting, not lines.
- "Breaking prod" as such. These are advisory. If you want them to block merges and live pushes, change `enforcement` to `"blocking"` yourself. That is your call, and it will stop those gates on any finding.

**Next steps (not done):**
- I haven't run `xano policy evaluate` or pushed anything. The policy files are parse-checked only.
- Before publishing, decide whether to keep `CONV-040` covering functions, since that goes beyond the standard template.

Shall I run a dry-run push, or would you like to change any of these first?
