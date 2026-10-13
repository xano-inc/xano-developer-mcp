I drafted one policy, `AGENT-010`, for the approval part of your request. It is saved in my output folder and has not been published to your workspace. Your workspace has no policies yet.

**What it checks**

Every AI agent tool that deletes a record (`db.del`, `db.bulk.delete`) or sends an email (`util.send_email`) must call `request_human_approval` before that step runs. That function already exists in your workspace and stops the tool until a person approves the request. The policy is `active` and `advisory`, so it reports findings but blocks nothing. You can make it blocking later if you want it to stop merges and saves.

**What I expect it to flag** (a prediction; I have not run an evaluation)

- `delete_customer_note` deletes a note directly with no approval call.
- `send_customer_email` sends email directly with no approval call.
- `issue_refund` already calls `request_human_approval` first, so it should pass. It is not in the list of deletes and emails anyway.

Those two tools would need an approval call added before their delete or email step. Changing them is your decision, so I have not touched them.

**What I could not cover**

- **Agents calling tools you haven't given them.** No check can see which tools an agent is allowed to use, so I cannot write a rule for this. Your agent definition in `ai/agent/support_agent.xs` lists four tools; you can check that list by hand, and a future check may cover it.
- **"Can't delete anything."** I made deletes wait for approval instead of banning them, since you asked for approval. If you want deletes banned outright for agents, that is a different rule and I can write it.
- **Deletes and emails outside agent tools.** The policy only looks at AI agent tools. `delete_user_account` and `acme_send_invoice_email` are not agent tools, so they are not checked.

Next step: if you want this policy in your workspace, tell me and I will publish it, then run an evaluation so you can see the real findings.
