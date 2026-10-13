I drafted two policies for your agents. Nothing is published yet: I haven't created, pushed or evaluated anything in your workspace.

**1. `AGENT-001`: AI agent tools don't delete data.** It forbids `db.del` and `db.bulk.delete` in every agent tool, including anything a tool calls through a function. Your `delete_customer_note` tool would be flagged. The fix is to archive or flag the note instead of deleting it.

**2. `AGENT-002`: AI agent tools email customers only after human approval.** It requires a `request_human_approval` call to run before any `util.send_email` in a tool. Your `send_customer_email` tool has no such call, so it would be flagged. `request_human_approval` throws until a person has approved the request, so the email never sends without that approval, as long as the tool passes the `approval_id` through, as `issue_refund` does.

Both are new and advisory: they report findings but don't block a push. Switch to `enforcement = "blocking"` only once you're happy with what they flag.

**What I could not cover:** "they shouldn't be able to call tools I haven't explicitly given them." No policy check looks at an agent's tool list, so I can't write a rule for this. Your agent config (`support_agent`) already lists its four tools explicitly. Restricting that at runtime is outside what policies can check.

Both policies are in `out/` as `AGENT-001.xs` and `AGENT-002.xs`. Both parse cleanly. I haven't run `xano policy evaluate`, so the flagged objects above are predictions from reading the tool definitions.
