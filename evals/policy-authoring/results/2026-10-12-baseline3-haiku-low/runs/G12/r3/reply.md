I looked at your workspace (policy-authoring-eval) and the policy catalogue. I can't write a policy that enforces either of the two things you asked for, so I haven't created a policy file. Here is what I found for each part.

**1. Production data never ends up in staging**

No check looks at what data moves between environments. Checks read the stored definitions of objects (tables, endpoints, functions, tasks), not data copies, environment promotion or branch contents. The closest things are not the same thing:

- `table.write_location_restricted` limits which functions can write a table. It doesn't stop a copy job or restore from pulling production rows into staging.
- `outbound.vendor_allowlist` controls where requests go, not what data they carry.
- `workspace.object_required` only checks that named objects exist.

Your workspace also has a `tenants` table with a `db_connection_string` field. That's the place where environment wiring would live, but no check can verify which database each environment points at. Making this enforceable needs a runtime control, such as separate credentials per environment or a check in your deploy pipeline that compares source and target database identifiers. A Xano policy can't do that from the stored definitions.

**2. Devs only reach prod through the on-call process**

This is an access-control process, not an object property. Policies check what's stored in the workspace; they don't see who logged into the Xano dashboard, who holds the workspace role, or whether an on-call ticket was approved. Nothing in the catalogue covers workspace membership or roles. The closest check, `table.auth_table_rules`, governs end-user logins on your API, not team access to production. Enforcing this belongs in your Xano workspace roles and your on-call tooling (for example, granting prod access only through a time-boxed approval). I can't verify it from here.

**What I'd suggest next**

- Keep this out of policy for now, and track it as an access-control requirement owned by your platform team.
- If you want related guardrails that are checkable, I can write policies for things like the `tenants` table's connection string handling (`literal.credential_shape` already flags literal secrets) or for who can write to sensitive tables. Tell me which, and I'll draft those.

I did not change anything in your workspace. I ran only read-only commands (`workspace pull`, `policy list`, `policy catalogue`).
