I drafted three advisory policies for the review problems you listed. They are files in `out/` only. Nothing has been published, pushed or evaluated, and the workspace has no policies today (`xano policy list` returned none).

**1. No tests (`CHG-001`, "Endpoints are tested", low)**
- Every query (endpoint) must be called by a test that asserts something.
- Every protected endpoint needs a test that an anonymous call is rejected.
- Every function must be called by a test. This goes beyond the platform template, which covers endpoints only, because most of your logic sits in functions.

**2. Giant functions (`CONV-040`, "Endpoints and functions stay short", low)**
- Each endpoint and function may hold at most 30 statements and nest at most 3 levels deep.
- You said 200 lines. A statement is roughly one line of logic, so 30 is much stricter than your number. I kept the platform's default. If you want a looser cap, say so and I'll change `max_statements`. Check that before you publish, because it changes what gets flagged.

**3. Missing error handling (`LOG-010`, "External calls handle their own failures", medium)**
- Each outbound call (`api.request`, `stream.from_request`, the external MCP tool call, and the Postgres and MySQL direct queries) must sit inside a `try_catch`.
- This does not cover error handling in general. No check can tell whether a function handles its own errors, so plain logic with no external call is not covered.

**What these cannot do**
- They can't stop a bad change from reaching prod. Each policy is advisory, so it reports findings and blocks nothing. Making one blocking is your call as the policy owner; if you do, it would refuse merges, set-lives and pushes to live that introduce a finding.
- They can't check that a test asserts anything meaningful. They check that a test exists and that an assertion follows the call.
- They can't review code quality beyond these three things. Naming, reviewer judgment and access reviews stay manual.

**Before you publish**
- The workspace has two workflow tests on disk (`invoices_require_login`, `health_check`). I expect the test rules to flag most endpoints and functions. I have not run `xano policy evaluate`, so I can't say how many.
- Publishing is your step, through the CLI or Studio. I haven't changed the workspace.
