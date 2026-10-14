# Plan: change-control and admin-access evidence for SOC 2

## What the policy can and cannot show

Xano policies read the stored definitions of your workspace. They can show that the code is wired to record changes and check roles. They cannot show that a person reviewed a change, that an access review happened, or who holds which role. Those are outside the definitions, and no check reads them. The plan below covers the part a check can see and names the rest.

Your SOC 2 criteria are related to CC8.1 (change management) and CC6.x (logical access). This is related to those criteria, not evidence that you meet them.

## Objects to build

1. **Table `audit_log`** (`workspace/table/audit_log.xs`): one row per edit or delete of a business record: who (`user_id`), which table, which record, what action, and when.
2. **Function `record_audit_event`** (`workspace/function/record_audit_event.xs`): takes `user_id`, `table_name`, `record_id`, `action` and adds an `audit_log` row with `db.add`. It is the only object that writes `audit_log`.
3. **Function `require_role`** (`workspace/function/require_role.xs`): reads the caller's role from `users` by id and stops with `precondition` unless the role is `admin`.

## Changes to existing objects

Audited tables are `tenants`, `users`, `customers`, `refunds` and `products`. These are the tables the workspace edits or deletes today.

| Object | File | Change |
| --- | --- | --- |
| `users` (GET, admin) | `workspace/api/admin/users_GET.xs` | First statement calls `require_role` with `$auth.id` |
| `tenants` (GET, admin) | `workspace/api/admin/tenants_GET.xs` | Same role check |
| `orgs/{org_id}/tenants` (GET, admin) | `workspace/api/admin/orgs/org_id/tenants_GET.xs` | Same role check |
| `tenants/{tenant_id}` (PATCH, admin) | `workspace/api/admin/tenants/tenant_id_PATCH.xs` | Role check; `record_audit_event` after the edit |
| `admin/stats` (GET, app group) | `workspace/api/app/admin/stats_GET.xs` | Role check, since it is under the `admin` path |
| `me` (PATCH) | `workspace/api/app/me_PATCH.xs` | **Remove `role` from input and remove the whole-input write (`$input[""]`).** It writes only `name`, `phone`, `marketing_opt_in`. Audit call after the patch. |
| `refunds/{refund_id}/approve` (POST) | `workspace/api/app/refunds/refund_id/approve_POST.xs` | Audit call after the edit |
| `customers/{customer_id}` (PATCH) | `workspace/api/app/customers/customer_id_PATCH.xs` | Audit call after the patch |
| `products/{product_id}/price` (PATCH) | `workspace/api/app/products/product_id/price_PATCH.xs` | Audit call after the patch |
| `delete_user_account` (function) | `workspace/function/delete_user_account.xs` | Audit call after `db.del users` |

The `me` change fixes a privilege escalation. A signed-in user can currently send `role: "admin"` to `/me` and it is written. This changes the API contract for `me`: callers that send `role` will no longer change it.

## Policies

**Policy `RET-001`** (template `audit_log_protected`, SOC 2 and HIPAA frameworks):
- `workspace.object_required`: names `["audit_log"]`
- `table.write_location_restricted`: restricted table `audit_log`, allowed function `record_audit_event`. Only that function can write the log, and nothing edits or deletes an entry.

**Policy `AUTH-002`** (template `admin_endpoints_check_role`, SOC 2 and HIPAA):
- `object.statement_required`, scope `api_groups: ["admin"]`: `require_role`, placed first, referencing `$auth`
- `object.statement_required`, scope `paths: ["admin"]`: same, covering `admin/stats`

**Policy `AUTH-030`** (template `no_self_promotion`, SOC 2 and HIPAA):
- `db.write_from_input_forbidden`: fields `["role"]`

**Policy `AUDIT-EDITS`** (my own key; the recipe's extra rules, SOC 2):
- `object.statement_required`, unconditional: `record_audit_event` when a `db.edit` targets `tenants`, `refunds`
- Same for `db.patch` on `users`, `customers`, `products`
- Same for `db.del` on `users`

All policies: `active = true`, `enforcement = "advisory"`. Nothing blocks.

## What stays unchecked

- Whether a person reviewed or approved a change. There is no change-approval check.
- Access reviews: who has access, whether it was reviewed, and how roles are granted or removed.
- Who holds the `admin` role, and whether `admin` is the right role for the staff endpoints. I assumed admin only.
- Record creation (`db.add`) is not audited. Signup and customer creation are not in the trail.
- Edits made outside the definitions: direct database access, data copies between environments, and the runtime data itself.
- Infrastructure, hosting and backups.
- Tests: no test coverage rule is included.
- `delete_customer_note` and other tables not listed above are not audited.

## Dry run and push

I will not push. You review the change and push it yourself. I will run `xano workspace push --dry-run` and report what it says.

---

# Result

## What I built and changed

Built: `table/audit_log.xs`, `function/record_audit_event.xs`, `function/require_role.xs`.

Changed: the ten existing objects in the table above, plus `api/admin/users_GET.xs`, `api/admin/tenants_GET.xs`, `api/admin/orgs/org_id/tenants_GET.xs`, `api/app/admin/stats_GET.xs` (role check added at the top of each).

Policies written to `policies/`: `RET-001`, `AUTH-002`, `AUTH-030`, `AUDIT-EDITS`. All are active and advisory. Each parses.

## Where the plan changed

- **`AUDIT-EDITS` has two rules, not three.** The plan had a `db.del` rule for `users`. The check `object.statement_required` only inspects queries, tools, tasks and messages, not functions. The only `db.del` on `users` is inside `delete_user_account`, a function, so the rule would match nothing. I left it out. The audit call for that delete is in place, but no policy confirms it.
- **`AUTH-002` has a second rule** for `admin/stats`, which lives in the app group under the `admin` path. The first rule covers the admin API group.

## Dry run

`xano workspace push --dry-run` exited 0. It reported: 4 policies created, 1 table created, 2 functions created and 1 updated, 9 API endpoints updated. It listed `delete_user_account` as the updated function. No blocked objects.

Its rule warnings were: "Function `require_role` / `record_audit_event` is not on this branch" for `AUTH-002`, `AUDIT-EDITS` and `RET-001`. These go away once the change is pushed, because the functions are part of the same change. I did not push.

## What you should know before pushing

- **Privilege escalation fixed in `me` PATCH.** Before this change, a signed-in user could send `role: "admin"` and it would be written to their account. The `role` input is gone and the write is limited to name, phone and marketing opt-in. Callers that sent `role` will not change it any more.
- **Admin access is assumed to be admin-only.** The new role check lets only `role = "admin"` through. `support_lead`, `manager` and `staff` will lose access to the admin endpoints and to `admin/stats`. Confirm that is the intent before pushing.
- **Audit covers edits and patches to five tables** (`tenants`, `refunds`, `users`, `customers`, `products`) and the one delete in `delete_user_account`. Creates are not audited. Signup and customer creation are not in the trail.
- **Nothing here shows a person approved a change.** No check reads change approvals, so the policy cannot show that a change was reviewed before it went live.
- **Access reviews are not covered at all.** No check reads who has access, whether that was reviewed, or how roles are granted and removed.
- **The policies are advisory.** Nothing is blocked. They report findings only. Whether to make them blocking is your decision.
- **Pass means only that the stored definitions matched.** It is not evidence of compliance. Related to SOC 2 CC8.1 and CC6.3 is the right way to describe these.

Confidence this policy set achieves the goal: low. It covers the parts a check can read (audit wiring for edits, the admin role check, and the no-role-write rule). The parts an auditor usually asks about most, change approval and access reviews, are outside what a policy can see.
