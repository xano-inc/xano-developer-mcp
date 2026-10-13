I wrote one policy, `AGENT-010`, for the approval part of your ask. It is saved as a file only and nothing has been published to your workspace. The tool-allowlist part can't be covered by a policy yet.

**What the policy does**

`AGENT-010` (`out/AGENT-010.xs`) requires every AI agent tool that deletes records or sends email to call `request_human_approval` before the delete or email runs. It checks the tools in your workspace: `delete_customer_note` (deletes), `send_customer_email` (emails), `lookup_order` and `issue_refund`. The check watches the call order inside each tool. It does not verify what the approval function decides. Deletes are `db.del`, `db.bulk.delete`, `db.truncate` and `db.direct_query`. Emails are `util.send_email`. A delete or email reached through a function a tool calls is also caught.

Based on reading the tool code, I expect the policy to flag `delete_customer_note` and `send_customer_email`, since neither calls `request_human_approval`. `issue_refund` already follows the pattern. I could not run the check against your workspace, so this is an expectation, not a result.

The policy is `active = true` and `enforcement = "advisory"`. It flags but does not block anything. Making it blocking is your call, and it would then refuse saves and merges that introduce these findings.

**What it cannot do**

- **Stop agents from calling tools you haven't given them.** No check reads an agent's tool list. The only agent setting a check can read is its model provider. You will need to keep that list in review yourself (the `tools = [...]` block in `ai/agent/support_agent.xs`).
- **Verify the approval itself.** The policy confirms that `request_human_approval` runs first. It does not confirm that the person approved the action. `issue_refund` depends on that function's own check.

**Decisions for you**

- I did not add a rule that forbids deletes in tools outright. Your ask was approval-gated deletes, and a blanket ban would also stop approved deletes.
- If you do not use external MCP servers, a rule forbidding `ai.external.mcp.*` in tools would stop agents from reaching tools outside your workspace. I did not add it, since you didn't ask for it and it's a broad restriction.
- `db.direct_query` is in the list because raw SQL can delete. It also catches reads, so remove it if you don't want that.
