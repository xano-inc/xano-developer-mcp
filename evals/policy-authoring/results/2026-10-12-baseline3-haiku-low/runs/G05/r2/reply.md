I've drafted two policies for you. Neither is in your workspace yet: I haven't published or pushed anything, and the workspace has no policies today.

**1. `AUTH-002`: Admin endpoints check the caller's role** (`out/AUTH-002.xs`, critical, advisory)
- Rule: `object.statement_required`, scoped to queries in the `admin` API group, requiring a call to `check_admin_role` as the first statement.
- Your `check_admin_role` function already stops the request unless the user's role is `admin` or `support_lead`, so this policy checks that every admin endpoint calls it first.
- What the policy can't check: it verifies the call is first, not what the function does. If someone edits `check_admin_role`'s role test, this policy will still pass.
- Endpoints that don't do this today, from reading the files (I have not run `xano policy evaluate`):
  - `api/admin/tenants_GET.xs`: no role check at all.
  - `api/admin/tenants/tenant_id_PATCH.xs`: loads the tenant with `db.get` before `check_admin_role` runs, so the check is not first.
  - `api/admin/users_GET.xs` and `api/admin/orgs/org_id/tenants_GET.xs`: call `check_admin_role` first, so they should pass.

**2. `TNT-010`: Tenant reads and writes filter by org_id** (`out/TNT-010.xs`, critical, advisory)
- Rule: `db.where_constraint_required` on the `tenants` table, requiring every read and write to filter on `org_id`.
- I applied this to the whole workspace, not only `/admin`, because your sentence says "never touches the tenants table" without limiting it. Tell me if you want it limited to the admin group.
- It doesn't require `org_id` to equal the caller's org. Support staff are supposed to look across orgs, so that's left open on purpose.
- Places that likely fail, from reading the code (not yet evaluated):
  - `api/admin/tenants_GET.xs`: lists tenants with no filter.
  - `api/admin/tenants/tenant_id_PATCH.xs`: reads and edits by `id` only, with no `org_id` filter.
  - `api/app/admin/stats_GET.xs` (the `app` group, not `admin`): counts tenants with no filter. It is caught by this rule because the rule applies workspace-wide. If the count is meant to span all orgs, that's an exemption for you to decide on, not a change to the rule.
  - `api/admin/orgs/org_id/tenants_GET.xs` filters by `org_id`, so it should pass.

**Things to decide before publishing**
- Both policies are `active = true` and `advisory`, so they report findings but block nothing. Publishing as-is will show the findings above.
- Fixing the endpoints is a code change for you to approve. Adding an `org_id` filter to `tenants_GET` and the PATCH endpoint changes what callers receive, so I'd ask before changing them.
- Exempting `stats_GET` (or any cross-org query) is the policy owner's decision, not a change to the rule.

No `xano policy evaluate` was run; the brief limits me to read-only commands. Run `xano policy parse` on both files (they parse with no warnings) and then `xano policy evaluate` to confirm which findings appear.
