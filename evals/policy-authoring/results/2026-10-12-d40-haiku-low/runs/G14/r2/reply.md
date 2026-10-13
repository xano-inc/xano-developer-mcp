Thanks for the detail. Here is what I can set up, what I can't, and what I need from you. I have not published or pushed anything: these files are drafts in `out/`, and nothing in your workspace has changed.

**1. The $900 AI loop: covered (COST-001, advisory)**

`COST-001` flags any AI agent call (`ai.agent.run`) or MCP tool call made inside a `foreach`, `for` or `while`. It is a draft that parses cleanly.

I expect it to flag one place in your workspace: `task/nightly_ticket_summaries` calls the Ticket Summarizer agent for every open ticket inside a `foreach`. This is a prediction from reading the files. I have not run the policy check against your workspace.

Limits:
- It stops AI calls inside loops. It does not cap spend. No check reads what a call costs, so a daily budget is not something a policy can enforce.
- It does not follow function calls. An agent call inside a function that a loop calls is not reported.

**2. The background task that retries forever: not covered**

No check can see how often a failed task runs again. Tasks have no retry setting a policy can read. I could not write a rule for this honestly.

The code itself has the problem. In `task/retry_failed_webhooks`, the `while ($delivered == false)` loop has no attempt limit, and the task runs every 300 seconds. A webhook that never returns 200 is retried forever. This is a code fix for you or your developer: add a maximum attempt count and mark the delivery as failed when it is reached. I have not changed the code.

**3. Tracking who changed customer emails: covered in part (RET-001 and AUDIT-001, advisory)**

- `AUDIT-001` requires every create, edit, patch and delete of these tables to call the `record_audit_event` function: `customers`, `support_tickets`, `newsletter_subscribers`, `users`, `patients` and `orgs`. These are the tables with an email field in your workspace. Please confirm that list. I included `patients` and `users` because they hold emails, but drop any you don't want.
- The same policy blocks writes to `audit_log` from anywhere except that function, and forbids edits and deletes of audit entries.
- `RET-001` checks that the `audit_log` table exists and is only written by `record_audit_event`. Your workspace already has both.

What this does not cover:
- Writes inside functions are not inspected. For example, `delete_user_account` deletes from `users` inside a function, and `summarize_ticket` edits `support_tickets` inside a function. A policy only checks the statements in queries, tools, tasks and messages.
- Your nightly summary task writes to `support_tickets` without calling the audit function. I expect `AUDIT-001` to flag that. It is a real gap in the audit trail, and you can decide whether to add an audit call there.
- Creating a record by a function call is not checked. Only the statements listed above are.
- An audit entry only shows who made a change if the caller passes the user. The existing `customers` PATCH endpoint does this.

**Decisions for you**

- All three policies are advisory. They report findings but block nothing. If you want them to block merges or saves, that is your choice, and I can make that change when you ask.
- Tags: the policies carry labels (`cost`, `soc2`), but no table or function needs a tag for these rules to work.
- Email tables: confirm the list above. I can also add a rule that every table holding an email carries a tag such as `pii`, but your tables have no tags yet, so that rule would flag all of them until you tag them.

**What I'd do next:** publish `COST-001`, `RET-001` and `AUDIT-001` as advisory after you confirm the email table list. Then run the policy check, which will show you the real findings.
