I wrote one policy, `AGENT-010`, for your AI agent tools. It covers two of your three requirements. There is no check for the third, so I have not written a rule for it.

**What the policy does** (`out/AGENT-010.xs`, active and advisory, so it reports findings and blocks nothing):

1. **No deleting.** `stack.statement_forbidden` flags `db.del`, `db.bulk.delete` and `db.truncate` in any tool, or in any function a tool calls. Your agent tool `delete_customer_note` uses `db.del` on `customer_notes`, so I expect it to be flagged.
2. **Human approval before email.** `stack.statement_order` requires `request_human_approval` to run before every `util.send_email` in a tool. `send_customer_email` sends with `util.send_email` and does not call the approval function, so I expect it to be flagged. `issue_refund` already calls `request_human_approval` and does not send email, so I expect it to pass.

Both rules apply only to tools (`object_kinds: ["tool"]`), so they do not touch your endpoints or functions.

**What is not covered: "they shouldn't be able to call tools I haven't explicitly given them."** No Xano check reads which tools an agent is given. The `ai.agent` objects are in scope for the policy checks, but no check looks at an agent's `tools` list. Your agent `support_agent` already lists its four tools explicitly, so the current state is fine, but nothing will flag a future addition. Options, for you to decide:
- Review changes to `support_agent`'s `tools` list by hand, or in your code review.
- Keep a tag on each tool and check it in your own tooling.

**Limits to know about:**
- The email rule checks ordering inside the tool and the functions it calls. It does not check that a person actually approved the request; `request_human_approval` does that and throws until approval exists.
- A tool that sends email by a route other than `util.send_email` (for example, an `api.request` to an email provider) would not be caught by this rule.
- Deletion inside a tool is caught only through the statements listed. A delete through a new statement name would need adding to the list.

**Not run yet.** I have not published or evaluated the policy. The findings above are predictions from reading the stored definitions. To check them, run `xano policy evaluate` after you push or publish it. The file parses with no rule warnings.

Next step if you want it: tell me to publish `AGENT-010` as is, or tell me which part to change.
