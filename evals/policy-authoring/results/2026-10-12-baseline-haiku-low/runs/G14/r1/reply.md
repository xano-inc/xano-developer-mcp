Hi, I looked at your workspace and wrote one policy for the cost part. The email-tracking part I could not cover with a policy, and I explain why below.

**1. Cost: AI calls in loops and retries that never stop (`COST-001`, in `out/COST-001.xs`)**

The policy has two rules:

- **AI calls can't sit inside a loop.** It flags any `ai.agent.run` inside a `foreach`, `for` or `while`. This is the pattern behind the $900 bill. In your workspace, the `nightly_ticket_summaries` task calls the Ticket Summarizer agent once per open ticket inside a `foreach`, so this rule should flag it. The `summarize_ticket` function and the support chat call the agent outside any loop, so they should pass.
- **Background tasks can't use `while`.** It flags any `while` in a task. The `retry_failed_webhooks` task (every 300 seconds) loops with `while ($delivered == false)` and has no retry limit, so this rule should flag it.

Both rules are advisory, so they report findings but don't block anything. I have not run `xano policy evaluate` yet. The file parses cleanly with no warnings, and the rules match the names in your workspace.

What this does not cover:

- **It does not cap spend.** Nothing in Xano measures what an AI call costs or sets a budget. The policy only stops AI calls from being made inside loops.
- **The `while` rule is blunt.** It flags every `while` in a task, not only unbounded ones. A bounded retry will be flagged too, and the owner can decide whether to exempt it.
- **It does not check retry counts or schedule frequency.** No check reads them.

**2. Tracking who changed customer emails**

I did not write a policy for this. No check verifies that a table's changes are recorded. A tag would only label a table; it would not record who changed what. I checked the tables that hold email addresses: `customers`, `users`, `newsletter_subscribers`, `patients` (`email`), `support_tickets` (`requester_email`), and `orgs` (`billing_email`). None of them has a tag, and the workspace has no tag set for this. Adding tags is a change to your workspace, so I did not make it.

Your workspace already has an `audit_log` table and a `record_audit_event` function, which is a start. Two things would close the gap:

- Make sure every write to those tables calls `record_audit_event`. The code would need to change for this, and no check verifies it today.
- If you want a policy that flags writes to the email tables that skip the audit function, I can write one. This needs a decision from you about which tables and which function to use first.

Nothing in the workspace has changed. I have not published, pushed or evaluated anything.
