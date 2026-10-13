I've written two policy files in `out/`. They parse cleanly, but I have not published or evaluated them, so nothing is enforced yet. Your workspace is unchanged.

**1. `COST-001`: AI calls stay out of loops, and tasks don't use `while` (covers the $900 loop and the endless retries)**

- **AI call in a loop:** AI agent and MCP tool calls must not sit inside `foreach`, `for` or `while`. Your workspace's `nightly_ticket_summaries` task calls `ai.agent.run` once per open ticket inside a `foreach`, so this rule will flag it. That is the same shape as the $900 bill.
- **Retries forever:** background tasks may not use `while`. Your `retry_failed_webhooks` task loops with `while ($delivered == false)` and will be flagged. This is a proxy: it blocks the "retry until it works" loop shape, but it doesn't measure how many times a task runs.

**2. `AUDIT-001`: changes to email tables are audited (covers "who changed what")**

- The `audit_log` table must exist (it does in your workspace).
- Any object that adds, edits, patches or deletes rows in `customers`, `users`, `newsletter_subscribers`, `support_tickets` or `patients` must call `record_audit_event`. Your `customer_id_PATCH` already does; `customers_POST` and the newsletter subscribe endpoint do not, so they would be flagged.

**What these policies do not cover:**

- **Spend caps:** no check can read AI or vendor costs or cap spend. The only protection against a repeat of the $900 is a spend limit in your AI provider's billing console, plus the loop rule above.
- **Retry frequency:** a task that re-runs on its schedule (as `retry_failed_webhooks` does every 300 seconds) is not caught by the `while` rule. Task retry settings are not visible to policies.
- **"Every table that stores customer emails":** the policy names the five tables that have email fields today. A new email table is not picked up automatically. Checks can match fields by name, but I did not write one because it would also need a tag. If you want that, tag your email-holding tables (for example `pii`) and I can add a rule that requires the tag on any table with an `email` field. I have not added any tags to your workspace.
- **Reads:** the audit rule covers writes only. Who viewed a record is not tracked.
- **Audit correctness:** the rule checks that `record_audit_event` is called. It does not check what that call records.

**Next steps:** review the two files, then run `xano policy evaluate` (or `xano workspace push --dry-run`) to see the findings against your current code. Publishing is your call. The policies are advisory, so they report findings without blocking. Tell me if you want either one blocking.
