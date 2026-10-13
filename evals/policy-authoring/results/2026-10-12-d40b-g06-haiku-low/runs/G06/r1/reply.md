# Code review policies for the policy-authoring-eval workspace

I wrote six policy files in `out/`. Nothing is published, and I have not run `xano policy evaluate` or pushed anything. The files parse with no rule warnings.

## What each policy checks

| File | Policy | What it covers from your list |
| --- | --- | --- |
| `LOG-010.xs` | External calls handle their own failures | Missing error handling. Every `api.request` must sit in a `try_catch`. |
| `CHG-001.xs` | Endpoints are tested | No tests. Every endpoint must have a test, and protected endpoints need a test that an anonymous call is rejected. |
| `CONV-040.xs` | Endpoints and functions stay short | Giant functions. At most 30 statements and 3 levels of nesting. |
| `CONV-050.xs` | No leftover code | Disabled statements, unused inputs, unused variables. |
| `PERF-001.xs` | Endpoints never return every row | Unbounded list reads, at most 1000 rows a page. |
| `REVIEW-001.xs` | Functions are described and tested | Every function has a description of at least 20 characters and a test. |

All six are `active = true` and `enforcement = "advisory"`. They flag findings but block nothing. Making any of them blocking is your call as the policy owner. If you make them blocking, a merge or push that introduces a finding would be refused. For example, CONV-040 would refuse a change that leaves a long function still over the limit.

## What these policies will not stop

- **Breakage in prod.** These check the stored definitions and cannot see what runs in production. They also cannot stop a bad change from being deployed.
- **Error handling that works.** The `try_catch` check confirms the block exists. It does not check what the catch does.
- **Weak tests.** The checks confirm a test exists and that an anonymous call is rejected. They do not judge what the tests assert.
- **Other outbound calls.** LOG-010 only checks `api.request`. Your workspace also calls out through `stream.from_request`, MCP tools and direct database queries, and those are not covered yet.
- **Code review itself.** Who reviewed a change and who approved it is outside what policies read.

## What to expect when they run

These are predictions from reading the workspace, not results. I have not run an evaluation.

- **CHG-001** will likely flag most endpoints. The workspace has only two workflow tests, `health_check` and `invoices_require_login`.
- **PERF-001** will likely flag `invoices_GET`. Its `per_page` comes from input with a default of 25, and the check cannot verify a page size taken from input.
- **CONV-040** may flag `acme_sync_shipping_rates`. Its file comment says it has grown over time.

## Decisions for you

1. Should these stay advisory, or should any of them block? I left them advisory.
2. The workspace has no test for most functions. REVIEW-001 requires one for every function, which is the strictest rule here. Say if you want it relaxed.
3. Do you want LOG-010 widened to cover the other outbound calls? That changes the template's rule, so I left it as the template has it.
4. Should `CHG-001` carry the `soc2` tag? I added it from the template's framework. If the workspace does not have that tag, the tag still works as a label, but tell me if you want it removed.

To publish, the files need to go under `policies/` in the project, then `xano workspace push --dry-run` to see what would change.
