I've drafted one policy, `AI-TOOL-001`, in `out/AI-TOOL-001.xs`. It parses cleanly. I have not published it or run it against your workspace, so nothing is live yet.

**What it covers**

1. **No deletes from AI tools.** A rule forbids `db.del`, `db.bulk.delete`, `db.truncate` and `db.direct_query` in any tool (`ai/tool/*`), including inside a function a tool calls. I also included raw SQL because it can delete rows. Your tool `delete_customer_note` (which runs `db.del` on `customer_notes`) would be flagged.
2. **No emails without a human approving first.** A rule requires `request_human_approval` to run before any `util.send_email` in a tool. Your `send_customer_email` tool doesn't call it yet, so it would be flagged. Your `issue_refund` tool already calls it before its Stripe request, so it would pass.

**What it doesn't cover**

- **Tools the agent wasn't given.** No check limits which tools an agent can expose, so the policy can't enforce "only tools I've listed." You'd need a review step outside Xano for that. The policy doesn't stop an agent from being given a tool you didn't intend.
- **Email sent some other way.** The rule only looks for `util.send_email` in tools. An email sent over a raw HTTP request to a mail API wouldn't be caught.

**Assumptions I made**

- "Can't delete anything" means deletes are blocked outright, not gated by approval. If you want deletes to be possible with approval, tell me and I'll change the rule.
- Approval is checked by call order only. The policy confirms `request_human_approval` runs before the email. It doesn't check what that function decides.

**What I'd expect from a run (not run yet)**

- `delete_customer_note` would be flagged by rule 1.
- `send_customer_email` would be flagged by rule 2.
- Fixing `send_customer_email` means adding a `request_human_approval` call before the send. That changes how the tool behaves for the agent, so I'd check with you before making it.

The policy is `active` and `advisory`, so it blocks nothing. If you want it to block merges and pushes, that's your call. Tell me and I'll set `enforcement = "blocking"` and show you what it would block.

Should I publish it, or would you like changes first?
