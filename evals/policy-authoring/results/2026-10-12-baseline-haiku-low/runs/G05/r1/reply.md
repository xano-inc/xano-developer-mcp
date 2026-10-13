I've drafted two policies for your two requirements. Neither is published: nothing has been pushed to the workspace, and I haven't evaluated them against it.

**1. Role check on /admin endpoints: `out/AUTH-002.xs`**

- Starts from the platform's "Admin endpoints check the caller's role" template.
- Rule: `object.statement_required` requires `check_admin_role` to be the first statement, with `$auth` passed in, on every endpoint in the `admin` API group (`api/admin/*`).
- I used the API group, not the `admin` tag the template uses, because your admin endpoints carry no tag. The group is the closest thing to "under /admin" the policy can express.

What this covers and doesn't:
- It checks that `check_admin_role` is called first. It does not check what that function allows. Its precondition already limits access to `admin` and `support_lead`; if someone changes that logic, this policy won't notice.
- By the current workspace, these will be flagged (predicted from reading the code; I have not run the check):
  - `tenants_GET` (`api/admin/tenants_GET.xs`) has no role check at all.
  - `tenant_id_PATCH` (`api/admin/tenants/tenant_id_PATCH.xs`) runs `db.get tenants` before `check_admin_role`. Your "before doing anything else" wording makes that a finding.
- `api/app/admin/stats_GET.xs` is served at `/api:app/admin/stats`, not under the admin group, so this rule does not cover it. The policy can't select by URL path. If you want it covered, it needs to move into the admin group or get a tag. I haven't changed anything; tell me which you prefer.

**2. Tenants filtered by org_id: `out/TEN-010.xs`**

- Rule: `db.where_constraint_required` on the `tenants` table, requiring a predicate on `org_id`. It applies to every object in the workspace, not just /admin, because your ask said "never touches the tenants table".
- It checks that a filter on `org_id` exists. It does not check that the value matches the caller's org. I left `compare_to` empty on purpose: the staff endpoints take `org_id` as input and are meant to work across orgs. If you want staff restricted to their own org, tell me that and I'll add a `compare_to`.
- Predicted findings, not run: `tenants_GET` (no filter at all), `tenant_id_PATCH` (looks up and edits by `id` from input), and `api/app/admin/stats_GET` (a `count` on tenants with no filter). `orgs/{org_id}/tenants` filters by `org_id` and should pass.

**Both policies are `active = true` and `enforcement = "advisory"`.** They flag findings but block nothing. If you want them to block merges or pushes, set `blocking`. Be aware that a blocking policy will stop changes that add findings.

**Before you push:** run `xano workspace push --dry-run` to see the change, then `xano policy evaluate` to see the real findings. I haven't run either.
