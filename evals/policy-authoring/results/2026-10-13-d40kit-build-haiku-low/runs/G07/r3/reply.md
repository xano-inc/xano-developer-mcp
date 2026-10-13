# Plan: change-control audit trail for SOC 2 evidence

## What the ask needs, and what a policy can cover

- **Change controls.** A policy can prove one part of this: every edit or delete of customer and user records is recorded in an audit log, and only one function writes that log. It cannot prove that a change was reviewed or approved before it shipped.
- **Access reviews.** No check reads who has access to the workspace or whether anyone reviewed it. This part is not covered.

## Objects to build

| Kind | Name | File | What it does |
|---|---|---|---|
| table | `audit_log` | `workspace/table/audit_log.xs` | Holds one row per audited change: who (`actor_id`), what (`action`, `table_name`, `record_id`), when (`created_at`). |
| function | `record_audit_event` | `workspace/function/record_audit_event.xs` | The only code that writes `audit_log`. Called straight after each audited write. |

## Changes to existing objects

| Object | File | Change |
|---|---|---|
| query `customers/{customer_id}` PATCH | `workspace/api/app/customers/customer_id_PATCH.xs` | After `db.patch customers`, call `record_audit_event` with the signed-in user, action `update`, table `customers`, and the record id. |
| query `me` PATCH | `workspace/api/app/me_PATCH.xs` | After `db.patch users`, call `record_audit_event` (action `update`, table `users`). |
| function `delete_user_account` | `workspace/function/delete_user_account.xs` | After `db.del users`, call `record_audit_event` (action `delete`, table `users`). |

No other objects are changed. Adds (`db.add customers`, `db.add users`) and deletes of other tables are outside this change.

## Policy

Key: **AUDIT-010**, "Changes to customer and user records are audited" (active, advisory, tags `soc2`, `cc8.1`; SOC 2 CC8.1 is change management. The `soc2` and `cc8.1` tags are proposed, not in the workspace yet).

Rules, in order:

1. `workspace.object_required`: the `audit_log` table exists. Keeps the audit table from being removed.
2. `table.write_location_restricted`: `audit_log` is written only by `record_audit_event`. Keeps the log append-only through the approved path. Covers RET-001.
3. `object.statement_required`, `db.edit` on `customers` and `users`: an object that edits those tables calls `record_audit_event` unconditionally.
4. `object.statement_required`, `db.patch` on `customers` and `users`: same, for patches.
5. `object.statement_required`, `db.del` on `customers` and `users`: same, for deletes.

Rules 3 to 5 judge only query, tool, task and message objects. The rule cannot see `delete_user_account`, which is a function, so the delete path is not checked by the policy (see below).

Templates: RET-001 fits (audit log, only the audit function writes it). The per-write rules follow the "Record who changed what" recipe.

## What stays unchecked

- **Access reviews**: who has access, and whether it was reviewed. No check exists.
- **Change approvals**: who approved a change before it shipped. No check reads approvals; a blocking policy could hold a merge but could not see sign-off.
- **Tests on changes** (CHG-001): not in this policy. It would need tests across every endpoint, which is a separate piece of work.
- **Adds** (`db.add customers`, `db.add users`): not audited by this policy.
- **The delete path**: the policy cannot judge functions for the delete rule, so a missing audit call in `delete_user_account` would not be reported. I am adding the call, but the policy does not enforce it.
- **Runtime data**: the policy reads stored definitions, not what the audit log actually contains.
- **Infrastructure, people and training.**

---

# Result

## Built

- `table audit_log`: `workspace/table/audit_log.xs`
- `function record_audit_event`: `workspace/function/record_audit_event.xs`
- Policy `AUDIT-010`: `workspace/policies/AUDIT-010.xs` (parses; the only warnings are the expected ones for `audit_log` and `record_audit_event`, which this change creates)

## Changed

- `customers/{customer_id}` PATCH: `workspace/api/app/customers/customer_id_PATCH.xs` now calls `record_audit_event` after the write.
- `me` PATCH: `workspace/api/app/me_PATCH.xs` now calls `record_audit_event` after the write.
- `delete_user_account`: `workspace/function/delete_user_account.xs` now calls `record_audit_event` after the delete.

## Dry run

`xano workspace push -d ./workspace --dry-run` reported:

- CREATE policy AUDIT-010
- CREATE table audit_log
- CREATE function record_audit_event
- UPDATE function delete_user_account
- UPDATE query customers/{customer_id} PATCH
- UPDATE query me PATCH

No blocked objects and no missing references were reported. I did not run `xano policy evaluate`, so I have not seen which findings the policy produces on the current workspace.

## Before you push

- **The policy does not check the delete path.** The delete rule only inspects endpoints, tasks, tools and messages. `delete_user_account` is a function, so a missing audit call there would not be reported. The call is in place; the policy just cannot enforce it.
- **Adds are not audited.** `db.add customers` and `db.add users` are outside this change.
- **Access reviews and change approvals are not covered by any check.** Nothing in the policy shows who has workspace access, who reviewed it, or who approved a change before it shipped. Those need a separate process and evidence.
- **Tests on changes (CHG-001) are not included.** That would need tests across the endpoints; say if you want it as a follow-up.
- **Tags `soc2` and `cc8.1` are proposed.** The workspace does not have them yet. They are labels only and do not affect what the rules check.
- **Existing issue, not changed.** `me` PATCH takes a `role` input and writes the whole input body into `users` (`data = $input[""]`). A user could set their own role through it. That is a separate fix and needs your decision. Policy AUTH-030 would report it.
- **Audit records are only as good as the calls.** The policy checks that the call is present. It does not check that the audit entry is correct or stored.
