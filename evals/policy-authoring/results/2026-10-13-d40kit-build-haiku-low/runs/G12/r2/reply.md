# Production data in staging, and on-call-only production access

## Plan

I looked at what the policy checks can read, against both halves of your ask.

**1. "Production data never ends up in staging."** No check can see this. Policies read stored object definitions (tables, endpoints, functions, tasks, tags, middleware). They never read table records, what a request stored, or data copied between branches, environments or tenants. The workspace has no environment, prod or staging object that a check could key on. The nearest thing is `tenants` (a table of deployed tenant environments, with a `db_connection_string` field), but a check can only confirm that field is marked sensitive. It cannot tell whether a copy of production data has been made.

**2. "Devs only get into prod through the on-call process."** No check can see this either. Who holds access, who is on call, and whether an access request was approved all live outside the definitions. The closest checks are `object.auth_required`, `object.statement_required` (for a role-check function) and `db.where_constraint_required`. They govern which app users may call an endpoint, not which developers may reach production. Using them here would check something other than what you asked.

**Objects I will build:** none.
**Changes to existing objects:** none.
**Policy:** none. Writing one would mean an approximation (an auth or role rule) that reads as coverage of the ask but does not cover it, so I have not written one.

**What stays unchecked:** everything in both halves of the ask.

## Result

I built nothing and changed nothing in `./workspace`. I did not write a policy file and did not run a push (dry run or otherwise). The workspace pull is the only thing I ran that touched the project folder.

## What to know before you act on this

- **To meet either half of the ask, you need controls outside Xano policy.** For data copies: a separate process or tooling that refuses to load production dumps into staging, and a review of your tenant provisioning (`tenants`). For access: your identity provider's group membership, a just-in-time access tool, and an on-call approval log. Policies can't see any of these.
- **A partial, checkable proxy exists if you want one, but it is a separate decision.** For example, `object.auth_required` with `tables: ["tenants"]` (endpoints that reach tenant records must require login), or `object.statement_required` on `admin` endpoints (they must call a role-check function). Both are real checks, but neither enforces the on-call rule. Tell me if you want either, and I'll write it as its own change.
- **Adjacent, not part of the ask:** `tenants.db_connection_string` holds a connection string and is not marked sensitive. A `table.field_attribute_required` rule would flag it. I have not written that rule.
- **Admin endpoints** such as `api/admin/tenants/tenant_id_PATCH` change tenant status and region with no visible role check in the endpoint. This is an access question you may want to look at directly, separate from the policy.
