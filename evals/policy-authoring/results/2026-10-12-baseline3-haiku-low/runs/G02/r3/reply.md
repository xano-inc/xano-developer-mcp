I wrote three advisory policies for this workspace. They flag names that break the convention and never block a push.

**What I set up**

- **NAMING-001, endpoints are lowercase snake_case.** Checks each segment of every endpoint path. Example flags in this workspace: `bank-accounts/link` (hyphens).
- **NAMING-002, tables are plural.** Checks that each table name ends in `s`. Example flags: `payment_method`, `invoice_item`, `user_address`, `audit_log`.
- **NAMING-003, functions start with `acme_`.** This workspace's client prefix is `acme_`, which five of its functions already use. Example flags: `calculateLateFee`, `check_admin_role`, `record_audit_event`, `request_human_approval`, `summarize_ticket`, `delete_user_account`.

These are predictions from reading the workspace files. I have not run `xano policy evaluate`, so please treat the lists above as expected findings until you run it.

**What you need to decide or add**

1. **Client prefixes.** Each client workspace needs its own prefix, so NAMING-003 is written for `acme_` only. Tell me the other prefixes, or copy the file per client and change the prefix. Listing all twelve in one policy would also pass a function named after any client, which is looser than you want.
2. **Endpoint names are not covered.** Xano's naming check does not inspect endpoint names (the query names such as `getCustomerProfile`), so NAMING-001 checks only the URL paths. Renaming the paths also changes the URLs callers use, which is why these are advisory.
3. **Plurality is approximate.** "Ends in s" catches most cases, but it misses irregular plurals (`person` vs `people`) and passes singular words that end in s (`status`, `address`).

I did not change anything in the workspace, and I did not publish or push the policies.
