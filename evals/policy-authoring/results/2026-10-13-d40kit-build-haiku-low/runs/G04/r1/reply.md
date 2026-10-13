# Plan: HIPAA baseline for patients, appointments and clinical notes

I pulled the workspace and read the tables and endpoints that touch patient data. The `protect_health_data` recipe fits this ask. The recipe needs a shared health tag, marked fields and an access-record function, and this workspace has none of them yet, so the plan adds them.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `phi_access_log` | `workspace/table/phi_access_log.xs` | Append-only record of each read or write of health data: who, which resource, which record, when. Not tagged `phi`, so the logger does not reach itself. |
| function | `log_phi_access` | `workspace/function/log_phi_access.xs` | Writes one `phi_access_log` row. Called unconditionally by every object that reaches a `phi` table. |

## Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| table `patients` | `table/patients.xs` | Tag `phi`. Mark `first_name`, `last_name`, `dob`, `ssn`, `email`, `phone`, `address`, `insurance_member_id` as sensitive. |
| table `clinical_notes` | `table/clinical_notes.xs` | Tag `phi`. Mark `diagnosis` and `note` as sensitive. |
| table `appointments` | `table/appointments.xs` | Tag `phi`, because `reason` holds health information. |
| query `appointments` (GET) | `api/app/appointments_GET.xs` | **Add `auth = "users"`.** Today it is public and returns every patient's appointment. Enabling auth changes who can call it, so please confirm. Also call `log_phi_access`. |
| query `patients/{patient_id}` (GET) | `api/app/patients/patient_id_GET.xs` | Call `log_phi_access` before the response. No other change. |
| query `clinical_notes` (POST) | `api/app/clinical_notes_POST.xs` | Remove the `debug.log` that writes `$input[""]` (it logs the whole request body, which is PHI). Call `log_phi_access`. |

I am not changing the response of `patients/{patient_id}`. It returns `ssn` and `dob`, so DATA-010 will report it. Removing those fields from the chart header is a product decision for you.

## Policies

Templates used, each as its own policy, `active = true`, `enforcement = "advisory"`:

1. `CONF-012`: tables that hold listed PHI fields carry the `phi` tag. Scoped to `patients` and `clinical_notes` so the `email` field on `users` is not caught.
2. `CONF-011`: the listed PHI fields are marked sensitive, scoped to the same two tables.
3. `CONF-010`: every endpoint reaching a `phi` table requires login.
4. `DATA-010`: queries do not fetch `ssn`, `dob`, `insurance_member_id`, or any sensitive field.
5. `LOG-001`: `debug.log` never references `$input`, `$auth` or `$env`.
6. `CONF-013`: saved views hide sensitive fields.
7. `VND-001`: outbound calls only go to approved vendors. I am leaving the approved list empty, because approving a vendor for PHI is your call.
8. `SEC-011`: external requests verify TLS.

One custom policy, `PHI-001`, with one rule: `object.statement_required` with `functions: ["log_phi_access"]`, `placement: "unconditional"`, `reaching_table_tags: ["phi"]`. Every object that reaches `phi` tables must record the access.

Not included: `RET-001` (audit log). It needs a separate `audit_log` table and an audit function. This is a gap for you to decide, not something I built.

## What stays unchecked

People and training, access reviews, change approvals, runtime data (the records in tables), copies between environments, infrastructure and encryption at rest, and retention periods. No object or policy here can see these. Also, the `phi` tag and the sensitive attributes only work on tables that have them, so a new table with PHI fields that nobody tags is not caught.

---

# Result

## What I built and changed

- Built: table `phi_access_log`, function `log_phi_access` (`workspace/table/phi_access_log.xs`, `workspace/function/log_phi_access.xs`).
- Changed: `patients`, `clinical_notes` and `appointments` tables (tag `phi`; sensitive attributes on the listed fields for `patients` and `clinical_notes`).
- Changed: `appointments` GET now requires login and records access; `patients/{patient_id}` GET and `clinical_notes` POST record access; `clinical_notes` POST no longer has the `debug.log` that wrote the whole request body.
- Policies written (`workspace/policies/`, all `active = true`, `enforcement = "advisory"`): `CONF-010`, `CONF-011`, `CONF-012`, `CONF-013`, `DATA-010`, `LOG-001`, `PHI-001`, `SEC-011`, `VND-001`.
- All nine policy files pass `xano policy parse`. The only warnings are that `phi` and `log_phi_access` are not on the branch yet, which is expected because this change creates them.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0 and reported: 9 policies created; 1 table and 1 function created; 3 tables and 3 endpoints updated. No blocked objects or missing references were reported. Full output is in `out/dry-run.txt`. Nothing was pushed or evaluated.

## Before you push

1. **Login on the appointments list.** `GET appointments` was public and returned every patient's appointments. It now requires `auth = "users"`. Any unauthenticated waiting-room screen will stop working. Please confirm.
2. **Patient chart returns SSN and DOB.** `patients/{patient_id}` returns the whole row, so `DATA-010` will report it. I did not change the response because removing those fields changes what clinicians see. Your call.
3. **Vendors.** `VND-001` has an empty approved list, so every outbound call and AI agent provider will be reported as not yet reviewed. Add the vendors that may receive PHI to `hosts` or `providers` yourself; I did not approve any.
4. **Audit log is not built.** `RET-001` (only the audit function writes the audit log) needs an `audit_log` table and an audit function. I did not build them, so there is no tamper-evidence for `phi_access_log` beyond its schema.
5. **Predictions, not results.** I expect `CONF-010`, `CONF-011`, `CONF-012`, `PHI-001` and `SEC-011` to pass on the three phi-tagged endpoints and tables, and `DATA-010` to report `patients/{patient_id}`. I have not run `xano policy evaluate`; the job here was validation only, so run it after the push.
6. **Health data via the support agent.** `ai/agent/support_agent.xs` and `ticket_summarizer.xs` call model providers. Nothing here stops PHI reaching them. `VND-001` will report them, and the `customer_notes` table is not PHI-tagged.

## What no check can see

People and training; access reviews and change approvals (who signed off the appointments change); runtime data (what is actually stored in the `patients` table, and copies between environments); infrastructure, encryption at rest and backups; retention periods (how long `phi_access_log` and PHI are kept); whether `log_phi_access` is called on code paths other than the three endpoints above (new endpoints that reach `phi` tables are caught by `PHI-001`, but only once they exist). Also not checked: tables that hold PHI under field names not listed (e.g. `reason` on `appointments`, which I tagged by hand but no rule reads).
