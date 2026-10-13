I drafted one advisory policy, `NAMING-001`, that flags naming drift without blocking anything. It is not published yet; I have not changed your workspace.

**What it checks**

1. **Tables are plural.** Table names must end in `s`.
2. **Endpoint paths are lowercase snake_case.** Each path segment is judged on its own; `{param}` segments are skipped.
3. **Functions start with the client prefix** and are lowercase snake_case. The draft uses `acme_`, the prefix I can see in this workspace.

The policy is `active = true` with `enforcement = "advisory"`, so findings are reported and a push is not blocked. Severity is low, matching the built-in convention policies.

**What I predict it will flag in this workspace** (predictions from reading the workspace; I have not run `xano policy evaluate`)

- Tables: `payment_method`, `invoice_item`, `user_address`, `audit_log` (singular names).
- Functions without the `acme_` prefix: `calculate_late_fee`, `check_admin_role`, `record_audit_event`, `summarize_ticket`, `delete_user_account`, `request_human_approval`.
- Endpoint paths: I expect none, since the ones I read are already snake_case.

**What the policy cannot do yet**

- **Client prefixes differ per client.** One rule cannot know which client a workspace belongs to. For each of your 12 workspaces, the prefix in the function rule has to be that client's prefix. If you want one file shared across all of them, tell me the 12 prefixes and I will check whether a single list works or whether each workspace needs its own copy.
- **Plural tables.** A plural that doesn't end in `s` (such as `people`) will be flagged. Those need an exemption, which is your call, so I did not add one.
- **Existing names.** Renaming a table, function or endpoint changes every caller and query, so I have not proposed renames. The findings will show what needs a decision.

I have not published or pushed anything. The next step is to confirm the `acme_` prefix is right for this workspace, then run `xano policy evaluate` to check my predictions.
