Here's a draft of two policies for your AI agents. They are files on my side only: nothing has been created, published or pushed to your workspace.

**1. `AGENT-010`: AI agent tools don't delete data**
Blocks `db.del` and `db.truncate` in any agent tool. Right now that catches `delete_customer_note`. It also follows functions that a tool calls, so a delete hidden inside a helper function is caught too.

**2. `AGENT-020`: AI agent emails need human approval**
Any agent tool that calls `util.send_email` must call `request_human_approval` unconditionally, at the top level of its stack, so it can't be skipped by an `if`. Right now `send_customer_email` has no approval step, so this rule would flag it. Your `issue_refund` tool already follows this pattern and would pass.

**What I could not cover**

- **"Shouldn't be able to call tools I haven't given them."** No Xano policy check reads an agent's tool list. The closest checks look at the agent's model provider, not its tools. Your `support_agent` tool list is explicit, but a policy can't enforce that it stays that way.
- **Approval is enforced by a policy, not at runtime.** These policies read your stored definitions. They confirm that the tool has the approval call, but they don't stop an agent at runtime.

Both policies are set to advisory, so they report findings but don't block a save, merge or push. If you want them to block, that's a change you can make later.

Next steps (I haven't run these): `xano policy evaluate` after you decide whether to publish. Expected findings are `delete_customer_note` for AGENT-010 and `send_customer_email` for AGENT-020.
