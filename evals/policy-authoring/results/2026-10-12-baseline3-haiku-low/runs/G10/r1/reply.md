I wrote two policies that cover most of what you asked. They're drafted, not published, and the workspace is unchanged.

**What they do**

- **AGENT-010** (`out/AGENT-010.xs`): For each AI agent tool, a database delete (`db.del`, `db.bulk.delete`) or customer email (`util.send_email`) must come after a call to `request_human_approval`. Right now that's the only approval function in the workspace, and it stops the action until a person approves it.
- **AGENT-020** (`out/AGENT-020.xs`): Any agent tool that sends email must call `request_human_approval` on every path, not just sometimes. This closes the gap where an approval call sits inside an `if` that can be skipped.

Against your workspace, these two rules would flag the current tools:
- `delete_customer_note` deletes a row with no approval step.
- `send_customer_email` emails a customer with no approval step.
- `issue_refund` already calls `request_human_approval`, so it should pass.

**What I couldn't cover**

- **"They shouldn't call tools I haven't given them."** No policy check can do this. The agent-level checks only look at settings, naming, tags and secrets, not the agent's tool list. The agent's `tools = [...]` list is still the only control. If you want a guard, a review step or a CI test on that list is the way to go.
- **Blanket delete ban.** I scoped deletes to approval rather than forbidding them, because you said "without a human approving." If you want deletes banned outright for agents, `stack.statement_forbidden` on `db.del` and `db.bulk.delete`, scoped to `object_kinds: ["tool"]`, would do it. Note that it would also flag the `delete_user_account` path if the scope were wider.
- **Whether the approval actually gates the action.** The rules check that the call is present and ordered before the action. They don't check that the approval's `approval_id` is passed through or that the approval was granted. That's runtime behaviour, which a policy can't check.

**Before you rely on this**

These are advisory policies and haven't been evaluated against your workspace. Once you've reviewed the files, publish them with the xano CLI or Studio, then check the findings against the two tools above.
