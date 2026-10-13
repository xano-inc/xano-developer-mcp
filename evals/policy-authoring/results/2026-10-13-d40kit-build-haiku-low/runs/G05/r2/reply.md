# Plan

## What I found

- The `/admin` endpoints are the four in the `admin` API group (`workspace/api/admin/`): `users_GET`, `tenants_GET`, `orgs/{org_id}/tenants_GET`, `tenants/{tenant_id}_PATCH`. All use `auth = "users"`.
- `app/admin/stats_GET` also lives under `/admin/stats`, but in the `app` API group. Path prefixes cannot be scoped, so the group scope will not reach it.
- `users.role` is an enum: `admin, support_lead, manager, staff, member, viewer`. `users.org_id` is the tenant org.
- `tenants` has `org_id` pointing at `orgs`. Two of the four admin endpoints touch it: `tenants_GET` has no `org_id` filter, and `tenants/{tenant_id}_PATCH` looks the row up by `id` only.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| function | `require_admin_role` | `workspace/function/require_admin_role.xs` | Loads the caller by id, then stops with an access-denied error unless their role is `admin` or `support_lead`. |

## Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| `users` (query) | `workspace/api/admin/users_GET.xs` | Add `function.run require_admin_role` as the first statement, passing `$auth.id`. |
| `tenants` (query) | `workspace/api/admin/tenants_GET.xs` | Same. |
| `orgs/{org_id}/tenants` (query) | `workspace/api/admin/orgs/org_id/tenants_GET.xs` | Same. |
| `tenants/{tenant_id}` (query) | `workspace/api/admin/tenants/tenant_id_PATCH.xs` | Same, before the existing `db.get`. |

I will not change the tenant queries to add an `org_id` filter. That is a data-access change I have not been asked to make, and the policy will report it instead.

## Policy

Two policies, one per goal, in `workspace/policies/`:

1. **`AUTH-002`** (from the template "Admin endpoints check the caller's role"), active, advisory, critical.
   - Rule: `object.statement_required`, `placement = "first"`, `functions = ["require_admin_role"]`, `must_reference = ["$auth"]`, `api_groups = ["admin"]`, `object_kinds = ["query"]`.
   - Keeps true: every endpoint in the `admin` group calls the role check first, passing the logged-in user.
   - I scope by `api_groups` instead of the template's `tags = ["admin"]`, because no endpoint carries that tag.

2. **`ADMIN-TENANT-ORG`** (custom, no template covers it), active, advisory, critical.
   - Rule: `db.where_constraint_required`, `field = "org_id"`, `table_selector = {names: ["tenants"]}`, `tables = ["tenants"]`.
   - Keeps true: every read and write of `tenants` filters on `org_id`.
   - I leave `compare_to` empty. Support staff may need to see across orgs, so I do not want to force `$auth.org_id`.

Both policies are advisory. Making either blocking is the owner's choice.

## What stays unchecked

- Path prefix `/admin`: the rules select by API group, so `app/admin/stats_GET` (`/admin/stats`) is not checked. Tagging it or moving it into the `admin` group would need your approval.
- The role check checks that the call is first, not what the function decides. Whether `require_admin_role` denies the right roles is not verified.
- The filter is judged on its presence, not its value. A filter on `org_id` against the wrong value passes.
- Runtime data, what the endpoints return, and who can reach the workspace are not visible to policies.

## What I built and changed

- **Built:** function `require_admin_role` (`workspace/function/require_admin_role.xs`). It loads the user by id and raises an access-denied error unless `role` is `admin` or `support_lead`.
- **Changed:** `function.run require_admin_role` added as the first statement, passing `$auth.id`, in:
  - `workspace/api/admin/users_GET.xs`
  - `workspace/api/admin/tenants_GET.xs`
  - `workspace/api/admin/orgs/org_id/tenants_GET.xs`
  - `workspace/api/admin/tenants/tenant_id_PATCH.xs`
- **Policies:** `workspace/policies/AUTH-002.xs` (template, role check first) and `workspace/policies/ADMIN-TENANT-ORG.xs` (custom, `org_id` filter on `tenants`). Both parse. `AUTH-002` warned that the function is not on the branch yet, which the push resolves.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0:

```
policy               +2 created
Functions            +1 created
API Endpoints        ~4 updated
CREATE policy ADMIN-TENANT-ORG / CREATE policy AUTH-002 / CREATE function require_admin_role
UPDATE query orgs/{org_id}/tenants GET / tenants/{tenant_id} PATCH / tenants GET / users GET
```

I have not run `xano policy evaluate`, so I cannot say which findings will appear. From reading the code, I expect `ADMIN-TENANT-ORG` to flag `tenants GET` (no `org_id` filter) and `tenants/{tenant_id} PATCH` (looks up by `id` only). I expect `AUTH-002` to pass.

## Before you push

- **`/admin` is not matched by path.** Both admin-group endpoints and the policy use the `admin` API group. `app/admin/stats_GET` (`/admin/stats`) sits in the `app` group, so it is not checked. Tagging it, or moving it into the `admin` group, is your call.
- **The role check is checked for position only.** `AUTH-002` confirms the call is first. It does not confirm that `require_admin_role` denies the right roles. Please review its logic.
- **The org filter is checked for presence, not value.** Support staff may need cross-org access, so I did not force `$auth.org_id`. A filter with the wrong value passes.
- **Two tenant endpoints will likely be flagged** by `ADMIN-TENANT-ORG`, and I did not change them. Adding an `org_id` filter changes what they return, so that is a decision for you.
- Both policies are **advisory**. Making either blocking is the owner's choice.
- Neither policy can see runtime data, who can reach the workspace, or what the endpoints return.
