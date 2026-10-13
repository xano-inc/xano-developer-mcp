I can cover two of your three rules with checks. Table plurality has no check, so it isn't covered. I drafted both policies as advisory and active, so they flag but never block.

**1. Functions are snake_case and start with the client prefix** (`out/CONV-010.xs`)
- Uses the `object.naming` check on functions with `case_style: snake_case` and `prefixes: ["acme_"]`.
- I assumed the prefix is `acme_`, because that is the prefix most functions in this workspace already use. If a client uses a different prefix, tell me and I'll change it.
- Predicted from the workspace, not from a run: `acme_send_invoice_email`, `acme_get_tracking`, `acme_sync_shipping_rates`, `acme_calculate_tax` and `acme_notify_sms` pass. `calculateLateFee`, `check_admin_role`, `delete_user_account`, `record_audit_event`, `summarize_ticket` and `request_human_approval` would be flagged.

**2. Endpoint paths are lowercase snake_case** (`out/ENDPOINT-NAMING-010.xs`)
- Uses `object.naming` with `name_kind: endpoint_path` and `case_style: snake_case`. Path segments that hold a `{parameter}` are skipped.
- I did not use the platform's own endpoint template (CONV-012), because it requires versioned kebab-case, which is the opposite of what you asked for.
- Predicted to be flagged: `bank-accounts/link` (kebab-case) and `getCustomerProfile` (camelCase). Everything else passes.

**Not covered: tables are plural.** No check reads whether a table name is plural. A pattern that only looks for a trailing `s` would be a poor stand-in: it would miss `address` and wrongly pass names like `status`. I left this out rather than fake it. A plural-noun check would need a product change, or you could review table names by hand.

**Before you publish:**
- These policies are per workspace, and each client's prefix is different. You'll need one function-prefix policy per client workspace, each with that client's prefix. The endpoint policy can be shared.
- I haven't published anything. I only read the workspace and parsed the two files, which both passed. Publishing or evaluating is a step you run yourself, after you've checked the prefix and the scope.
