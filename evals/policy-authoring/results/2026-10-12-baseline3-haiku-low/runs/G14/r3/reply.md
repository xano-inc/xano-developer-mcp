Here's what I'd set up. I haven't published anything: the policies below are drafts in `out/` that parse cleanly, and none of them is active in your workspace yet.

**1. Stop AI calls inside loops (COST-010, high, advisory)**
Flags `ai.agent.run` anywhere inside a `foreach`, `for` or `while` loop. This is the pattern behind the $900 bill. Looking at your workspace, the nightly `nightly_ticket_summaries` task runs `ai.agent.run` inside a `foreach` over open tickets, so I expect this to flag it.

**2. Stop unbounded retries (COST-020, high, advisory)**
Flags `api.request` inside a `while` loop. Your `retry_failed_webhooks` task retries inside a `while` until a 200 comes back, so I expect this to flag it. Be aware this is a proxy: the check can't see whether a loop has an attempt cap, so it flags every outbound request inside a `while`, bounded or not. It also doesn't cover a retry set up in the platform's task schedule itself, which is what `schedule` does with `freq: 300`. Nothing in Xano's policy checks can see a spending limit or a retry cap, so that part of the ask isn't covered.

**3. Tag customer-email tables as `pii` (CONF-012, medium, advisory)**
Flags any table with an `email` or `requester_email` field of type email that doesn't carry the `pii` tag. In your workspace that's `customers`, `users`, `newsletter_subscribers`, `patients` and `support_tickets`. Nothing carries that tag yet, so this will show all five as findings until someone tags them. I haven't changed any tags: adding a tag changes which policies apply, so that's your call.

**4. Customer-data tables must be audited (CONF-010, critical, advisory)**
Any endpoint, AI tool or task that reaches a `pii`-tagged table must call `record_audit_event` unconditionally at the top level of its stack. That gives you a row in `audit_log` for each change. Two things to know before you turn this on:
- The check also requires endpoints that reach these tables to require a login. That's built into the check and I can't switch it off, so any public endpoint touching these tables will be flagged.
- The check verifies that the audit call is made, not that it records every field that changed. An endpoint that calls `record_audit_event` with an empty `changes` value still passes.

**What I haven't done**
- I haven't run `xano policy evaluate`, so I can't tell you the actual findings yet. The flags above are predictions from reading the code.
- I haven't published, pushed or changed anything in the workspace.

**Decisions for you**
- Approve the `pii` tag on the five tables above (and tell me if `users` should count as customer data).
- Decide whether `patients` should be in scope.
- Decide whether to publish the policies as advisory (findings only) or blocking, which would stop merges or pushes that add findings.
