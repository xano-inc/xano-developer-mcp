Here is a set of HIPAA-oriented policies for your clinic data. Nothing is published or pushed yet: these are files in `out/`, and each one parses cleanly. No policy can make the workspace HIPAA-compliant. What they do is check the stored definitions against specific rules, and report what fails.

## What I found in your workspace

- `patients` (first_name, last_name, dob, ssn, email, phone, address, insurance_member_id), `clinical_notes` (diagnosis, note, author_name) and `appointments` (reason) hold health data.
- **None of these tables carry a tag**, and no field is marked sensitive. Tag-based rules would judge nothing, so the policies below name the tables and fields directly.
- There is already an audit path: `audit_log` exists, and `record_audit_event` is called by `customer_id_PATCH` and `delete_user_account`.
- There is no function that records patient-record access, so the "log every read of PHI" requirement has no check yet (see below).

## Policies written

| File | Covers |
| --- | --- |
| `PHI-010.xs` | Endpoints that reach `patients`, `clinical_notes` or `appointments` require login. |
| `CONF-011.xs` | `ssn`, `dob`, `diagnosis` and `insurance_member_id` are marked sensitive in the schema. |
| `CONF-012.xs` | Tables holding those fields carry a `phi` tag. Until you add the tag, this reports `patients` and `clinical_notes`. |
| `DATA-010.xs` | Endpoints don't fetch those four fields, or any field marked sensitive. |
| `LOG-001.xs` | `debug.log` never references request input, the logged-in user or env values. |
| `SEC-011.xs` | External requests verify TLS certificates. |
| `RET-001.xs` | `audit_log` exists, and only `record_audit_event` writes to it. |
| `PHI-020.xs` | Adds, edits, patches and deletes on those three tables call `record_audit_event` unconditionally. |

All are `active = true` and `enforcement = "advisory"`, so they report findings but block nothing. Making any of them blocking is your policy owner's decision.

## What I expect the first run to report (not yet evaluated)

These are predictions from reading the endpoints, not results:
- `appointments_GET` has no `auth`, so PHI-010 should flag it.
- `patients/{patient_id}` returns the whole patient row, so DATA-010 should flag it.
- `clinical_notes_POST` has a `debug.log` of `$input`, so LOG-001 should flag it.
- `patients` and `clinical_notes` have no `phi` tag, so CONF-012 should flag them.

## What these don't cover

- **Access logging.** HIPAA expects every read of PHI to be recorded. No check can see reads being logged, and there is no access-logging function. You would need to write one (for example `log_phi_access`) and approve it. Then a rule can require it.
- **Vendors.** VND-001 needs the list of vendors allowed to receive health data. I have not written it, because I would be inventing your approved vendors. Send me the hosts or providers and I'll add it.
- **Tags.** Once you add a `phi` tag to `patients` and `clinical_notes`, I suggest moving PHI-010 and CONF-012 to tag-based rules. Tags travel with the table if it's renamed. I have not changed the workspace.
- **Things no policy reads**: people and training, access reviews, runtime data, backups and encryption at rest, and retention periods.

## Something outside HIPAA you should look at

`payments` stores `card_number` and `card_cvv` as plain text fields. That is a PCI DSS problem, and it's the most serious finding I saw. I can write a PCI policy for it, or you can drop those fields first.
