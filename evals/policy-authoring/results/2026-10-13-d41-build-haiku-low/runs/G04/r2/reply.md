# Plan: HIPAA health-data policy set

This matches the platform recipe **protect_health_data** (HIPAA). It covers the three tables you named (patients, appointments, clinical_notes) and the endpoints that read or write them. A policy can check the stored definitions. It cannot check people, access reviews, infrastructure, or the data itself. See "What stays unchecked" below.

## Objects I will build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `phi_access_log` | `workspace/table/phi_access_log.xs` | One row per access to a health record: who (`user_id`), which table and record, and when. Only `log_phi_access` writes it. |
| function | `log_phi_access` | `workspace/function/log_phi_access.xs` | Takes the table name and record id and adds a `phi_access_log` row with `$auth.id`. Every endpoint that reaches a `phi` table calls it. |

## Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| table `patients` | `workspace/table/patients.xs` | Tag `phi`. Mark `dob`, `ssn`, `insurance_member_id` as `sensitive`. |
| table `appointments` | `workspace/table/appointments.xs` | Tag `phi`. Mark `reason` as `sensitive`. |
| table `clinical_notes` | `workspace/table/clinical_notes.xs` | Tag `phi`. Mark `diagnosis`, `note` as `sensitive`. |
| query `appointments` GET | `workspace/api/app/appointments_GET.xs` | **Require login** (`auth = "users"`, currently public). Call `log_phi_access` after the read. |
| query `patients/{patient_id}` GET | `workspace/api/app/patients/patient_id_GET.xs` | Call `log_phi_access` after the read. |
| query `clinical_notes` POST | `workspace/api/app/clinical_notes_POST.xs` | Call `log_phi_access` after the insert. |

I will **not** change the `debug.log` in `clinical_notes_POST` that logs `$input`. LOG-001 will report it, and removing it is a code change you should approve.

## Policies (one per template, plus one of our own)

Each policy is `active = true` and `enforcement = "advisory"`, so nothing blocks until you choose to make it blocking.

1. **CONF-012** Tables holding confidential data are tagged. `table.tag_required`: `field_names` = diagnosis, note, reason, dob, ssn, insurance_member_id; `tag` = `phi`.
2. **CONF-011** Sensitive fields are marked sensitive. `table.field_attribute_required`: the same six fields; `attribute` = `sensitive`.
3. **CONF-010** Sensitive tables are only reached by logged-in endpoints. `object.tagged_table_access`: `table_tags` = `phi`.
4. **DATA-010** Endpoints don't return personal data. `db.output_fields_forbidden`: `fields` = ssn, dob, insurance_member_id.
5. **LOG-001** Logs don't contain request, user or secret data. `statement.expression_rule` on `debug.log`, forbidding `$input`, `$auth`, `$env`.
6. **CONF-013** Saved views hide sensitive fields. `table.view_hide_required`.
7. **SEC-011** External requests verify TLS. `statement.param_forbidden` on `api.request` and `stream.from_request`.
8. **RET-001** Only the audit function writes the audit log. `workspace.object_required` (table `phi_access_log` exists) and `table.write_location_restricted` (`phi_access_log` writable only from `log_phi_access`).
9. **PHI-ACCESS-001** (ours) Objects reaching `phi` tables always call `log_phi_access`. `object.statement_required`: `functions` = `log_phi_access`, `placement` = `unconditional`, `reaching_table_tags` = `phi`.

## Left out on purpose

- **VND-001 (approved vendors).** The template needs your approved hosts or providers. The workspace makes no outbound calls, so I have no list to fill in. Add it once you give me the vendors.
- **Retention (RET-003), role checks, rate limiting.** Not in the health recipe. Your ask did not name them. I can add them if you want.

## What stays unchecked

Policies read stored definitions only. They cannot see:

- People and training, background checks, and who holds which role.
- Access reviews and change approvals.
- Runtime data: what requests send, what is stored, and copies between environments.
- Infrastructure: encryption at rest, backups, network controls, vulnerability scans, penetration tests, and a signed BAA with Xano or your host.
- Whether the access log is complete, or whether `log_phi_access` is called on every path at runtime.

A passing policy means the stored definitions matched the rule when it ran. It does not make you HIPAA-compliant.

---

# What I built and changed

I built everything in the plan except VND-001 (see "Left out on purpose"). I did not push anything.

- **New:** table `phi_access_log`, function `log_phi_access`.
- **Changed:** tables `patients`, `appointments`, `clinical_notes` (tag `phi`, sensitive fields); endpoints `appointments` GET (now requires login), `patients/{patient_id}` GET and `clinical_notes` POST (now call `log_phi_access`).
- **Policies (9 files under `workspace/policies/`):** CONF-012, CONF-011, CONF-010, DATA-010, LOG-001, CONF-013, SEC-011, RET-001, PHI-ACCESS-001. All are `active = true` and `enforcement = "advisory"`.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0. It would create 9 policies, 1 table, 1 function, and update 3 tables and 3 endpoints. It reported no blocked objects and no missing references. `xano policy parse` passed on all nine policy files.

The dry run also printed warnings that `phi`, `phi_access_log` and `log_phi_access` are not on the branch yet. They will resolve once the objects are pushed together. I did not run `xano policy evaluate`, since that command was outside my allowed set.

## Before you push

These are predictions from reading the code, not evaluation results:

- **LOG-001 will flag** `clinical_notes` POST, which has `debug.log { value = $input[""] }`. That logs request input, which can include note text. I did not remove it. Please decide how to fix it.
- **DATA-010 will likely flag** `patients/{patient_id}` GET. It runs `db.get patients` with no field list, so it fetches `ssn`, `dob` and `insurance_member_id`. The response may still expose them. Narrow the read or leave it as is.
- **Auth change:** `appointments` GET was public and now requires login. That is a change to who can call it. Check that your waiting-room client sends a token.
- **Unverified syntax:** I wrote field attributes as `{sensitive = true}` and table tags as `tags = ["phi"]`. The dry run accepted both, but I did not confirm them against a live push.
- **`log_phi_access` records list reads with `record_id` null.** Only the single-patient and note-create endpoints record a record id.
- **Shared-table change:** adding `phi` tags and `sensitive` attributes changes which policies apply to those tables for every branch.

## Left out on purpose

- **VND-001 (approved vendors).** It needs your approved hosts or providers. The workspace makes no outbound calls, so I had no list to use. Send me the list and I will add it.
- **RET-003 (retention), role checks, rate limiting.** Not in the health recipe, and your ask did not name them.

## What stays unchecked

Policies read stored definitions only. They cannot see the following:

- People and training, background checks, and who holds which role.
- Access reviews and change approvals.
- Runtime data: what requests send, what is stored, and copies between environments.
- Infrastructure: encryption at rest, backups, network controls, scans, penetration tests, and a signed BAA with Xano or your host.
- Whether `log_phi_access` runs on every path at runtime. PHI-ACCESS-001 checks that the call is written unconditionally in each stack, not that it executes.

A passing policy means the stored definitions matched the rule when it ran. It does not make the workspace HIPAA-compliant.
