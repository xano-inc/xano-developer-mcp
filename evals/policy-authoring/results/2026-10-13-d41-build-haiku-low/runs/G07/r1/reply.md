# Plan: change audit trail and admin access control

## What "change controls" and "access reviews" mean here

Xano policies read the stored definitions of the workspace: endpoints, tables, functions, tags and settings. They cannot see who reviewed a change, who approved it, or whether an access review happened. Those are people-and-process controls. So this plan covers what the product can enforce in the definitions, and says plainly what it cannot.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `audit_log` | `workspace/table/audit_log.xs` | One row per change: who (`actor_id`), which table, which record, what action, when. |
| function | `record_audit_event` | `workspace/function/record_audit_event.xs` | Adds one `audit_log` row. The only code allowed to write that table. |
| function | `require_role` | `workspace/function/require_role.xs` | Stops the call with access denied unless the user's stored role is the one required. |

## Existing objects I will change

| Object | File | Change |
| --- | --- | --- |
| endpoint `me` (PATCH) | `workspace/api/app/me_PATCH.xs` | Call `record_audit_event` after the update. |
| endpoint `customers/{customer_id}` (PATCH) | `workspace/api/app/customers/customer_id_PATCH.xs` | Call `record_audit_event` after the update. |
| endpoint `refunds/{refund_id}/approve` (POST) | `workspace/api/app/refunds/refund_id/approve_POST.xs` | Call `record_audit_event` after the update. |
| endpoint `tenants/{tenant_id}` (PATCH, admin) | `workspace/api/admin/tenants/tenant_id_PATCH.xs` | Call `record_audit_event` after the update. |
| function `delete_user_account` | `workspace/function/delete_user_account.xs` | Call `record_audit_event` after the delete. |
| admin endpoints: `tenants` (GET), `users` (GET), `orgs/{org_id}/tenants` (GET), `tenants/{tenant_id}` (PATCH), `admin/stats` (GET) | their files under `workspace/api/` | Call `require_role` as the first statement, passing the logged-in user. |

No endpoint is switched off, and no field is removed.

## Policies

1. **`CHG-010` Changes to sensitive tables are audited.** Covers `users`, `customers`, `refunds`, `tenants`. Rules, in order:
   - Every endpoint or task that edits one of these tables calls `record_audit_event` unconditionally (`db.edit`).
   - The same for patches (`db.patch`).
   - The same for deletes (`db.del`).
2. **`RET-001` Only the audit function writes the audit log.** Rules: `audit_log` table must exist; only `record_audit_event` may write it.
3. **`AUTH-002` Admin endpoints check the caller's role.** Rules: every endpoint in the `admin` API group, and every endpoint under the `admin` path, calls `require_role` as its first statement, referencing `$auth`.
4. **`AUTH-030` Users can't make themselves admin.** Rule: no write takes the `role` field from request input. Expected to flag `me` (PATCH), which writes the whole request body.

All four are `active = true` and `advisory`. They block nothing.

## What stays unchecked

- Who approved a change, and whether a second person reviewed it. No check reads approvals.
- Access reviews: whether anyone looked at who holds which role, and when.
- Runtime data, backups, encryption at rest, and what a deployed copy holds.
- Audit coverage for tables not listed above (`orders`, `payments`, `patients`, `clinical_notes`, and others). Easy to extend.
- Deletes done inside a function that a rule does not inspect. The audit call is in the function itself, but the rule judges endpoints and tasks only.

## Build

Then parse each policy file and run `xano workspace push -d ./workspace --dry-run`. Fix what it reports.

## What I built and changed

**New objects**
- `audit_log` table (`workspace/table/audit_log.xs`).
- `record_audit_event` function (`workspace/function/record_audit_event.xs`): writes one audit row.
- `require_role` function (`workspace/function/require_role.xs`): denies access unless the user's stored role matches.

**Existing objects changed**
- `me` (PATCH), `customers/{customer_id}` (PATCH), `refunds/{refund_id}/approve` (POST), `tenants/{tenant_id}` (PATCH, admin): each now calls `record_audit_event` after its write. The admin tenant endpoint also calls `require_role` first.
- `delete_user_account` function: calls `record_audit_event` after deleting the user.
- Admin endpoints `tenants` (GET), `users` (GET), `orgs/{org_id}/tenants` (GET), and `admin/stats` (GET, in the app group): each calls `require_role` with role `admin` as its first statement.

**Policies** (all `active`, all `advisory`; none blocks anything)
- `CHG-010`: edits, patches and deletes of users, customers, refunds and tenants call `record_audit_event`.
- `RET-001`: `audit_log` exists and only `record_audit_event` may write it.
- `AUTH-002`: admin endpoints call `require_role` first.
- `AUTH-030`: no write takes `role` from request input.

## Dry run

`xano workspace push -d ./workspace --dry-run` ran clean. It shows 4 policies, 1 table and 2 functions created, 1 function and 8 endpoints updated. It reported no blocked objects and no missing references. Parsing each policy also passed. The only remaining warnings are that the new objects are not on the branch yet, which is expected until the push.

I did not run policy evaluation, so I don't know yet what the policies will find on the live workspace.

## Before you push: what to know

- **Expected finding on push: `AUTH-030` will flag `me` (PATCH).** It takes `role` from the request and writes the whole request body into the user record. A signed-in user can set their own role to `admin`. This is a real privilege-escalation bug, and I did not fix it because it was not in the plan. Fixing it means changing the endpoint's inputs and writes, which affects the API contract. Please decide that before you push.
- **`require_role` only lets `admin` through.** `users` (GET) was viewable by support staff, so a `support_lead` will now get access denied there. Decide whether to allow `support_lead` too.
- **Audit covers four tables:** `users`, `customers`, `refunds` and `tenants`. Other tables (`orders`, `payments`, `patients`, `clinical_notes`, and others) are not audited. Extending the list is a small change.
- **The delete audit row is written inside `delete_user_account`.** `CHG-010` judges endpoints and tasks, not functions, so this one is not checked by the policy.
- **Not visible to any policy:**
  - Who approved a change, and whether a second person reviewed it.
  - Access reviews: whether anyone looked at who holds which role, and when.
  - The records themselves: what audit rows contain at runtime, backups, encryption and infrastructure.
  - Whether the audit rows are a complete history, or whether a direct database change bypassed the endpoints.
- **What these policies prove:** the stored definitions route changes through the audit function and admin endpoints check the role. They do not prove that anyone reviewed a change or an access list. For that you need a review record outside Xano, such as a ticket or sign-off process, and the auditor will want evidence of that as well.
- **Nothing here is blocking.** Making a policy blocking is a choice for the policy owner, and it would then stop merges or pushes that introduce new findings.
