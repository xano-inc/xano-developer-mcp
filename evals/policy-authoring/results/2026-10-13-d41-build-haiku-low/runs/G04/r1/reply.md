# Plan: HIPAA health-data policy (HIPAA-PHI-001)

This follows the "Protect health data" recipe in the policy kit. It covers the three tables you named: `patients`, `appointments` and `clinical_notes`.

## Objects I will build

| Kind | Name | File | What it does |
|---|---|---|---|
| table | `phi_access_log` | `workspace/table/phi_access_log.xs` | One row per read or write of a health record: who (`user_id`), which table and record, and when. |
| function | `log_phi_access` | `workspace/function/log_phi_access.xs` | Adds a `phi_access_log` row for the logged-in user. It is the only writer of that table. |

## Changes to existing objects

| Object | File | Change |
|---|---|---|
| table `patients` | `table/patients.xs` | Tag `phi`. Mark `first_name`, `last_name`, `dob`, `ssn`, `email`, `phone`, `address`, `insurance_member_id` as sensitive. |
| table `appointments` | `table/appointments.xs` | Tag `phi`. Mark `reason` as sensitive. |
| table `clinical_notes` | `table/clinical_notes.xs` | Tag `phi`. Mark `diagnosis` and `note` as sensitive. |
| endpoint `patients/{patient_id}` GET | `api/app/patients/patient_id_GET.xs` | Call `log_phi_access` after the read. |
| endpoint `clinical_notes` POST | `api/app/clinical_notes_POST.xs` | Call `log_phi_access` after the write. Remove the `debug.log` on `$input[""]`, which logs request input. |
| endpoint `appointments` GET | `api/app/appointments_GET.xs` | Require login (`auth = "users"`), which changes who can call it. Call `log_phi_access` for each appointment returned. |

Behaviour changes you should know about:
- `appointments` GET now needs a logged-in user. Callers without a token will get "Unauthorized".
- The three PHI endpoints now write one `phi_access_log` row per record they return.
- `clinical_notes` POST no longer writes the request input to the debug log.

## Policy: `HIPAA-PHI-001` (advisory, active)

Each rule below keeps one part of the recipe true:

1. **CONF-012, tables holding health fields are tagged `phi`.** `table.tag_required` with `tag: "phi"` and `field_names` (`dob`, `ssn`, `insurance_member_id`, `diagnosis`, `first_name`, `last_name`, `address`). Points at `patients` and `clinical_notes`. `appointments` is tagged by hand, since `reason` is shared with `refunds`.
2. **CONF-011, listed health fields are marked sensitive.** `table.field_attribute_required` with `attribute: "sensitive"` and the bare names `dob`, `ssn`, `insurance_member_id`, `diagnosis`, `first_name`, `last_name`, `address`. Left out: `email`, `phone`, `note`, `reason` (see "not covered").
3. **CONF-010, objects reaching `phi` tables require login.** `object.tagged_table_access` with `table_tags: ["phi"]`. Points at the three endpoints and their tables.
4. **DATA-010, endpoints do not return sensitive fields of `phi` tables.** `db.output_fields_forbidden` with `object_kinds: ["query"]`, `table_tags: ["phi"]`, `fields` (`ssn`, `dob`, `insurance_member_id`, `diagnosis`, `note`). This will report `patients/{patient_id}` GET and `clinical_notes` POST, which return those fields.
5. **LOG-001, debug logs never read request, user or env values.** `statement.expression_rule` (template params as given).
6. **CONF-013, saved views hide sensitive fields.** `table.view_hide_required` with no params.
7. **SEC-011, external requests verify TLS.** `statement.param_forbidden` (template params as given).
8. **RET-001, the access log exists and only `log_phi_access` writes it.** `workspace.object_required` with `names: ["phi_access_log"]`, and `table.write_location_restricted` with `restricted_tables: ["phi_access_log"]`, `allowed_functions: ["log_phi_access"]`.
9. **Extra rule, objects reaching `phi` tables always call `log_phi_access`.** `object.statement_required` with `functions: ["log_phi_access"]`, `placement: "unconditional"`, `reaching_table_tags: ["phi"]`.

## Not covered (and why)

- **VND-001, approved vendors only.** I do not know your approved hosts or providers. The check needs them, and I will not invent them. Needs your input.
- **Retention (RET-002, RET-003).** I do not know how long you keep records. Needs your retention period.
- **Audit of edits and deletes** (the recipe's "record who changed what"). Not requested in this change; the access log covers reads and writes of PHI endpoints only.
- **Role checks on admin endpoints** (AUTH-002). Outside the health-data ask.
- **Names shared with other tables.** `email` and `phone` also exist on `users` and `customers`, `note` on `customer_notes`, and `reason` on `refunds`. Those checks take bare field names, so listing them would also judge those tables. I left them out of CONF-011 and CONF-012. The fields are still marked sensitive in their own tables, but no rule checks that.
- **Not visible to any policy:** people and training, access reviews, runtime data in tables, infrastructure and encryption at rest, backups, and who is allowed to read the access log.

---

# Result

## What I built and changed

Built, as planned:
- `workspace/table/phi_access_log.xs`: new table `phi_access_log`.
- `workspace/function/log_phi_access.xs`: new function `log_phi_access`, the only writer of that table.
- `workspace/policies/HIPAA-PHI-001.xs`: new policy, advisory and active, with 10 rules.

Changed, as planned:
- `table/patients.xs`: tagged `phi`; `first_name`, `last_name`, `dob`, `ssn`, `email`, `phone`, `address`, `insurance_member_id` marked sensitive.
- `table/appointments.xs`: tagged `phi`; `reason` marked sensitive.
- `table/clinical_notes.xs`: tagged `phi`; `diagnosis`, `note` marked sensitive.
- `api/app/patients/patient_id_GET.xs`: calls `log_phi_access` after the read.
- `api/app/clinical_notes_POST.xs`: calls `log_phi_access` after the write; removed `debug.log` of `$input[""]`.
- `api/app/appointments_GET.xs`: now requires login (`auth = "users"`); calls `log_phi_access` for each appointment returned.

Plan items I did not build: VND-001, retention rules, audit of edits, admin role checks (see the plan's "Not covered").

## Dry run

`xano workspace push -d ./workspace --dry-run` reported no blocked objects and no reference warnings. It listed: policy `HIPAA-PHI-001` +1 created; tables `phi_access_log` +1 created, `patients`, `appointments`, `clinical_notes` updated; function `log_phi_access` +1 created; endpoints `patients/{patient_id}` GET, `clinical_notes` POST, `appointments` GET updated.

`xano policy parse` on the policy file passed. It printed rule warnings only for names that do not exist on the branch yet (`phi` tag, `phi_access_log`, `log_phi_access`). Those names are created by this change.

I did not run `xano policy evaluate` or any non-dry-run push, so I have no findings yet. The rules below are predictions from the object files, not results.

## Before you push

Expected findings after the push (predictions, not run):
- DATA-010 will report `patients/{patient_id}` GET, which returns `ssn`, `dob` and `insurance_member_id`, and `clinical_notes` POST, which returns `diagnosis` and `note`. These are the responses the clinician UI relies on. Removing those fields is a product decision, so I did not change them.
- LOG-001 should pass, since the only `debug.log` I saw in the PHI endpoints is removed.
- VND-001 is not in the policy. Add it once you give me your approved hosts or providers.

Things to know before you push:
- `appointments` GET now needs a login. Any client that calls it without a token will get Unauthorized.
- Each read of a PHI endpoint writes `phi_access_log` rows. The access log will grow, and you have no retention rule for it yet.
- The sensitive attribute and the `phi` tag are both new schema attributes on live tables. They do not change the stored data.

Not covered by any policy and not visible to one: who on your team can read `phi_access_log`; people and training; access reviews; runtime data and copies between environments; encryption at rest, backups and network controls. A passing policy means only that the stored definitions matched the rules when it ran. It does not make the workspace HIPAA compliant.
