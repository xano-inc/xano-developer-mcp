# Plan: HIPAA guardrails for patients, appointments and clinical notes

I followed the "Protect health data" recipe, adapted to this workspace. Tables are untagged today, and the recipe's access-record rule needs a function that does not exist yet.

## Objects to build

| Kind | Name | File | What it does |
| --- | --- | --- | --- |
| table | `phi_access_log` | `workspace/table/phi_access_log.xs` | Append-only record of who read or wrote a patient record, when, and which record. |
| function | `log_phi_access` | `workspace/function/log_phi_access.xs` | Writes one `phi_access_log` row for the logged-in user. Called by every endpoint that reaches a PHI table. |

## Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| table `patients` | `workspace/table/patients.xs` | Tag `phi`. Mark `ssn`, `dob`, `insurance_member_id` sensitive. |
| table `appointments` | `workspace/table/appointments.xs` | Tag `phi`. |
| table `clinical_notes` | `workspace/table/clinical_notes.xs` | Tag `phi`. Mark `diagnosis` sensitive. |
| query `patients/{patient_id}` GET | `workspace/api/app/patients/patient_id_GET.xs` | Call `log_phi_access` first in the stack. |
| query `clinical_notes` POST | `workspace/api/app/clinical_notes_POST.xs` | Call `log_phi_access` first in the stack. Remove `debug.log` of `$input[""]`, which writes request input to logs. |

I am not changing `appointments` GET. It has no `auth`, so it is anonymous today. Adding login changes who can call it, so that is your call (see below).

## Policies (all `active = true`, `enforcement = "advisory"`)

| Key | Source | Rule | Keeps true |
| --- | --- | --- | --- |
| `CONF-012` | template | `table.tag_required`, `field_names: [ssn, dob, diagnosis, insurance_member_id]`, `tag: "phi"` | Any table holding those fields carries `phi`. |
| `CONF-011` | template | `table.field_attribute_required`, same fields, `attribute: "sensitive"` | Those fields are marked sensitive in their table. |
| `CONF-010` | template | `object.tagged_table_access`, `table_tags: ["phi"]` | Anything reaching `patients`, `appointments` or `clinical_notes` requires login. |
| `DATA-010` | template | `db.output_fields_forbidden`, `fields: [ssn, dob, insurance_member_id, diagnosis]`, `object_kinds: [query]` | No endpoint fetches those fields. |
| `LOG-001` | template | `statement.expression_rule` on `debug.log`, `value` | Debug logs never reference `$input`, `$auth` or `$env`. |
| `CONF-013` | template | `table.view_hide_required` | Saved views hide sensitive fields. |
| `SEC-011` | template | `statement.param_forbidden`, `api.request` / `stream.from_request` `verify_peer` and `verify_host` false | External requests verify TLS. |
| `SEC-012` | template | `literal.credential_shape` | No API key, token or private key is a literal in code. |
| `PHI-ACCESS-RECORD` | own | `object.statement_required`, `functions: [log_phi_access]`, `placement: "unconditional"`, `reaching_table_tags: ["phi"]` | Every object reaching a `phi` table calls `log_phi_access` on every path. |

## Not covered, and why

- **VND-001 (approved vendors)**: needs the hosts and providers you approve. I will not pick them.
- **RET-001 (audit log)**: needs a separate audit table and function. That is the "record who changed what" goal, not part of this change.
- **AUTH-020 (users only reach their own records)**: not in the health recipe. Clinician access to other clinicians' patients is a product decision.
- **Anonymous `appointments` GET**: see the decision list in the reply.

## Pending for the customer (no object or policy can see these)

People and training, access reviews, runtime data and copies between environments, backups and encryption at rest, and retention periods.

## What I built and changed

- Built `phi_access_log` (table) and `log_phi_access` (function). The function writes one row per access, and the policy requires it on every path.
- Tagged `patients`, `appointments` and `clinical_notes` as `phi`.
- Marked `patients.ssn`, `patients.dob`, `patients.insurance_member_id` and `clinical_notes.diagnosis` as sensitive.
- `patients/{patient_id}` GET and `clinical_notes` POST now call `log_phi_access` first, passing the logged-in user.
- `clinical_notes` POST: removed a `debug.log` of `$input[""]`, which wrote the whole request body to logs.
- Wrote 9 policies, all `active` and `advisory`: `CONF-010`, `CONF-011`, `CONF-012`, `CONF-013`, `DATA-010`, `LOG-001`, `SEC-011`, `SEC-012`, `PHI-ACCESS-RECORD`.

## Dry run

`xano workspace push --dry-run` is clean. It reports 9 policies created, 1 table and 1 function created, and 5 existing objects updated. It reports no blocked objects and no missing references. Nothing was pushed.

## Findings I expect after the push

These are predictions from reading the definitions. I could not run `xano policy evaluate` here, so please check them against the real evaluation.

- **`CONF-010` and `PHI-ACCESS-RECORD` on `appointments` GET.** This endpoint has no `auth`, so anyone can list appointments with provider names and patient IDs. I did not change it, because adding login changes who can call it. Tell me whether to require login there.
- **`DATA-010` on `patients/{patient_id}` GET.** `db.get` with no `output` fetches every field, including `ssn`, `dob` and `insurance_member_id`, and the endpoint returns them. Fixing it changes the response, so it's your call which fields to drop.
- **`LOG-001` on `debug.log` in `api/app/payments/charge_POST.xs` and `function/acme_sync_shipping_rates.xs`.** These are outside the health scope, but the policy is workspace-wide. I did not change them.
- **`clinical_notes` POST response.** It returns the created row, which includes `diagnosis`. `DATA-010` may flag this. It is not certain.

## Not covered

- **Approved vendors (`VND-001`).** It needs the hosts and AI providers you approve. I did not choose them for you.
- **Audit log (`RET-001`).** It needs an audit table and an audit function. That is the "record who changed what" goal, which I left out of this change.
- **Users only see their own records (`AUTH-020`).** Not in the health recipe. Decide whether clinicians should see every patient.
- **`customers.date_of_birth`.** Not in the policy's field list, since its name differs from `dob`. Add it if it holds health data.
- **Retention periods, backups, encryption at rest, people and training, access reviews.** No check can see these. Also, the policies read definitions only, not the data in the tables.

## Before you push

Review the `phi` tag on the three tables, and the sensitive marks on the four fields. Both change what those tables expose. Then push, and evaluate the policies once it's live.
