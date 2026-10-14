# Plan

## Objects to build

- **function `require_role`** (`workspace/function/require_role.xs`): takes the caller's `user_id`, reads that user from `users` with `db.get`, and stops with `precondition` unless `role` is `admin` or `support_lead`. This is the enforcement.

## Changes to existing objects

Each gets one new first statement: `function.run require_role { input = {user_id: $auth.id} } as $role_check`.

- `api/admin/tenants_GET.xs` (`tenants`, GET)
- `api/admin/orgs/org_id/tenants_GET.xs` (`orgs/{org_id}/tenants`, GET)
- `api/admin/tenants/tenant_id_PATCH.xs` (`tenants/{tenant_id}`, PATCH)
- `api/admin/users_GET.xs` (`users`, GET)
- `api/app/admin/stats_GET.xs` (`admin/stats`, GET). It lives in the `app` group, but its URL is under `/admin`, so the ask covers it.

No other existing endpoint is edited. The tenant queries are **not** changed. Adding `org_id` filters to them changes what those endpoints return or whether they succeed, so that is your call (see below).

## Policies

**`AUTH-002`** (template "Admin endpoints check the caller's role", critical, active, advisory). Two rules, same check:
1. `object.statement_required` with `api_groups: ["admin"]`, `functions: ["require_role"]`, `placement: "first"`, `must_reference: ["$auth"]`, `object_kinds: ["query"]`. Every endpoint in the admin group must call `require_role` as its first statement, passing `$auth`.
2. Same params with `api_groups` replaced by `paths: ["admin"]`. This catches `app/admin/stats`, which the first rule's group scope misses.

**`TENANT-010`** (own key; no template covers tenant isolation). One rule:
- `db.where_constraint_required` with `field: "org_id"` and `table_selector: {names: ["tenants"]}`. Every read and write of `tenants` anywhere in the workspace must filter on `org_id`.

## What stays unchecked

- **Which roles pass.** `AUTH-002` confirms that `require_role` is called first. It does not confirm that the function compares against exactly `admin` and `support_lead`. A wrong role list in the function would pass the policy.
- **The caller's org.** `TENANT-010` confirms a filter on `org_id` exists. It does not confirm the value matches the caller. The endpoints take `org_id` from request input, so a caller can pick any org. Tying it to `$auth.org_id` would also block cross-org support work, so that is a decision for you.
- **Runtime behaviour.** Policies read stored definitions. They do not see request data or rows in the table.
- **Role assignment.** Who holds `admin` or `support_lead`, and how roles are granted, is outside the definitions.

## What I built and changed

- Built: `function/require_role.xs`, `policies/AUTH-002.xs`, `policies/TENANT-010.xs`.
- Changed: the five endpoints listed above, each with the `require_role` call as its first statement.
- `xano policy parse` passes on both policy files. The one warning on `AUTH-002` (both rules say `require_role` is not on the branch) is expected: the function is new in this change and the parse only sees the branch as it is now.
- `xano workspace push -d ./workspace --dry-run` (run from the project root) reported: `CREATE policy AUTH-002`, `CREATE policy TENANT-010`, `CREATE function require_role`. It did **not** list the five endpoint edits as updates. I have not explained that. Check the push preview for those five endpoints before you push.
- I did not run `xano policy evaluate`, which the brief forbids. So I have no findings from the platform yet.

## Before you push

- **Expected findings (prediction, not yet run):**
  - `TENANT-010`: `tenants_GET` (no filter), `tenants/{tenant_id}` PATCH (`db.get` and `db.edit` by `id` only), `admin/stats` (count with no filter). `orgs/{org_id}/tenants` should pass.
  - `AUTH-002`: should pass for all five endpoints once `require_role` is in place.
- `TENANT-010` is advisory, so these findings will not block a merge. Making it blocking is the policy owner's call.
- `require_role` is a new function with no test. `object.test_coverage` is not in this policy, so nothing will flag that.
