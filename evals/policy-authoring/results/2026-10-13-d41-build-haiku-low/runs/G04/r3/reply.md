# Plan: HIPAA setup for patients, appointments and clinical notes

Your workspace has a recipe for this goal, **Protect health data** (HIPAA). It covers health data in `patients`, `appointments` and `clinical_notes`. I'm following it, with the workspace's own names filled in.

## 1. Objects to build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `phi_access_log` | `workspace/table/phi_access_log.xs` | One row per read of a health record: who (`$auth.id`), which table and record, and when. |
| function | `log_phi_access` | `workspace/function/log_phi_access.xs` | Adds one `phi_access_log` row for the logged-in user. It is the only writer of that table. |

## 2. Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| table `patients` | `workspace/table/patients.xs` | Tag `phi`. Mark `ssn`, `dob`, `insurance_member_id` as sensitive. |
| table `clinical_notes` | `workspace/table/clinical_notes.xs` | Tag `phi`. Mark `diagnosis`, `note` as sensitive. |
| table `appointments` | `workspace/table/appointments.xs` | Tag `phi`. Mark `reason` as sensitive. This is my judgement: `reason` is a clinical reason for the visit. |
| endpoint `patients/{patient_id}` (GET) | `workspace/api/app/patients/patient_id_GET.xs` | Call `log_phi_access` unconditionally. |
| endpoint `clinical_notes` (POST) | `workspace/api/app/clinical_notes_POST.xs` | Call `log_phi_access` unconditionally. |
| endpoint `appointments` (GET) | `workspace/api/app/appointments_GET.xs` | Call `log_phi_access` unconditionally. |

Nothing else in the workspace is touched. Auth on the endpoints, the existing `debug.log` lines and the card-data endpoints stay as they are.

## 3. Policies

Each template is its own policy, all `active = true` and `enforcement = "advisory"`. The last policy holds the rule no template covers.

| Key | Rule | Points at |
| --- | --- | --- |
| `CONF-012` | `table.tag_required`: tables with these fields carry tag `phi` | `patients`, `clinical_notes`, `appointments` |
| `CONF-011` | `table.field_attribute_required`: these fields are sensitive | the marked fields above |
| `CONF-010` | `object.tagged_table_access`: endpoints reaching `phi` tables require login | the three endpoints above |
| `DATA-010` | `db.output_fields_forbidden`: endpoints don't fetch these fields | the sensitive fields above |
| `LOG-001` | `statement.expression_rule`: `debug.log` doesn't read `$input`, `$auth` or `$env` | all endpoints |
| `CONF-013` | `table.view_hide_required`: saved views hide sensitive fields | the marked fields |
| `VND-001` | `outbound.vendor_allowlist`: outbound hosts are approved | hosts left empty (see below) |
| `SEC-011` | `statement.param_forbidden`: no `verify_peer` / `verify_host` set to false | all external requests |
| `RET-001` | `phi_access_log` exists, and only `log_phi_access` writes it | `phi_access_log`, `log_phi_access` |
| `HIPAA-PHI-010` (own key) | `object.statement_required`, unconditional: objects reaching `phi` tables call `log_phi_access` | the three endpoints |

## 4. What stays unchecked

Policies read object definitions only. They cannot see:

- People and training, access reviews, and who approved a change.
- Runtime data: the records in tables, what requests send, and copies between environments.
- Infrastructure: encryption at rest, backups, network controls, vendor BAAs.
- Whether a field outside this list holds health data. Names are matched exactly, so `email`, `phone`, `address`, `first_name` and `last_name` are not marked here.
- Whether `log_phi_access` itself records what the clinical record actually is.
- Whether any caller has the right role. Login is checked, not roles.

## Open decisions for you

- **Vendor hosts:** I will leave `VND-001` with an empty host list, so every outbound host is reported as not yet reviewed. Approving a vendor is your decision.
- **Tables outside this scope:** `payments`, `customers`, `invoices` and other tables are not health tables and are not tagged.
- **`appointments` access logging:** `appointments_GET` returns a list, not one record, so the single-record `log_phi_access(record_table, record_id)` cannot describe it. I did not change that endpoint. It is also public (no `auth`), so `CONF-010` will flag it, and `HIPAA-PHI-010` will too. Choose one: require login and log one row per returned appointment (a loop in the endpoint), or accept the gap.

## 5. What I built and changed

- New: `table/phi_access_log.xs`, `function/log_phi_access.xs`.
- Changed: `table/patients.xs`, `table/clinical_notes.xs`, `table/appointments.xs` (tag `phi`, fields marked sensitive). `api/app/patients/patient_id_GET.xs` and `api/app/clinical_notes_POST.xs` (call `log_phi_access`).
- Not changed: `api/app/appointments_GET.xs`, for the reason above.
- Policies: `policies/CONF-010.xs`, `CONF-011`, `CONF-012`, `CONF-013`, `DATA-010`, `HIPAA-PHI-010`, `LOG-001`, `RET-001`, `SEC-011`, `VND-001`. All parse with `xano policy parse`.

## 6. Dry run

`xano workspace push -d ./workspace --dry-run` ran with no blocked objects and no missing references. It previews 10 policies created, 1 table and 1 function created, 3 tables updated and 2 endpoints updated. I did not run `xano policy evaluate`, so no findings are measured yet.

Parse warnings that the change itself resolves: `phi` is on no table yet, `phi_access_log` and `log_phi_access` are not on the branch yet, and `RET-001` names the same two objects.

## 7. Before you push

Predictions, not results. Run `xano policy evaluate` after pushing to see the real findings. I expect these:

- `DATA-010`: `patient_id_GET` returns the whole `patients` row, so `ssn`, `dob` and `insurance_member_id` are fetched and flagged. `clinical_notes_POST` may also be flagged for `diagnosis` and `note`.
- `LOG-001`: `clinical_notes_POST` has a `debug.log` of `$input`, which is flagged. `payments/charge` (card data, outside this scope) has one too.
- `CONF-010` and `HIPAA-PHI-010`: `appointments_GET` (public, reaching `appointments`, not logging).
- `VND-001`: every outbound host is unreviewed, because the host list is empty. That includes Stripe and the `acme_*` functions.

Fixing these is a separate request, and some need your decision: adding auth to `appointments_GET`, the vendor hosts, and whether `email`, `phone`, `address`, `first_name` and `last_name` should also be marked sensitive.

## 8. What no object or policy here can see

- Whether the field list is complete. The policies match exact names: `email`, `phone`, `address`, `first_name` and `last_name` are not marked or tagged. Under HIPAA these are identifiers too.
- Whether `log_phi_access` is called on every path. It is required unconditionally, but the access rule only checks that the call is present, not what it records.
- Who can call the three endpoints. `CONF-010` checks login, not roles. Role checks are not in this set.
- Runtime data, encryption at rest, backups, vendor BAAs, staff training and access reviews. None of these is a workspace definition.
- `reaching_table_tags` covers objects that reach a `phi` table through a function. An AI tool or a task that reads these tables is covered only if it does so through one of those paths.
- No policy makes the workspace HIPAA-compliant or audit-ready. A pass means only that the stored definitions matched the rule when it ran.
