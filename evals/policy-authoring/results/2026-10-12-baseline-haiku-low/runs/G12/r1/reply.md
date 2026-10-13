Hi, thanks for the ask. I looked through the workspace (`policy-authoring-eval`) and the policy catalogue, and I don't think a policy can enforce either half of this request. I have not written a policy file, so nothing has been added to the workspace.

**1. "Production data never ends up in staging"**
No built-in check looks at where data goes between environments. The checks cover what an object fetches, returns, writes, logs, or sends to vendors. None of them can tell whether a row or value copied from prod into staging. The closest checks are `outbound.vendor_allowlist` (which vendors a request may call) and `db.direct_query` coverage, and neither addresses this. The workspace also has no environment marker I could check (no environment field on the tables, no prod/staging tag). Tenant records in `tenants` hold a `db_connection_string`, which is worth handling separately, but that is a secrets question, not a prod-to-staging one.

**2. "Devs only get into prod through the on-call process"**
Who may access production is a platform access and org process question: roles, on-call rotation, and approval. Policies here are evaluated against the stored definitions in a branch, not against people or their access. That needs an org-level control, not a policy.

**What would help**
- A check or scope that recognises environments (for example, a branch or environment tag on tables, or a rule that a staging branch must not reference production connection values) would let a policy cover part of item 1.
- Item 2 is best handled in your identity provider or Xano's access controls, with the on-call approval recorded there.

If you can tell me how prod and staging are separated today (separate workspaces, branches, or separate `db_connection_string` values), I can check whether any existing rule would apply, and I can propose a tag or field for the team to decide on. Adding a tag or field to a table is your call, so I have not made any change.
