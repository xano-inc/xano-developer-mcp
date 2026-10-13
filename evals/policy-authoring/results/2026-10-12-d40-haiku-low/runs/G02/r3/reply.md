I've drafted one advisory policy, `CLIENT-NAMING`, that flags naming drift without blocking anything. It has three rules, all using the `object.naming` check:

1. **Endpoint paths are lowercase snake_case.** Flags paths such as `bank-accounts/link` and the query `getCustomerProfile`.
2. **Table names are plural.** Checks that each name ends in `s`. In this workspace that flags `audit_log`, `invoice_item`, `payment_method` and `user_address`.
3. **Function names start with the client prefix.** Flags the functions that lack the prefix, such as `calculateLateFee`, `calculate_late_fee`, `check_admin_role`, `delete_user_account`, `record_audit_event`, `request_human_approval` and `summarize_ticket`.

The policy is `active = true` and `enforcement = "advisory"`, so findings show up but nothing is refused or blocked. It parses cleanly. I have not published it or run an evaluation, so the findings above are my prediction from reading the workspace, not a result.

Before you publish, I need you to confirm a few things:

- **The client prefix.** I used `acme_` because it is the prefix the functions in this workspace already use. Tell me the prefix for this client, and I'll change the rule. Each client workspace needs its own prefix.
- **Plural check.** The check tests for a trailing `s`, not real English plurals. A table such as `people` would be flagged, so tell me any names that should be exempt and I'll list them in `allowed_names`.
- **Endpoint paths and house style.** Xano's standard endpoint-path template expects kebab-case, not snake_case. This policy follows what you asked for. If your other clients use kebab-case, tell me and I'll adjust.
- **Tool and task names.** The rules cover endpoints, tables and functions only. AI tools, agents and tasks are not checked.
- **Path parameters.** I'm not sure whether the endpoint rule reads the `{customer_id}`-style segments in paths. I'll confirm that when the policy is evaluated.
