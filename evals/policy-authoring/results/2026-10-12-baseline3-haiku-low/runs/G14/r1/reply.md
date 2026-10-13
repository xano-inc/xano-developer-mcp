I've drafted two policies. Neither is published or pushed yet, and I haven't run them against your workspace; they are files in `out/` for you to review first.

**1. `COST-010`: AI calls and retries stay inside bounded work** (high, advisory)

- **AI call in a loop.** An `ai.agent.run` inside a `foreach` or `while` is flagged. In your workspace, `nightly_ticket_summaries` calls the Ticket Summarizer once per open ticket inside a `foreach`, so I expect this to be flagged. The rule only sees the loop in the same stack; an AI call made inside a function that a loop calls is not caught.
- **Retrying forever.** No check can prove a retry loop ends. The closest available rule forbids `while` loops in tasks. That is a proxy: it flags every `while` in a task, not only unbounded retries. In your workspace it would flag `retry_failed_webhooks`, whose `while ($delivered == false)` has no attempt limit. I expect that to be flagged. Rewriting it with a bounded `foreach` and an attempt limit would clear it.

This does not cap spend. Nothing in the policy language sets a budget or a per-day limit on AI calls, so a bounded loop can still cost a lot. A spend cap has to be set with your AI provider.

**2. `AUDIT-010`: Changes to customer email are audited** (high, advisory)

- Any endpoint, AI tool, task or message handler that assigns an `email` or `requester_email` field must call `record_audit_event` unconditionally. That is the function that writes `audit_log`, so the log answers who changed what.
- I expect this to flag `customers_POST` (sets `email`) and `newsletter/subscribe_POST` (sets `email`). `customers/customer_id_PATCH` already calls `record_audit_event`, so I expect it to pass, but I have not confirmed that with an evaluation.
- Gaps: writes made inside functions are not inspected, because this check only looks at endpoints, tools, tasks and messages. A write that changes other fields of a customer row without touching `email` is not caught. Deletes are not caught either, because the rule only looks at writes that assign an email field. Reads are not audited.
- The rule checks that the audit call exists. It does not check that the audit row has the right actor or content.

**Not covered**

- A cost ceiling on AI calls or on any other spend (no check exists).
- Proof that a retry loop terminates (no check exists; only the `while` proxy above).
- Email tables that have no audit call in the caller, but are changed by a function, unless you move the audit call into the caller.

**Decisions for you (not made in the policy)**

- Tag the email tables (`customers`, `users`, `newsletter_subscribers`, `patients`, `support_tickets`) with a classification tag such as `pii`. The policy does not need tags, but a tag would let you scope or find these tables later. Tags decide which policies apply, so I did not add any.
- Whether `users.email` (sign-in accounts) and `patients.email` belong under the same audit rule. The policy covers them because they use the same field name. Check that this matches what you mean by customer email.
- Whether `delete_user_account` should write through `record_audit_event` as well.

Nothing has been pushed, and I have not evaluated the policies because that is outside this session. To see the real findings, run `xano policy evaluate` after you publish them, or use `xano workspace push --dry-run` to see what would change.
