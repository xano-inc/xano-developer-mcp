# Plan

## Objects to build

- **function `require_admin_role`** (`workspace/function/require_admin_role.xs`): takes the caller's `role` and stops the request with an access-denied error unless it is `admin` or `support_lead`. Every admin endpoint calls it as its first statement.

## Changes to existing objects

All in the `admin` API group (`workspace/api/admin/`):

- `users_GET.xs`, `tenants_GET.xs`, `tenants/tenant_id_PATCH.xs`, `orgs/org_id/tenants_GET.xs`: add `function.run require_admin_role` as the first statement, passing `$auth.role`.
- `tenants_GET.xs`: its `db.query tenants` has no filter even though it takes `org_id` and its comment says "Tenants of one org". Add `where = $db.tenants.org_id == $input.org_id`.
- `tenants/tenant_id_PATCH.xs`: it reads and writes a tenant by `id` alone. Read it with a query filtered on both `id` and `org_id`, then edit by the id that read returned. The request shape and response do not change.

No tags, table fields, auth settings or middleware change.

## Policies

1. **`AUTH-002`**: template "Admin endpoints check the caller's role".
   - `object.statement_required`: `functions: ["require_admin_role"]`, `placement: "first"`, `api_groups: ["admin"]`.
   - Covers: every admin endpoint calls the role check before anything else.
2. **`TENANT-010`**: custom key, no template covers tenant isolation (AUTH-020 covers per-user records, not per-org tenants).
   - `db.where_constraint_required`: `field: "org_id"`, `table_selector: {names: ["tenants"]}`.
   - Covers: every read and write of `tenants`, in any endpoint or function, filters on `org_id`.

Both policies are `active = true`, `enforcement = "advisory"`, so they block nothing. Making them blocking is the owner's choice.

## What stays unchecked

- **`/admin` path prefix**: no check selects endpoints by path. The rules use the `admin` API group. `api/app/admin/stats_GET.xs` lives in the `app` group, so it is not covered by AUTH-002. Tagging it `admin` would fix that, but tags change which policies apply, so I am proposing it rather than doing it.
- **Role check logic**: the rule confirms the function is called first. It does not confirm the function compares the role correctly. I will write it carefully, but a reviewer should read it.
- **Tenant filter inside the function**: the rule cannot tell whether `$input.org_id` is the caller's own org. It only sees that the filter exists. A caller of `tenants_GET` can still pass any org id.
- **`app/admin/stats_GET`** reads a total count of `tenants` with no org filter. TENANT-010 will report it. Fixing it would change what the staff dashboard shows, so I am leaving it for you to decide.
- **Role change via `me_PATCH`**: `api/app/me_PATCH.xs` accepts `role` from the request. That is a privilege-escalation path that neither policy covers. Outside this ask; `AUTH-030` would cover it.
- Runtime behaviour: policies read stored definitions only. They cannot see actual role values in the users table or the records returned.

---

# What I built and changed

**New objects**
- `function require_admin_role` (`workspace/function/require_admin_role.xs`): a precondition that passes only when `role` is `admin` or `support_lead`, otherwise it throws `accessdenied`.

**Changed objects** (all in `workspace/api/admin/`)
- `users_GET.xs`, `tenants_GET.xs`, `orgs/org_id/tenants_GET.xs`, `tenants/tenant_id_PATCH.xs`: `function.run require_admin_role` is now the first statement, passing `$auth.role`.
- `tenants_GET.xs`: the tenants query now filters `where = $db.tenants.org_id == $input.org_id`. Before, it returned every tenant and ignored its `org_id` input. This changes what the endpoint returns.
- `tenants/tenant_id_PATCH.xs`: the `db.get` by id is now a `db.query` filtered on both `id` and `org_id`, returning a single row. The edit then uses the id that read returned. Request and response shapes are unchanged, but a tenant id that belongs to another org now returns no row and the edit fails.

**Policies** (`workspace/policies/`, both parse)
- `AUTH-002.xs`: `object.statement_required` with `functions: ["require_admin_role"]`, `placement: "first"`, `api_groups: ["admin"]`, `object_kinds: ["query"]`.
- `TENANT-010.xs`: `db.where_constraint_required` with `field: "org_id"`, `table_selector: {names: ["tenants"]}`.
- Both are `active = true`, `enforcement = "advisory"`. Neither blocks anything.

**Dry run** (`xano workspace push -d ./workspace --dry-run`, exit 0)
- Would create: policies `AUTH-002`, `TENANT-010`; function `require_admin_role`.
- Would update: queries `users GET`, `tenants GET`, `orgs/{org_id}/tenants GET`, `tenants/{tenant_id} PATCH`.
- The dry run reports no blocked objects and no missing references. It does not evaluate the policies, so I have no findings to report. I did not run `xano policy evaluate`, which is outside what I was allowed to run.
- Parse warning, expected: `require_admin_role` is not on the branch yet, so AUTH-002 cannot be satisfied until the push creates it.

# What no object or policy here can see

- **`/admin` path prefix.** No check selects endpoints by URL path, so the rules use the `admin` API group. `api/app/admin/stats_GET.xs` sits in the `app` group, so AUTH-002 does not judge it. It is an admin-path endpoint with no role check. Proposed fix: tag it `admin` and add `tags: ["admin"]` to the rule. Tags decide which policies apply, so I have not made that change.
- **The role check's logic.** AUTH-002 confirms the function is called first. It does not confirm the function compares roles correctly, and it does not see the value of `$auth.role` at runtime.
- **Tenant scope inside the function.** TENANT-010 confirms a filter on `org_id` exists. It cannot tell that the caller's `org_id` is the one being filtered; `tenants_GET` takes `org_id` from the request, so any admin can read any org's tenants. Only a runtime or design decision can close that.
- **`app/admin/stats_GET.xs`** counts every tenant with no org filter. TENANT-010 will report it. Filtering it would change the staff dashboard's numbers, so I left it for you to decide.
- **Role escalation via `api/app/me_PATCH.xs`.** It accepts `role` from the request body. Outside this ask, but it lets any logged-in user set themselves to `admin`, which makes the role check meaningless. `AUTH-030` ("Users can't make themselves admin") covers this and I recommend adding it.
- **Users outside the admin group.** Nothing else checks `role`. Only the four admin endpoints call the new function.
- **Runtime behaviour.** Policies read stored definitions only. Records, actual role assignments and live requests are outside what they see.

# Before you push

- Read the `require_admin_role` precondition. I wrote it without a live run; confirm the error type and message suit you.
- Decide whether the `tenants_GET` and `tenant_id_PATCH` behaviour changes are acceptable.
- Both policies are advisory. Making either blocking is your call; it would then block merges and pushes that introduce a finding.
