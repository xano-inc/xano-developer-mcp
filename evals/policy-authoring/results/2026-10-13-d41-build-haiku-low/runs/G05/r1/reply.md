# Plan

## Objects to build

- **function `require_admin_role`** (`workspace/function/require_admin_role.xs`). Takes `user_id`, reads that user's `role` from the `users` table with `db.get`, and stops with `precondition` unless the role is `admin` or `support_lead`. This is the role check every /admin endpoint calls first.

## Changes to existing objects

- **Call the role check first** in the five endpoints under /admin. Each gets a `function.run require_admin_role` as its first statement, with `user_id: $auth.id`:
  - `workspace/api/admin/users_GET.xs`
  - `workspace/api/admin/tenants_GET.xs`
  - `workspace/api/admin/tenants/tenant_id_PATCH.xs`
  - `workspace/api/admin/orgs/org_id/tenants_GET.xs`
  - `workspace/api/app/admin/stats_GET.xs` (lives in the `app` API group but its path is `admin/stats`, so it is under /admin)
- No other statements in those endpoints change.
- No existing endpoint that reads or writes `tenants` is changed. Three do not filter by `org_id` today (see below). Fixing them would change which rows they return, so that is left for you to decide.

## Policies

### AUTH-002: Admin endpoints check the caller's role (template, critical, advisory)

Rule: `object.statement_required` with `functions: ["require_admin_role"]`, `placement: "first"`, `must_reference: ["$auth"]`, `paths: ["admin"]`, `object_kinds: ["query"]`. Every query whose path starts with `admin` must call `require_admin_role` as its very first statement, passing `$auth`. `paths` matches `admin` only as a whole segment, so `administrator` is not in scope.

### TENANT-010: Tenant rows are read and written only within an org (own policy, advisory)

Rule: `db.where_constraint_required` with `field: "org_id"`, `table_selector: {names: ["tenants"]}`. Every read and write of `tenants` must filter on `org_id`. `compare_to` is left empty, so any `org_id` filter passes. It does not check that the filter matches the caller's own org.

## What stays unchecked

- Whether `require_admin_role` compares the right roles. The policy confirms it is called first, not what it decides.
- Whether the role list is right for the business, or how roles are granted and removed.
- Whether an `admin` or `support_lead` in one org may read tenants of another org. `TENANT-010` only requires an `org_id` filter. Pinning it to the caller's org would need `compare_to: "$auth.org_id"`, which the request did not ask for.
- Endpoints outside `/admin` that touch `tenants`. They are in scope of `TENANT-010` but are not role-checked.
- Runtime data, what requests send, and access reviews. Policies read object definitions only.

## Expected findings (predicted, not yet run)

- `TENANT-010`: `admin/tenants_GET` (no filter), `app/admin/stats` (unfiltered count), and `admin/tenants/{tenant_id}` PATCH (`db.get` and `db.edit` by `id`) will be reported.
- `AUTH-002`: none expected once the five endpoints call the function first.

---

# Result

## What I built and changed

- **Built** `require_admin_role` (`workspace/function/require_admin_role.xs`). It reads the user's role and stops with `accessdenied` unless the role is `admin` or `support_lead`.
- **Changed** the five /admin endpoints. Each now calls `require_admin_role` with `$auth.id` as its first statement, before any other statement:
  - `workspace/api/admin/users_GET.xs`
  - `workspace/api/admin/tenants_GET.xs`
  - `workspace/api/admin/tenants/tenant_id_PATCH.xs`
  - `workspace/api/admin/orgs/org_id/tenants_GET.xs`
  - `workspace/api/app/admin/stats_GET.xs`
- **Wrote** `workspace/policies/AUTH-002.xs` (template, critical, advisory) and `workspace/policies/TENANT-010.xs` (own policy, high, advisory).

Callers of these five endpoints now get an `accessdenied` error unless their user row has role `admin` or `support_lead`. Nothing else in their responses changes.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0. It would create two policies and one function, and update five endpoints:

```
policy               +2 created
Functions            +1 created
API Endpoints        ~5 updated
CREATE policy AUTH-002
CREATE policy TENANT-010
CREATE function require_admin_role
UPDATE query orgs/{org_id}/tenants GET
UPDATE query tenants/{tenant_id} PATCH
UPDATE query tenants GET
UPDATE query users GET
UPDATE query admin/stats GET
```

The five updated endpoints are the five files I edited.

`xano policy parse` on `AUTH-002.xs` printed one rule warning: `Function "require_admin_role" is not on this branch`. That is expected, because the function is new in this change. It clears once the function is pushed. `TENANT-010.xs` parsed with no warnings.

I did not run `xano policy evaluate` and did not push. Both were outside what the brief allows, so the findings below are predictions, not policy-check output.

## Predicted findings once pushed

- **AUTH-002**: nothing expected, since all five /admin endpoints now call the function first.
- **TENANT-010**: three existing endpoints will be reported, because they touch `tenants` without an `org_id` filter:
  - `admin/tenants_GET` reads every tenant with no filter.
  - `app/admin/stats` counts every tenant with no filter.
  - `admin/tenants/{tenant_id}` PATCH reads and writes by `id` only.

  `orgs/{org_id}/tenants` already filters on `org_id` and should pass. I left those three unchanged because adding a filter changes what they return, and that needs your decision. For `admin/tenants_GET` and `admin/stats`, that means deciding whether they should take an `org_id` input or be scoped some other way.

## What to know before you push

- **Role check is called, not proven correct.** AUTH-002 confirms the call is first. It does not confirm the function compares the right roles, and the function is the only place that decides who gets in.
- **Cross-org access is not blocked.** TENANT-010 requires an `org_id` filter, not one that equals the caller's org. An `admin` or `support_lead` in one org can still read tenants of another org. Pinning to the caller's org would need `compare_to: "$auth.org_id"`, which I did not add because you did not ask for it.
- **Role list and grants are not checked.** The policy does not know which roles the business needs or how roles are granted or removed.
- **Endpoints outside /admin.** TENANT-010 covers every `tenants` read and write, including ones outside /admin. Those endpoints are not role-checked by anything in this change.
- **Both policies are advisory.** They report findings and block nothing. Making either one blocking is its owner's call, and it would block any merge, set-live or save to the live branch that introduces a finding.
- **Runtime behaviour is not visible.** Policies read stored definitions only. They do not see request data, table contents or who approved the change.
- **Tags on the policies.** I set `tags` on each policy (`soc2`, `hipaa`) as framework labels. They are not claims of compliance.
