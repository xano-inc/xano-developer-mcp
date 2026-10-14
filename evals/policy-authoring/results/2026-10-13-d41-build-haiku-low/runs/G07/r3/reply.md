# Plan: change-evidence audit trail (SOC 2 change control)

## What a policy can and cannot prove here

- **Change controls:** a policy can prove that edits, patches and deletes to sensitive tables always write an audit entry, and that the audit log cannot be edited from anywhere else. It cannot prove that a change was reviewed or approved. That is outside the workspace definitions.
- **Access reviews:** no check reads review records or sign-offs. The closest checkable control is a role check on admin endpoints; that is a separate build (see "Not in this change").

## Objects I will build

| Kind | Name | File | What it does |
|---|---|---|---|
| table | `audit_log` | `workspace/table/audit_log.xs` | One row per change: actor, table, record, action, time. |
| function | `record_audit_event` | `workspace/function/record_audit_event.xs` | Adds an `audit_log` row for the signed-in user. The only writer of the audit log. |

## Changes to existing objects

Audited tables: `refunds`, `customers`, `tenants`, `users`.

| Object | File | Change |
|---|---|---|
| query `refunds/{refund_id}/approve` | `workspace/api/app/refunds/refund_id/approve_POST.xs` | Calls `record_audit_event` after the `db.edit refunds`. |
| query `tenants/{tenant_id}` (PATCH) | `workspace/api/admin/tenants/tenant_id_PATCH.xs` | Calls `record_audit_event` after the `db.edit tenants`. |
| query `customers/{customer_id}` (PATCH) | `workspace/api/app/customers/customer_id_PATCH.xs` | Calls `record_audit_event` after the `db.patch customers`. |
| query `me` (PATCH) | `workspace/api/app/me_PATCH.xs` | Calls `record_audit_event` after the `db.patch users`. |
| function `delete_user_account` | `workspace/function/delete_user_account.xs` | Calls `record_audit_event` after the `db.del users`. |

## Policies (new files, one per policy)

**`AUDIT-001`**: Only the audit function writes the audit log. Rules:
1. `workspace.object_required`, `object_kind: table`, `names: ["audit_log"]`: the audit table exists.
2. `table.write_location_restricted`, `restricted_tables: ["audit_log"]`, `allowed_functions: ["record_audit_event"]`: only that function writes it.

**`AUDIT-002`**: Changes to audited tables are recorded, and audit entries are never changed. Rules:
1. `object.statement_required`, `functions: ["record_audit_event"]`, `placement: unconditional`, `when: {statement: db.edit, tables: [refunds, customers, tenants, users]}`.
2. Same, `when.statement: db.patch`.
3. Same, `when.statement: db.del`.
4. `table.write_location_restricted`, `restricted_tables: ["audit_log"]`, all built-in write statements: audit entries cannot be edited or deleted.

## Not in this change

- **Access reviews** (who holds which role, periodic review): not checkable by policy.
- **Role check on admin endpoints** (`require_role` on `/admin` endpoints): the natural next step for access control. Not built here because it changes every admin endpoint's first statement; I'd want your approval first.
- **Workspace-level change approval** (who approved a merge or push): not visible to policies.
- **Blocking enforcement**: both policies are `advisory`. Making them blocking is the owner's choice.

## Known finding (not changed)

`workspace/api/app/me_PATCH.xs` accepts `role` from input and writes the whole input record to `users`. A role-escalation risk. I will not change it in this build; the policy scope does not cover it. It is a separate fix for you to decide.

## What the dry run will tell you

I will run `xano workspace push --dry-run` and report its findings after the build.

## What I built and changed

- Created: table `audit_log`, function `record_audit_event`, policies `AUDIT-001` and `AUDIT-002` (both `active = true`, `advisory`).
- Changed: `refunds/{refund_id}/approve` (POST), `tenants/{tenant_id}` (PATCH), `customers/{customer_id}` (PATCH), `me` (PATCH), function `delete_user_account`. Each now calls `record_audit_event` right after its write.

## Dry run

`xano workspace push -d ./workspace --dry-run` reports: 2 policies created, 1 table created, 1 function created, 1 function updated, 4 endpoints updated. No blocked objects and no missing references. The parser's warnings about `audit_log` and `record_audit_event` not existing on the branch are expected: this change creates them.

## Before you push

1. The audit trail covers writes to `refunds`, `customers`, `tenants` and `users` only, and only from endpoints and `delete_user_account`. Other audited-looking writes (for example `products`, `shipments`, `support_tickets`) are not logged. Tell me if you want more tables.
2. `AUDIT-002` checks that the audit call is in the same stack as the write. It does not see a write made inside some other function.
3. The audit log records who and when. It does not record the before and after values.
4. **Finding, not changed:** `me` (PATCH) accepts a `role` input and writes the whole input object to `users`. A signed-in user could promote themselves. This needs a fix you decide on; I have not changed it.
5. Access reviews and change approvals are not visible to any policy. Nothing here shows that someone reviewed access or approved a change. The evidence this gives is a log of changes, not a review. A role check on admin endpoints would be the next control; I can build that after your approval.
6. Both policies are advisory: they report findings but block nothing. Making them blocking is the owner's decision.
7. I did not push. Run `xano workspace push -d ./workspace` yourself when you are ready.
