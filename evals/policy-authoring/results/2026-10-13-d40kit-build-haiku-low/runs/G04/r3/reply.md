# Plan: HIPAA health-data policies for patients, appointments and clinical notes

This follows the catalogue's `protect_health_data` recipe, with one rule the recipe asks for that no template covers. Nothing is pushed: you review the change and push it yourself.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `phi_access_log` | `workspace/table/phi_access_log.xs` | Append-only record of who opened health data, when, and which patient. |
| function | `log_phi_access` | `workspace/function/log_phi_access.xs` | Writes one `phi_access_log` row for the logged-in user and the patient they touched. |

## Changes to existing objects

| Kind | Name | File | Change |
| --- | --- | --- | --- |
| table | `patients` | `workspace/table/patients.xs` | Tag `phi`. Mark `dob`, `ssn`, `insurance_member_id` sensitive. |
| table | `appointments` | `workspace/table/appointments.xs` | Tag `phi`. Mark `reason` sensitive. |
| table | `clinical_notes` | `workspace/table/clinical_notes.xs` | Tag `phi`. Mark `diagnosis`, `note` sensitive. |
| query | `patients/{patient_id}` | `workspace/api/app/patients/patient_id_GET.xs` | Call `log_phi_access` as its first statement. |
| query | `clinical_notes` (POST) | `workspace/api/app/clinical_notes_POST.xs` | Call `log_phi_access` as its first statement. |

I am not changing any endpoint's auth. `appointments` (GET, public) reaches a PHI table without login. That is left for you to decide, see below.

## Policies (one file each under `workspace/policies/`)

Recipe templates, in order:

1. `CONF-012`: tables holding `diagnosis`, `note`, `ssn`, `dob`, `insurance_member_id` carry the `phi` tag. Uses `phi`, matching the recipe's tag choice.
2. `CONF-011`: those same fields are marked sensitive.
3. `CONF-010`: anything reaching a `phi` table requires login.
4. `DATA-010`: endpoints don't fetch the sensitive PHI fields.
5. `LOG-001`: `debug.log` never references `$input`, `$auth` or `$env`.
6. `CONF-013`: saved views hide sensitive fields.
7. `SEC-011`: external requests verify TLS.

Custom policy `PHI-ACCESS-010`: every object reaching a `phi` table calls `log_phi_access` unconditionally (`object.statement_required`).

## What stays unchecked

- **Vendors (`VND-001`)**: needs the hosts or providers you approve. I don't know them and won't guess. Not written.
- **Audit log (`RET-001`)**: needs an `audit_log` table and a `record_audit_event` function, which don't exist here. Not built, since they're outside this ask.
- **Retention, access reviews, training, encryption at rest, backups, BAAs, runtime data**: no check reads these (see the catalogue's `not_checkable` list).

## Result

### What I built and changed

- Built the `phi_access_log` table and the `log_phi_access` function as planned.
- Tagged `patients`, `appointments` and `clinical_notes` with `phi`, and marked the health fields sensitive.
- Added a `log_phi_access` call as the first statement of `patients/{patient_id}` GET and `clinical_notes` POST.
- Wrote 8 policy files under `workspace/policies/`, all `active = true`, `enforcement = "advisory"`, tagged `hipaa`:
  `CONF-010`, `CONF-011`, `CONF-012`, `CONF-013`, `DATA-010`, `LOG-001`, `SEC-011`, `PHI-ACCESS-010`.
- Each policy file parses. The parser warns that `phi`, `log_phi_access` and the health tables are not on the branch yet. That is expected until you push, and those warnings go away once the change is in.

### Dry run

`xano workspace push -d ./workspace --dry-run` reported no blocked objects and no errors. It previews 8 policies, 1 table and 1 function created, 3 tables and 2 endpoints updated.

### Before you push

These are things the policies will report, or that the change does not fix:

1. **`appointments` GET is public and reaches a `phi` table.** `CONF-010` and `PHI-ACCESS-010` will flag it. I did not change its auth, because enabling login is your decision. Its auth needs to be set, and the access call added, by you.
2. **`patients/{patient_id}` GET returns the whole patient row**, including `ssn`, `dob` and `insurance_member_id`. `DATA-010` will flag it. The chart header probably should not return these fields, but that changes what callers receive, so I left it.
3. **`clinical_notes` POST has a `debug.log` with `$input[""]`.** `LOG-001` will flag it. I left it alone because removing it changes behaviour.
4. **Vendors (`VND-001`) not written.** I don't know which hosts or AI or cloud providers receive health data, so I won't guess. Add the policy once you have the list.
5. **Audit log (`RET-001`) not written.** It needs an `audit_log` table and a `record_audit_event` function, which the workspace doesn't have. I kept it out of scope.
6. **Only the 3 health tables and the 2 endpoints I changed are covered.** `CONF-012` and `CONF-011` look for the listed field names exactly. A health field under another name, or a table I did not tag, is not found.

### What no policy here can see

Policies read stored definitions only. They cannot see BAAs, staff training, access reviews, who approved a change, encryption at rest, backups, network controls, what is actually in the database, what a request sent, or how long records are kept. None of these are covered by the policies above.

These policies are evidence that definitions were checked when they ran. They do not make the workspace HIPAA-compliant, and the customer's compliance team still needs to own the rest.
