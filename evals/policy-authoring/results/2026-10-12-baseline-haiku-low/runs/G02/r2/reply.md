I drafted one advisory policy, `NAMING-010`, that flags names breaking your convention. It never blocks anything. I have not published it or run an evaluation; those steps are still to do, and I can run them when you say so.

**What it checks**

- **Endpoints are lowercase snake_case.** Each segment of an endpoint path must be snake_case. Path parameters like `{customer_id}` are skipped.
- **Functions are snake_case and start with `acme_`.** I assumed `acme_` as the client prefix because five functions here already use it. Tell me if the prefix is different.
- **Tables are plural: not covered.** No check in the platform can tell whether a table name is plural. Nothing in this policy checks it. Your `invoice_item` table is singular, so it would be a candidate for a manual review.

**What it would flag in this workspace** (predicted from reading the definitions, not from an evaluation run)

- Endpoints: `bank-accounts/link` (hyphen, not underscore) and `getCustomerProfile` (camelCase).
- Functions: `calculateLateFee` (camelCase and no prefix), and `check_admin_role`, `delete_user_account`, `record_audit_event`, `request_human_approval` and `summarize_ticket` (no `acme_` prefix). The five `acme_` functions should pass.

**Things to decide before you roll this out**

1. The prefix is per client. A policy lives in one workspace, so each of your 12 workspaces needs its own copy with its own prefix. Tell me the prefixes and I can write them.
2. Renaming an endpoint or function breaks callers and `function.run` calls. I would not rename anything from this policy. If you want existing names kept, I can add them to an exemption list, but that is your call, not something I should add silently.
3. Do you want hyphenated paths like `bank-accounts` treated as a violation? The policy currently says yes, because you asked for snake_case.
