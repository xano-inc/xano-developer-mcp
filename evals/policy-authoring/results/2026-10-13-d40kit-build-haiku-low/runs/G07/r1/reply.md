# Plan: evidence for change controls and access reviews

## What the auditor is really asking for
- **Change control** = every change to sensitive data is recorded by a known function, and the endpoints that change it are tested. The product can show the first part with an audit trail and the second with tests.
- **Access review** = someone periodically checks who can reach what and signs off. No policy can do the review itself (it is a people process). What a policy can show is that endpoints require login and that the audit trail records who did what.

## Objects to build
1. **table `audit_log`** (`workspace/table/audit_log.xs`): one row per recorded change. Fields: who (`actor_id`), what (`action`), which table (`target_table`), which row (`target_id`), when (`created_at`).
2. **function `record_audit_event`** (`workspace/function/record_audit_event.xs`): the only way to write to `audit_log`. Takes the actor, action, target table and target id, and adds one row.

## Changes to existing objects
- **`api/app/refunds/refund_id/approve_POST`**: after it approves a refund, it calls `record_audit_event` with the logged-in user, so the approval is in the trail. This is a runtime change: the endpoint now writes one extra row per approval.

## Policies
- **`RET-001`** (template *Only the audit function writes the audit log*): `audit_log` exists; only `record_audit_event` writes to it.
- **`AUDIT-001`** (own policy, no template fits): edits, patches and deletes of `refunds` and `users` each call `record_audit_event` unconditionally. Three rules, one per statement.
- **`CHG-001`** (template *Endpoints are tested*): every endpoint has a test. This is the change-control testing evidence.
- **`AUTH-010`** (template *Endpoints require login*): every endpoint requires login unless tagged `public`. This is the access-control evidence the auditor can read.

All policies are `active = true`, `enforcement = "advisory"`, so they block nothing and their findings are visible. Making any of them blocking is your call.

## What stays unchecked (no check can see it)
- Access reviews themselves: who reviewed access, when, and the sign-off. This is a process outside the workspace.
- Change approvals beyond the refund endpoint: who approved a change to code or config.
- Runtime data: policies read definitions, not the records, so they cannot show what a user actually did in production.
- Infrastructure, backups, encryption at rest, vulnerability scans, training.
- Retention age of audit records.

## What I built and changed
- Built `table audit_log` (`workspace/table/audit_log.xs`) and `function record_audit_event` (`workspace/function/record_audit_event.xs`).
- Changed `refunds/{refund_id}/approve` POST (`workspace/api/app/refunds/refund_id/approve_POST.xs`): it now calls `record_audit_event` after approving.
- Wrote four policies, all `active = true`, `enforcement = "advisory"`:
  - `RET-001` (template): `audit_log` exists and only `record_audit_event` writes to it.
  - `AUDIT-001` (own): edits, patches and deletes of `refunds` and `users` call `record_audit_event`.
  - `CHG-001` (template): endpoints are tested.
  - `AUTH-010` (template): endpoints require login unless tagged `public`.

## Dry run
`xano workspace push -d ./workspace --dry-run` reported: 4 policies created, 1 table created, 1 function created, 1 endpoint updated. No blocked objects and no missing references. I did not run `xano policy evaluate`, so no findings are known yet.

Each policy parsed. The parser warned that `record_audit_event` and `audit_log` are not on the branch yet. That is expected, because this change creates them.

## Before you push
- **Runtime change:** approving a refund now writes one `audit_log` row. Test the refund approval endpoint once after the push.
- **Expect findings:** `AUTH-010` will likely flag login, signup and health endpoints unless you tag deliberately public ones `public`. `CHG-001` will likely flag most endpoints, because few have tests. Both are findings to review, not failures.
- **Coverage is narrow:** the audit trail covers only `refunds` and `users`, and only the refund approval endpoint writes to it. Other changes to sensitive data are not recorded. Add more `record_audit_event` calls and tables to `AUDIT-001` if the auditor wants them.
- **Not covered by any check:** access reviews (who reviewed access, when, and the sign-off), change approvals beyond refunds, what users actually did at runtime, infrastructure and backups, and retention of audit rows. These need a process or evidence outside the workspace.
- Every policy is advisory, so none blocks a change. Making one blocking is your decision.
