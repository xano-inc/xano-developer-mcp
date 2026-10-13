I looked at your workspace (policy-authoring-eval) and the policy checks available on the platform. I did not write a policy file, because neither part of your request can be checked by a policy. Policies evaluate the stored definitions of tables, endpoints, functions, tasks and so on. They cannot see where data is copied to, which environment a request runs in, or who was granted access through which process.

**1. "Production data never ends up in staging"**
No check looks at data movement between environments. Nothing in the catalogue covers copying rows or database contents, and nothing covers environment or branch separation. Whether prod data reaches staging is a question for your data-handling process and your environment setup, not for a policy. The closest checks are adjacent, not equivalent:
- `literal.credential_shape` catches production credentials hard-coded in definitions, so they have to come from environment variables.
- `outbound.vendor_allowlist` with `env_hosts` can restrict outbound destinations to approved environment variables.
- `table.field_attribute_required` could require sensitive marking on fields such as `tenants.db_connection_string`. This would not stop data from being copied, so I have not proposed it as a fix.

**2. "Devs only get into prod through the on-call process"**
This is an access-control and process requirement. Policies do not see who holds access to production, so no check covers it. Your workspace does have a `request_human_approval` function and an `approval_requests` table, which suggest an approval pattern. A policy could require endpoints to call that function (`object.statement_required`). That would check that code calls an approval function, not that an on-call person approved the access, so I have not written it. If you want it, tell me which endpoints should require approval and I can propose the rule for your decision.

**What I'd suggest next**
- Enforce the production-data rule outside Xano: separate environments and credentials, and a documented data-handling process.
- Enforce on-call access in your identity and access management (IAM) and deploy tooling, with an audit trail of who approved what.
- If you want a policy to cover part of this, tell me which endpoints or functions should be gated, and I will draft a policy for your decision.

No policy has been created, pushed or evaluated. Nothing in the workspace was changed.
