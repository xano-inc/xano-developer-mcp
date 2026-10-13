Hi, I wrote three policies for your workspace. None is published yet; they are files in `out/` for you to review first.

**1. `COST-001`: AI calls and retried requests stay out of loops** (high, advisory)
- AI agent runs and MCP tool runs may not be made inside `foreach`, `for` or `while`. This is the pattern behind a runaway bill.
- HTTP requests (`api.request`) may not be made inside a `while` loop. This is the pattern behind a retry that never ends.

What this does not cover: it does not cap spend, it does not read how often a task runs, and it cannot see retry settings. Tasks have no retry setting a policy can read yet. The `while` rule catches the pattern, not the retry itself. A task that retries on a plain schedule without a loop would pass.

In your workspace, I read two things that this would flag:
- `nightly_ticket_summaries` calls `ai.agent.run` inside a `foreach`.
- `retry_failed_webhooks` makes `api.request` inside a `while ($delivered == false)` loop with no limit.

I have not run `xano policy evaluate`, so these are predictions from reading the code, not findings.

**2. `RET-001`: Only the audit function writes the audit log** (high, advisory). This is the standard template. It checks that `audit_log` exists and that only `record_audit_event` writes to it. Both exist in your workspace.

**3. `AUDIT-001`: Changes to customer-email tables call the audit function** (high, advisory)
- For `customers`, `users`, `newsletter_subscribers`, `support_tickets` and `patients`, every add, edit, patch and delete must call `record_audit_event` on every path.
- The `support_tickets` table has `requester_email`, and `patients` has `email`. These are the tables with email fields.
- `orgs.billing_email` is not in the list because it stores an organisation's address, not a customer's. Tell me if you want it added.

What this does not cover: it checks that the call is present, not who the actor is or what changed. It does not cover bulk writes (`db.bulk.*`), `db.add_or_edit`, or raw SQL.

From reading the code, I expect `nightly_ticket_summaries` to be flagged here too, because it edits `support_tickets` without an audit call.

**Decisions for you:**
- None of your tables has a tag yet. I did not add a "tracked" or "pii" tag. If you want a tag-based rule that finds every email table automatically, tag those tables first, then I can switch the rule to use the tag. I did not touch the workspace.
- The policies are advisory. Making them blocking would stop merges and pushes that introduce a finding; that is your call.

Nothing has been pushed or evaluated.
