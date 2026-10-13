I wrote two policies for this. Neither is published; they are files in `out/` for you to review.

**1. `AUTH-002` – Admin endpoints check the caller's role** (from the platform's "Admin endpoints check the caller's role" template)
- Rule: `object.statement_required`, requiring a call to `check_admin_role` as the endpoint's first statement, with `$auth` passed in.
- Scope: the `admin` API group (`api_groups: ["admin"]`, endpoints only).
- Your workspace's `check_admin_role` already tests for `admin` or `support_lead`, so the policy checks that the call happens first. It does not re-check the role values.

**2. `TEN-010` – Tenant reads and writes filter by org_id** (no template covers this, so it has its own key)
- Rule: `db.where_constraint_required` on the `tenants` table (`table_selector: { names: ["tenants"] }`), field `org_id`.
- Every read and write of `tenants` must filter on `org_id`, in any object.

**What these should flag today** (predictions from reading the workspace, not run results; I did not evaluate them):
- `AUTH-002`: `api/admin/tenants_GET` never calls `check_admin_role`. `api/admin/tenants/tenant_id_PATCH` calls it second, after a `db.get`, so it fails the "first" placement. `users_GET` and `orgs/{org_id}/tenants_GET` should pass.
- `TEN-010`: `api/admin/tenants_GET` queries `tenants` with no filter. `tenant_id_PATCH` reads and writes by `id` only. `orgs/{org_id}/tenants_GET` filters on `org_id` and should pass. `api/app/admin/stats_GET` counts `tenants` without a filter, so it will probably be reported too.

**What is not covered**
- **Path vs group.** The policy language has no path scope. I used the `admin` API group as "endpoints under /admin". `api/app/admin/stats_GET` is served at `/admin/stats` but sits in the `app` group, so AUTH-002 does not cover it. Moving it, or giving it a tag, is your call; I did not change it.
- **Only static database statements.** The `tenants` check does not follow raw SQL (`db.direct_query`), and it does not verify the value of `org_id`, only that a filter on it exists.
- **Helper functions.** A write by an id passed into a helper is reported by the check, not fixed. The fix belongs in the endpoint or the helper, with the owner's sign-off.

**Things I did not do**
- I did not change the workspace, push, or evaluate anything. Running `xano policy evaluate` or a push is the next step, once you're happy with the files.
- Fixing the findings (for example adding `check_admin_role` to `tenants_GET`, or an `org_id` filter in `tenant_id_PATCH`) changes endpoint behaviour, so it needs your go-ahead first.
- `org_id` is required on each `tenants` read and write, but the policy does not say where the value comes from. That is a question for you.
