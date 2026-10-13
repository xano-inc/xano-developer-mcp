I looked at your workspace (policy-authoring-eval) and the policy catalogue, and I can't write a policy that enforces either part of this request. I have not written any policy file, and nothing in the workspace was changed.

**1. "Production data never ends up in staging"**

No check in the catalogue reads environments, data copies or where a database connection points. The workspace has a `tenants` table with `region`, `status` and `db_connection_string` fields, but nothing marks a tenant or table as production or staging, and no tags say so. A policy could not tell whether prod data reached staging. This needs a process or a data-handling control outside Xano.

**2. "Devs only get into prod through on-call, not because they feel like it"**

This is access to production by people, which Xano policies do not see. Checks look at the stored definitions of endpoints, functions, tables and tags, not at who signs in to which environment or who approved a change. The `request_human_approval` function and `approval_requests` table in your workspace are for the support agent's proposed actions waiting for a reviewer. They do not gate developer access, so I did not use them as a stand-in. The on-call gate belongs in your identity provider, access tooling or change process.

**What would close the gap**

- If you want a policy that can check something here, the closest real option is tagging the tables and endpoints that hold production data (for example a `prod-data` tag) and then writing rules against those tags. That would need the tag to exist on the objects first. Tell me the tag name you want and I'll draft the policy for it.
- For the access question, a process control (on-call approval recorded in your access tool) is the right home. Xano can't enforce it.

I'd recommend against a policy that only checks that admin endpoints call an approval function. It would look like coverage of the on-call requirement but would not check it.
