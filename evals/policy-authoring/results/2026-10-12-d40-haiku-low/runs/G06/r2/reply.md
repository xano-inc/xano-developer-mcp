I wrote three policies for the things you're tired of reviewing. They're in `out/` and all parse cleanly. None are published yet, and I haven't evaluated them against the workspace, so the examples below are predictions, not results.

**1. `CHG-001`: Endpoints and functions are tested** (`out/CHG-001.xs`)
- `object.test_coverage` on queries and functions: each one must be called by a workflow or unit test.
- `test.assertion_required`: each protected endpoint needs a test that an anonymous call gets rejected.
- Prediction: this will flag most of your endpoints and functions. The workspace has 2 workflow tests and no unit tests. Tests are read, not run, so a failing test still counts as coverage.
- One thing to know: a workflow test can't yet see an anonymous call being rejected, so `test.assertion_required` may fail on workflow tests until the platform enforces auth there.

**2. `CONV-040`: Endpoints and functions stay short** (`out/CONV-040.xs`)
- `stack.size_limit`: at most 30 statements and 3 levels of nesting for endpoints and functions.
- This counts statements, not lines. A 200-line function is usually well over 30 statements, but the 30 limit is the template's default. Tell me if you want a different number, for example 80 for functions.
- Prediction: `acme_sync_shipping_rates` is the most likely to be flagged.

**3. `LOG-010`: External calls handle their own failures** (`out/LOG-010.xs`)
- `statement.containment`: every `api.request` must sit inside a `try_catch`.
- Prediction: the workspace has 9 files with `api.request`, and only one has a `try_catch`, so most external calls will be flagged.
- Limit: this checks that a try block is there, not that the catch does anything useful. It also covers only `api.request`. There's no check for error handling in general (a missing null check, an unhandled database failure, and so on).

**What I did not cover**
- "Missing error handling" in general. Only external calls are checkable.
- Readability and naming beyond the size limit. Naming and dead-code checks exist but you didn't ask for them, so I left them out. Tell me if you want them.
- Stopping bad changes from reaching prod at runtime. Policies read stored definitions, not what happens when the code runs, and they can't see who approved a change.

**Advisory, not blocking.** All three are `enforcement = "advisory"`, so they report findings and block nothing. If you make one blocking, its findings would refuse a merge, a set-live, a save or push to the live branch, and a tenant deploy that introduces them. That's your call as the policy owner, so I haven't set it.

**Next steps for you**
- Decide the size limit and whether functions should be included in `CONV-040`.
- Decide whether to publish these, and which should be blocking.
- If you want exemptions for legacy code, tell me which objects, and we can discuss tagging them. I haven't added any exemptions.
