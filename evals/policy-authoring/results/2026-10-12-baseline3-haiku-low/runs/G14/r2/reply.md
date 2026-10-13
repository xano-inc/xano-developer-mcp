I've drafted two policies. Neither is published or pushed yet, and I haven't evaluated them against your workspace. Both are advisory, so they report findings and block nothing.

**1. Cost guard (`COST-010`)**

Two rules, both on code that is stored in your workspace:

- An `ai.agent.run` call inside a `foreach` or `while` loop is reported. In your workspace this matches the nightly task `nightly_ticket_summaries`, which calls the Ticket Summarizer once per open ticket.
- A `while` loop in a background task is reported. This matches `retry_failed_webhooks`, which retries with `while ($delivered == false)` and has no attempt limit.

What this does not cover:

- It does not stop anything at runtime, and it cannot see dollar amounts. Xano policies check the stored definitions, not what a run costs.
- It only checks direct calls. An AI call made inside a function that a loop calls is not caught.
- There is no check for a retry count or a budget. Fixing the retry task means adding a counter, which is a code change for you to decide on. I have not changed any code.
- For a hard spend cap, use your cloud provider's budget and alert settings. Policies can't provide one.

**2. Customer email tracking (`CUST-010`)**

- **Rule 1** requires tables with an email field to carry a `pii` tag. Your email tables are `customers`, `users`, `newsletter_subscribers`, `patients` and `support_tickets` (`requester_email`). None of them has a tag yet, so all of them will be reported. Adding the tag is a workspace change you need to make. I have not added it.
- **Rule 2** requires every object that reaches a `pii` table to call `record_audit_event` unconditionally. The audit function already exists and writes to `audit_log`. The check cannot tell whether a write is audited. It can only confirm that the audit call is in the same object. It also requires a login, so public objects that touch these tables will be reported. Two examples are the newsletter sign-up and `login_POST`. Exempting one of those is your decision, not something the policy does by default.

Rule 2 shows a warning until the `pii` tag exists on at least one table. That is expected.

**Before you publish:** add the `pii` tag to the email tables, and decide how public endpoints that touch them should be handled. Until then, the findings will be noisy.

I have not published, pushed or evaluated anything.
