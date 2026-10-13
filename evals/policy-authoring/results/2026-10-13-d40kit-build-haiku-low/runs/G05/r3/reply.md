# Plan

Your ask has two parts: admin endpoints must check the caller's role before doing anything else, and nothing may touch the `tenants` table without filtering by `org_id`. The workspace has no role check yet, and the admin endpoints do not filter tenants, so enforcement has to be built as well as policed.

## Objects to build

- **Function `require_admin_role`** (`function/require_admin_role.xs`): takes the caller's user id, loads the user, and stops the request unless `role` is `admin` or `support_lead`.

## Changes to existing objects

- **Admin endpoints** (`api/admin/users_GET.xs`, `api/admin/tenants_GET.xs`, `api/admin/orgs/org_id/tenants_GET.xs`, `api/admin/tenants/tenant_id_PATCH.xs`, `api/app/admin/stats_GET.xs`): add `tags = ["admin"]`, and make `function.run require_admin_role` (passing `$auth.id`) the first statement. `admin/stats` sits in the `app` API group, but its path is under `/admin`, so it is included.
- **`api/admin/tenants_GET.xs`**: add `where = $db.tenants.org_id == $input.org_id`. The endpoint already declares `org_id` and never uses it.
- **`api/admin/tenants/tenant_id_PATCH.xs`**: the `db.get` on tenants also filters on `org_id`, using the input it already declares.

## Policies

1. **`AUTH-002`** (template `admin_endpoints_check_role`, advisory, active). Rule: `object.statement_required` with `functions: ["require_admin_role"]`, `placement: "first"`, `must_reference: ["$auth"]`, `tags: ["admin"]`, `object_kinds: ["query"]`. Keeps the role check as the first statement of every endpoint tagged `admin`, and that call must pass the logged-in user.
2. **`TEN-001`** (custom, advisory, active). Rule: `db.where_constraint_required` with `field: "org_id"`, `table_selector: {names: ["tenants"]}`. Keeps every read and write of `tenants` filtered on `org_id`. No scope, so every object that reaches the table is judged, including `admin/stats`.

## Not covered

- Whether the role function's logic is right (the `role` values it compares). The policy confirms only that the call comes first and passes `$auth`.
- Endpoints that are missing the `admin` tag. The policy never examines them.
- `db.edit` in `tenant_id_PATCH` writes by `id`, so `TEN-001` will still flag it. It cannot take an org filter as written. Owner decision.
- `admin/stats` counts all tenants across orgs. `TEN-001` will flag it. Owner decision whether a cross-org count is allowed.
- Runtime: whether a token is valid, whether a user really has the role, which `org_id` a row holds.
- Observed but out of scope: `api/app/me_PATCH.xs` accepts `role` from input and writes it, which would let a user make themselves admin. Template `AUTH-030` (`no_self_promotion`) would catch that. I have not added it.

Both policies are advisory. Making them blocking is the policy owner's choice.

# What I built and changed

- **Built:** function `require_admin_role` (`workspace/function/require_admin_role.xs`). It loads the user by id and fails with `accessdenied` unless `role` is `admin` or `support_lead`.
- **Changed:** `users_GET`, `tenants_GET`, `orgs/{org_id}/tenants_GET`, `tenants/{tenant_id}_PATCH` and `app/admin/stats_GET` each get `tags = ["admin"]` and `function.run require_admin_role` (passing `$auth.id`) as their first statement.
- **Changed:** `tenants_GET` now filters `where = $db.tenants.org_id == $input.org_id`, using the input it already declared and never used.
- **Changed:** `tenant_id_PATCH` loads the tenant with a query on both `id` and `org_id`, instead of `db.get` by `id` alone.
- **Policies:** `workspace/policies/AUTH-002.xs` (template `admin_endpoints_check_role`) and `workspace/policies/TEN-001.xs` (custom). Both are `active = true`, `enforcement = "advisory"`.

## Parse and dry run

- `xano policy parse` on both policy files reports rule warnings, which are expected: `require_admin_role` and the `admin` tag are not on the remote branch yet. Nothing else.
- `xano workspace push -d ./workspace --dry-run` reports: policy +2 created, function +1 created, API endpoints 5 updated. No blocked objects, no missing references.
- I did not run `xano policy evaluate` or a real push, as the brief forbids. I have not seen what the policies would find.

## Before you push

- **Expected findings, not yet seen:**
  - `TEN-001` will likely flag `tenants/{tenant_id}` PATCH, because its `db.edit` writes by `id` alone and cannot take an org filter as written. Owner decision.
  - `TEN-001` will likely flag `admin/stats`, which counts all tenants across orgs. Owner decision whether a cross-org count is allowed.
- **Advisory:** both policies report findings but block nothing. Making them blocking is your call, and it would block merges that introduce findings.
- **Not covered by any policy here:**
  - Whether `require_admin_role` decides correctly. The policy only confirms the call is first and passes `$auth`. Review its body.
  - Endpoints missing the `admin` tag. The policy never examines them, so new admin endpoints need the tag.
  - Whether a token is valid, whether a user really holds the role, and which `org_id` a row actually holds. Policies read stored definitions only.
- **Out of scope, found while reading:** `api/app/me_PATCH.xs` accepts `role` from input and writes it with `$input[""]`. A user could make themselves admin. Template `AUTH-030` (`no_self_promotion`) would catch it. I did not add it.
