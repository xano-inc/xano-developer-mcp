# Plan and result: change-control evidence (audit trail) for SOC 2

## Plan

### What a SOC 2 auditor usually means here

- **Change controls** = a record of who changed sensitive data and when, that nobody can quietly edit. In this product that is an audit trail. Policies can check that the code writes to that trail and that the trail is protected. This is in scope.
- **Access reviews** = a person periodically checks who has access and signs off. This is a process done outside the workspace. No policy can see it. Out of scope for this change.

### Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `audit_log` | `workspace/table/audit_log.xs` | One row per change: who, what action, which table, which record, when. |
| function | `record_audit_event` | `workspace/function/record_audit_event.xs` | The only code that writes to `audit_log`. Called after each change to an audited table. |

### Changes to existing objects

Each one adds a `function.run record_audit_event` right after the write it records. Nothing else changes.

| Object | File | Change |
| --- | --- | --- |
| query `me` (PATCH) | `workspace/api/app/me_PATCH.xs` | Records the edit of `users`. |
| query `customers/{customer_id}` (PATCH) | `workspace/api/app/customers/customer_id_PATCH.xs` | Records the edit of `customers`. |
| query `refunds/{refund_id}/approve` (POST) | `workspace/api/app/refunds/refund_id/approve_POST.xs` | Records the edit of `refunds`. |
| query `tenants/{tenant_id}` (PATCH, admin) | `workspace/api/admin/tenants/tenant_id_PATCH.xs` | Records the edit of `tenants`. |
| function `delete_user_account` | `workspace/function/delete_user_account.xs` | Records the delete of `users`. |

Audited tables: `users`, `customers`, `refunds`, `tenants`. Other tables are not audited in this change.

### Policies

1. **`RET-001`** (template `audit_log_protected`, from the audit recipe): the `audit_log` table exists, and only `record_audit_event` writes to it.
2. **`CHG-010`** (custom, the recipe's own rules): every edit, patch and delete of the audited tables calls `record_audit_event` unconditionally.

Both are `active = true`, `enforcement = "advisory"`, so they block nothing. Making them blocking is the policy owner's choice.

## Result

### Built and changed

- New: `audit_log` table, `record_audit_event` function.
- Changed: the five objects in the table above.
- Policy files: `workspace/policies/RET-001.xs`, `workspace/policies/CHG-010.xs`.

### Dry run and parse

**Not run.** The shell tool was denied partway through this session, so I could not run `xano policy parse` or `xano workspace push --dry-run`. The policy files and object files are unverified against the platform parser. Run both before pushing; expect to fix something.

### Before you push

- The change adds a write to `audit_log` on each change to `users`, `customers`, `refunds` and `tenants`. Test those four endpoints and the account deletion once in a branch.
- `me_PATCH` takes a `role` input and writes the whole input body into `users` (`data = $input[""]`). That lets a signed-in user set their own role. This is an access-control problem that exists today and is outside this change. I did not fix it. It needs a decision from you.
- Both policies are advisory: they report findings, they do not block.

## Not covered (stated plainly)

- **Access reviews** (who still has access, and a person signing off): no check can see this. A policy cannot prove a review happened. This needs a process and a record kept outside the workspace.
- **Change approvals** (who signed off a change before it shipped): no check can see this. A blocking policy can hold a merge, but cannot see who approved it.
- **Audit log tamper-proofing at the database level**: the policy only sees that the workspace's own code is the only writer. Database-level or admin access to the Xano instance is outside the workspace.
- **Deletes inside functions**: `CHG-010` judges endpoints and tasks, not functions (`object.statement_required` does not apply to functions). The `db.del` inside `delete_user_account` is audited by the code change, but no policy checks it.
- **Other tables**: only the four named tables are audited. Other sensitive tables, such as `payments` and `invoices`, are not covered.
