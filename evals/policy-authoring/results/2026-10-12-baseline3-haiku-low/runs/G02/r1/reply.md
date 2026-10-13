Here is what I would set up. Both policies are advisory and active: they flag and never block a save, merge or push.

**Two policy files written (in `out/`):**

1. **`CONV-010.xs`: Functions are snake_case and carry the client prefix.** One `object.naming` rule on functions: snake_case, prefix `acme_`.
2. **`CONV-NAMING-ENDPOINTS.xs`: Endpoint path segments are lowercase snake_case.** One `object.naming` rule on endpoint paths: snake_case. Path parameters like `{customer_id}` are skipped.

**Assumption to confirm:** I used `acme_` as the client prefix because it is the only client-style prefix in this workspace (`acme_calculate_tax`, `acme_get_tracking`, and so on). If this workspace belongs to a different client, tell me its prefix and I will change the `prefixes` value.

**What the policies should flag, from reading the workspace (predicted, not run):**
- Functions that lack the `acme_` prefix: `check_admin_role`, `record_audit_event`, `delete_user_account`, `request_human_approval`, `summarize_ticket`, and `calculateLateFee`, which is also camelCase.
- Endpoint paths that break snake_case: `getCustomerProfile` (camelCase) and `bank-accounts/link` (kebab-case). The rest of the paths I read pass.

**What I could not cover:**
- **Tables are plural.** No check tests whether a name is plural. A regex on a trailing `s` would be a guess: it passes `address` and `status`, and it fails nothing that is actually singular in a way you would care about. Singular tables in the workspace today are `invoice_item`, `payment_method` and `user_address`, but I have not written a rule for them. This needs a human decision or a new check.

**Renames are your call.** Renaming a function changes every `function.run` call, and renaming an endpoint path changes the URL your callers use. Existing names that must stay can be listed in `allowed_names` by the policy owner.

**Note:** `xano policy evaluate` was not run here, since this is a read-only pass. Run it after you publish to see the real findings.
