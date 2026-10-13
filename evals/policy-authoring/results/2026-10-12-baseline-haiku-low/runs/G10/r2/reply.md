I wrote two policies that cover the first two parts of your request. The third part, limiting agents to the tools you list, can't be checked by a policy yet. Nothing is published; these are files for you to review.

**What I wrote**

1. **`AGENT-001`: AI agent tools don't delete data.** It flags any agent tool that calls `db.del` or `db.bulk.*` (deletes), either directly or through a function it calls. In your workspace this flags `delete_customer_note`, which runs `db.del customer_notes`. It also catches `delete_user_account` if a tool ever calls it.

2. **`AGENT-002`: AI agent tools that email customers need human approval first.** It flags any agent tool that sends email (`util.send_email`) without calling `request_human_approval` as its first statement. In your workspace, `send_customer_email` sends email with no approval step, so it will be flagged. `issue_refund` already follows this pattern.

Both policies are `active = true` with `enforcement = "advisory"`, so they report findings and block nothing.

**What the policies don't cover**

- **Tools you haven't given the agent.** Your agent (`support_agent`) already has an explicit `tools` list. No check reads an agent's tool list, so a policy can't stop it from calling a tool outside that list. This needs a platform check or a manual review.
- **Approval is checked for presence, not for the right approval.** AGENT-002 confirms the tool calls `request_human_approval` first. It does not confirm the call passes the approved `approval_id`, or that the approval matches the email being sent.
- **Deletes and emails outside agent tools.** The rules only look at tools. An endpoint or function that deletes or emails is not in scope. A tool that calls your own API (`api.call`) to delete something is not followed.

**Before you publish**

- I checked both files with `xano policy parse`, and both parse with no warnings. I did not run `xano policy evaluate`, and I did not create or push anything in the workspace.
- Findings will appear for `delete_customer_note` and `send_customer_email`. Fixing them is your decision: removing the delete, or adding the approval step.
