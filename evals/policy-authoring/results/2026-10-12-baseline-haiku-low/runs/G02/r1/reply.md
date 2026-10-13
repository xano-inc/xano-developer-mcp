Here is a policy I'd publish for your naming conventions: `CLIENT-NAMING` (file `out/CLIENT-NAMING.xs`). It's active and **advisory**, so it flags names and blocks nothing.

**What it checks**

1. **Endpoints are lowercase snake_case.** Checks each endpoint path segment against snake_case. Paths with `{param}` segments skip those segments.
2. **Tables are plural.** Checks each table name against a pattern that requires a trailing `s`. This is an approximation, not a true plural check, so a word like `status` would pass and a correctly plural name without a trailing `s` would fail. Treat it as a flag to review.
3. **Functions start with `acme_`.** I used `acme_` because it's the prefix the functions in this workspace already use. You have 12 clients, so each client's workspace needs its own prefix. If this one isn't `acme_`, tell me the right prefix and I'll change it.

**What the workspace has right now** (I read it but did not push or evaluate anything, so these are predictions):

- Endpoint paths that would be flagged: `getCustomerProfile` (camelCase) and `bank-accounts/link` (hyphens).
- Tables that would be flagged: `audit_log`, `invoice_item`, `payment_method`, `user_address`.
- Functions that would be flagged (7 of 12): `calculate_late_fee`, `calculateLateFee`, `check_admin_role`, `record_audit_event`, `summarize_ticket`, `delete_user_account`, `request_human_approval`.

**Things to decide**

- **Endpoint paths vs. the platform's default.** The platform's own endpoint-path template asks for versioned kebab-case (`v1/order-items`). That conflicts with your snake_case request, so I did not use that template. If you want kebab-case instead, say so.
- **Existing names.** Renaming an endpoint, table or function changes the URLs and calls that depend on it. I haven't proposed renames. If a name is kept on purpose, the policy owner can exempt it; I'd rather you decide that than have me add an exemption.
- **Plural check.** If you want a stricter plural check, a dictionary of allowed exceptions would be needed, and that's your call.

**Not covered:** nothing in the request lacks a check, but the plural rule is approximate, as noted above.

I have not published or evaluated this policy. To see the real findings, run `xano policy evaluate` after you approve it.
