I wrote two policies for you. Both are drafts in `out/` and have not been published, so nothing is enforced yet.

**1. `AUTH-002`: admin endpoints call the role check first** (`out/AUTH-002.xs`)

- Covers every endpoint in the `admin` API group (`api/admin/...`, which serves `/api:admin`). It requires the first statement of each query to be `check_admin_role` with `$auth` passed in, so no database work runs before the role check.
- The rule checks *that* the role check is called first, not what it decides. The decision (`admin` or `support_lead`) lives in `check_admin_role`, which I read and which does check both roles. If that function changes, the policy won't notice.
- Scope is by API group, not tag, because the `admin` group has no `admin` tag to match.

**2. `TEN-010`: tenant reads and writes filter on `org_id`** (`out/TEN-010.xs`)

- Every read and write of the `tenants` table must constrain `org_id`. The rule does not require the filter to equal the caller's org. Admin staff work across orgs, so I didn't tie it to `$auth`. If support leads should only see their own org, tell me and I'll add that.
- The check does not follow function calls. A tenant write hidden inside a helper function would not be seen.

**What I expect the current workspace to fail** (I predicted these by reading the code; I have not evaluated the policies, so treat them as expectations):

- `api/admin/tenants_GET.xs` (`/admin/tenants`): no role check, and an unfiltered `db.query tenants`. Fails both policies.
- `api/admin/tenants/tenant_id_PATCH.xs`: reads the tenant by id before the role check, and edits it by id without `org_id`. Fails both policies.
- `api/admin/orgs/org_id/tenants_GET.xs`: calls the role check first and filters on `org_id`. Should pass.
- `api/admin/users_GET.xs`: calls the role check first. Should pass.

**Not covered: `api/app/admin/stats_GET.xs`** (`/api:app/admin/stats`). It sits under the `app` API group, so `AUTH-002` does not apply to it. It reads `tenants` without `org_id`, so `TEN-010` will flag it. Its path has `admin` in it, but it is not under `/admin`. Do you want it treated as an admin endpoint? If yes, the fix is to move it into the `admin` group, or to add a rule scoped to its endpoint. I didn't make either change, because moving an endpoint changes its URL.

**Before you publish:**

- Both policies are `active` and `advisory`. They report findings and block nothing. Making either blocking is your policy owner's decision, and blocking would stop merges that introduce these findings.
- Publishing or changing a policy needs the `workspace:policy` permission.

I have not published, evaluated or changed anything in your workspace.
