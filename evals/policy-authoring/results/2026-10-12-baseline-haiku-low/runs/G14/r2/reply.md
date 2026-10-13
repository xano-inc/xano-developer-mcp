I wrote two policies to `out/` (not published; your workspace is unchanged). They parse cleanly, but I have not run them against your workspace, so treat the list of affected objects below as a prediction.

**1. `COST-001`: AI calls and retries stay out of unbounded loops**

- **AI agent runs are not inside a loop.** This would have caught the `$900` pattern: an `ai.agent.run` inside a `foreach`, `for` or `while`. Your `nightly_ticket_summaries` task calls `ai.agent.run` inside a `foreach` over open tickets, so I expect it to be reported.
- **Outbound requests are not retried inside a `while` loop.** Your `retry_failed_webhooks` task has an `api.request` inside a `while ($delivered == false)` with no attempt limit. I expect it to be reported.

What this does not cover: it cannot tell whether a loop is bounded. A `while` loop that makes no outbound request, or a retry written some other way, is not caught. Your current `while` has no attempt cap, so the rule flags it as a loop with an outbound call, not as "retries forever" specifically. Capping the retries is a code change for you to make; I have not made it.

**2. `AUDIT-001`: changes to customer email tables are audited**

I scoped this to the tables that hold email addresses: `customers`, `users`, `newsletter_subscribers`, `support_tickets` (`requester_email`) and `patients`. Every insert, edit, patch and delete on those tables must call `record_audit_event` unconditionally in the same stack. That function writes a row to `audit_log` with the actor, action, table and changes.

- Your `customer_id_PATCH` endpoint already calls `record_audit_event`, so I expect it to pass.
- I expect these to be reported: `customers_POST` (`db.add customers`), `newsletter/subscribe_POST` (`db.add newsletter_subscribers`), and the `db.edit support_tickets` in `summarize_ticket` and `nightly_ticket_summaries`.

**Things I could not do, and what would fix them**

- **Tag-based scope.** None of your tables carry a tag, so I scoped by table name instead of a tag such as `pii`. The downside is that a new table holding emails will not be covered until someone adds it to the list. If you tag the email tables (for example `pii`), I can switch to `object.tagged_table_access`, which is the better long-term form. Tagging is your decision, so I have not proposed the exact tags beyond that.
- **Whether the audit call is correct.** The check confirms the function is called, not that it records the right fields. It also cannot see writes made through other functions unless those functions are followed.
- **Public newsletter sign-up.** `newsletter/subscribe_POST` is a public endpoint. Adding an audit call there is a design choice (it runs without a login, so `actor_id` will be empty). I have listed it in the rule but have not decided for you.

**Next steps for you**

1. Decide whether to publish these as `advisory` (what they are now) or `blocking`. Advisory only reports findings.
2. Decide whether the email-table list is right, or whether you want to tag the tables first.
3. Tell me which findings you want fixed, one object at a time. I will not edit code without your go-ahead.

I have not run `xano policy evaluate` or `xano workspace push`, so none of the predictions above are confirmed.
