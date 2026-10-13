Hi, I set up three policies that cover the review comments you keep writing. They are all advisory, so they flag problems without blocking anyone's merge.

**What they check**

- **LOG-010, External calls handle their own failures.** Every `api.request` must sit inside a `try` block, so a vendor outage reaches error handling instead of crashing the endpoint.
- **CHG-001, Endpoints are tested.** Every endpoint and function must be called by a test that asserts something, and every test must contain an assertion.
- **CONV-040, Endpoints and functions stay short.** Each endpoint or function may hold at most 30 statements and 3 levels of nesting. Anything longer should move a coherent part into a function.

**What these cannot catch**

- **Long functions:** the check counts statements, not raw lines. Roughly one statement is one line of logic, but a 200-line function will be flagged, which is the point, while a short but badly written one will pass.
- **Tests:** the check confirms a test exists and asserts something. It does not run the tests, so a failing test still counts as coverage.
- **Error handling:** only `api.request` is checked. Calls made through `stream.from_request`, the `ai.external.mcp.*` statements, or `db.external.*` direct queries are not covered yet. Tell me if you want those added.
- **Process:** nothing here checks that a reviewer approved a change or that a change was tested before it reached production. Those are outside what a policy can see.

**Not included yet**

- Unused variables and leftover code, the paging of list reads, and function descriptions are common review comments too. I can add them as the next step.

**Before you publish**

- The files are in `out/` (`LOG-010.xs`, `CHG-001.xs`, `CONV-040.xs`). They parse cleanly against your workspace with no rule warnings.
- Once they are advisory and you see the findings for a while, you can decide which ones should block. That is your call as the owner.
- Existing legacy endpoints and functions that are already too long will be flagged on day one. Either split them or ask the policy owner to exempt them.
