I looked at your workspace (policy-authoring-eval) and at the policy checks available. I can't write a policy that enforces either part of your request, so I haven't created one. Here is why, and what I'd suggest instead.

**1. "Production data never ends up in staging"**
Policies read stored definitions only: tables, endpoints, functions, tags and so on. They never see the records in a table, and they never see data copied between branches, environments or tenants. The catalogue lists this explicitly as something no check can see. Nothing in the workspace would let a check tell prod data from staging data either. There is no environment tag, and `tenants` only stores deployed tenant rows, not environments.

**2. "Devs can only get into prod through the on-call process"**
Who can reach the workspace, and who approved a change, is also outside what policies can read. The catalogue lists access reviews and change approvals as not visible. The workspace does have `approval_requests` and `request_human_approval`, which is an in-app approval step for AI-agent actions. That is not the same as gating developer access to production, so no check would pick it up.

**What I'd suggest**
- For the data side, a copy-control process or a branch-level review is the right tool. A policy can't stop it.
- For access, use your identity provider or Xano's workspace permissions, plus a change-approval process.
- If you want a policy anyway, the closest checkable thing is to tag the tables that hold production-grade personal data (`patients`, `clinical_notes`, `customers`) and restrict their writes to approved functions with `table.write_location_restricted`. Or use `CONF-010` (`object.tagged_table_access`) to make those tables reachable only by logged-in endpoints. These control what code can do with the data, not who can get into prod, so I'd treat them as partial approximations. Tagging is a change to your schema metadata, so I'd need your go-ahead before anything is changed. I have not made any changes.

I have not written any `.xs` policy file, since I couldn't find a check that covers either part of the request. Tell me if you want me to draft the table-tagging and write-restriction policy from the second option, and which functions should be the approved writers.
