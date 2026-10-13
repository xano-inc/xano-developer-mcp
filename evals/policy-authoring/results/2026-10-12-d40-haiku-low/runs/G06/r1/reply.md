Hi, I've drafted three policies for the review items you listed. They're written to be advisory, so they flag problems on the branch but block nothing. Nothing has been published.

**1. `LOG-010`: External calls handle their own failures** (medium)
Every outbound call must sit inside a `try` block, so a vendor outage reaches error handling instead of crashing the endpoint. It covers HTTP requests, streams, microservice and Lambda calls, cloud search calls, and external database queries. It checks that the call is wrapped, not what the `catch` does with the error. Your juniors will still need to decide what a failure returns.

**2. `CHG-001`: Endpoints and functions are tested** (low)
Every endpoint and function must be called by a workflow test or unit test, and that test must assert something after the call. I widened the template's scope to functions as well as endpoints, since you mentioned no tests in general. It also includes the template's rule that every protected endpoint has a test that an anonymous call is rejected. You didn't ask for that one, so tell me if you want it dropped.

**3. `CONV-040`: Endpoints and functions stay short** (low)
Any endpoint or function over 30 statements or nested deeper than 3 levels gets flagged. That's the template's limit. A 200-line function will almost certainly be over it. If you want a looser number, that's a change to make when you review the file.

**What no check can see**
- Whether a `catch` actually handles the error well.
- Whether the tests check the right thing. The policy only confirms that a test exists and asserts something.
- Anything about who reviews or approves a change, or what happens at runtime. Breaking prod often comes from those, and no policy reads them.

**Decisions for you**
- These are advisory. If you want them to block a merge, that's your call as policy owner, and I'd suggest running them advisory for a while first.
- Some existing endpoints and functions will be flagged on day one. Tag the legacy ones and I'll propose `except_tags` for each policy. I won't add exemptions myself.
- The rest of the template recipe for code review covers naming conventions, leftover code and paging. I left those out because they need a naming convention agreed first. Say the word if you want them added.

Files are in `out/`: `LOG-010.xs`, `CHG-001.xs`, `CONV-040.xs`. All three parse cleanly. I haven't evaluated them against the workspace, because the policies haven't been pushed.
