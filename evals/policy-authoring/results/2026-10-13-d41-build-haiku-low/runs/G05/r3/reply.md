# Plan: admin role check and tenant org_id filter

## Objects to build

- **Function `require_admin_role`** (`workspace/function/require_admin_role.xs`). Takes `user_id`, reads that user with `db.get` on `users`, and stops with `precondition` unless the role is `admin` or `support_lead`. Returns the role. It reads the role from the database rather than the token, so a role change takes effect on the next call.

## Changes to existing objects

Each one adds a `function.run require_admin_role { input = {user_id: $auth.id} }` as the **first** statement of the stack. Nothing else in these endpoints changes.

- `api/admin/tenants_GET.xs` (`tenants`, GET)
- `api/admin/orgs/org_id/tenants_GET.xs` (`orgs/{org_id}/tenants`, GET)
- `api/admin/tenants/tenant_id_PATCH.xs` (`tenants/{tenant_id}`, PATCH)
- `api/admin/users_GET.xs` (`users`, GET)
- `api/app/admin/stats_GET.xs` (`admin/stats`, GET). It lives in the `app` API group but its path is under `admin`, so it is in scope for "every endpoint under /admin". This is the one endpoint outside the `admin` group.

No tags are added. The admin endpoints share the `/admin` path, so the policy selects them by path.

## Policies

**`AUTH-002`** (template: Admin endpoints check the caller's role), critical, active, advisory.
- `object.statement_required`: `functions = ["require_admin_role"]`, `placement = "first"`, `must_reference = ["$auth"]`, `paths = ["admin"]`, `object_kinds = ["query"]`.
- Covers: every endpoint under `/admin` calls the role check before anything else, and passes the logged-in user.

**`AUTH-020`** (template: Users only reach their own records), critical, active, advisory. Only the first template rule is used.
- `db.where_constraint_required`: `field = "org_id"`, `table_selector = {names: ["tenants"]}`, no `compare_to`.
- Covers: every read and write of `tenants` filters on `org_id`. No `compare_to` is set, because the ask does not say which value to compare against (for example `$auth.org_id`). With no value, any `org_id` filter passes.

## What this does not cover

- **The existing tenant queries will be flagged.** `tenants_GET` has no `where`. `tenants/{tenant_id}` PATCH reads and writes by `id` only, and `admin/stats` counts tenants with no filter. The policy reports these as findings. I will not add an `org_id` filter to them, because that changes what support staff can see and edit across orgs, and that is your decision. The `orgs/{org_id}/tenants` endpoint already filters.
- **Role values are not validated.** The check confirms the call is first and passes the user. It does not check that `admin` and `support_lead` are the right roles, or how they are granted.
- **Role writes are not covered.** `users.role` can still be set from request input unless `AUTH-030` is added. It was not in the ask, so it is not in this change.
- **Runtime behaviour.** Policies read stored definitions. They do not see request data, tokens or real org membership.
- **People and process.** Access reviews and who approves these changes are outside the policy.

## What I built and changed

- Built: function `require_admin_role` (`workspace/function/require_admin_role.xs`).
- Changed: `function.run require_admin_role` added as the first statement in `tenants_GET`, `orgs/{org_id}/tenants_GET`, `tenants/{tenant_id}` PATCH, `users_GET` and `admin/stats_GET`.
- Policies written: `workspace/policies/AUTH-002.xs` and `workspace/policies/AUTH-020.xs`, both active and advisory. Both parse. `AUTH-002` warns that `require_admin_role` is not on the branch yet. That is expected until this change is pushed.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0, with no blocked objects or missing references:

- policy: +2 created (AUTH-002, AUTH-020)
- functions: +1 created (require_admin_role)
- API endpoints: ~5 updated

I did not run `xano policy evaluate` or a real push. I have not seen the findings from the policies yet.

## Before you push

- **Expect findings from `AUTH-020`.** Its rule covers reads and writes on `tenants`. The existing `tenants_GET`, `tenants/{tenant_id}` PATCH and `admin/stats` endpoints do not filter by `org_id`, so they should be reported. I have not changed their behaviour. Adding a filter changes what support staff can see and edit across orgs, and that is your decision. Tell me the org scope you want and I can add it.
- **`AUTH-020` has no value to compare against.** It requires some `org_id` filter. It does not require the caller's own org. Set `compare_to` (for example `$auth.org_id`) if you want that, but that does not fit the admin endpoints that take `org_id` as input.
- **`admin/stats` is in the `app` API group.** I included it because its path is under `admin`. If you only want the `admin` group, remove that change.
- **Not covered:** role writes (`users.role` can still come from request input, which is `AUTH-030`), whether `admin` and `support_lead` are the right roles, and how roles are granted. No policy can see runtime data or who signs off changes.
