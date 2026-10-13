I wrote two policy files. Neither is published or evaluated yet, and I changed nothing in your workspace.

**1. `AUTH-002`: admin endpoints call the role check first** (`policies/AUTH-002.xs`)
- Starts from the platform's "Admin endpoints check the caller's role" template.
- Rule: `object.statement_required` requires `check_admin_role` as the first statement, passing `$auth`, on queries in the `admin` API group (served at `/api:admin`).
- Changed from the template: the template scopes by an `admin` tag, which your endpoints don't carry, so I scope by API group instead.

**2. `TENANT-010`: tenant reads and writes filter by org_id** (`policies/TENANT-010.xs`)
- No template fits, so this is a new policy.
- Rule: `db.where_constraint_required` on the `tenants` table, field `org_id`. It applies to every endpoint, not only admin ones.

**What I expect the rules to flag, from reading the code (not run):**
- `AUTH-002`: `api/admin/tenants_GET` never calls `check_admin_role`. `api/admin/tenants/tenant_id_PATCH` calls it after a `db.get`, so it is not first. `users_GET` and `orgs/{org_id}/tenants_GET` should pass.
- `TENANT-010`: `api/admin/tenants_GET` queries tenants with no `where`. `tenants/{tenant_id}` PATCH reads and edits by `id` only. `api/app/admin/stats_GET` counts tenants with no `where`. `orgs/{org_id}/tenants_GET` should pass.

**What the policies do not cover:**
- **The role values.** The rules check that the function is called first. They do not check that `check_admin_role` allows only `admin` and `support_lead`. No check reads a function's body, so that line of the function must be reviewed by hand.
- **`/admin` outside the admin group.** `api/app/admin/stats_GET` has an `/admin` path but sits in the `app` API group, so `AUTH-002` skips it. Tell me if it should be covered; I would add it by name.
- **Which org a caller may filter by.** `TENANT-010` requires an `org_id` filter but not that it equals the caller's own org. Admin staff may look across orgs by design, so I did not require a match.
- **Raw SQL.** `db.direct_query` is not checked by `TENANT-010`.

**Questions for you:**
1. Is `api/app/admin/stats_GET` an admin endpoint?
2. Should staff be limited to their own org's tenants? If so, `TENANT-010` needs a `compare_to` such as `$auth.org_id`, and the admin list endpoint would need changing.

Both policies are active and advisory, so they block nothing. The `tenant_id_PATCH` and `stats_GET` findings would be code changes, which I have not made.
