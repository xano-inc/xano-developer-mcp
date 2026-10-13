I drafted one naming policy for this workspace. It is written to `out/NAMING-001.xs`, parses cleanly, and is **not published**. It is set to `active = true` and `enforcement = "advisory"`, so it flags violations and blocks nothing.

**What it checks**

- **Endpoint paths are lowercase snake_case.** Each path segment is judged on its own. Flagged here (predicted from the workspace, not yet evaluated): `bank-accounts/link` (kebab-case) and `getCustomerProfile` (camelCase).
- **Table names are plural.** The check is a suffix check on `s`. Flagged here (predicted): `invoice_item`, `payment_method`, `user_address`, `audit_log`.
- **Function names start with the client prefix.** Flagged here (predicted): `check_admin_role`, `delete_user_account`, `record_audit_event`, `request_human_approval`, `summarize_ticket`, `calculateLateFee`.

**Things to decide**

1. **The prefix.** I assumed `acme_` is this client's prefix, because it is the one used by the five functions that already have it. Please confirm it. The prefix is per client, so each of the 12 workspaces needs its own copy of the policy with that client's prefix.
2. **Renames are yours to make.** Renaming an endpoint or function changes every URL and call that uses it. The policy only flags. Exempting a deliberate name is the owner's call, and I did not add any exemptions.
3. **Plural check false positives.** A suffix check cannot tell that a word like `people` is plural. If a table like that exists, it will be flagged until someone decides how to handle it.

**Not covered**

- The "lowercase snake_case" request is checked on endpoint paths only. Inputs and table fields are not included, because you did not ask for them.
- I did not use the `CONV-012` template. Its rule requires kebab-case endpoint paths, which is the opposite of what you asked.

**Next steps**

Nothing has been published or evaluated. To publish, run `xano policy parse` again and then push or create it yourself. I can run `xano policy evaluate` once it is in the workspace, to check the predicted findings above against the real output.
