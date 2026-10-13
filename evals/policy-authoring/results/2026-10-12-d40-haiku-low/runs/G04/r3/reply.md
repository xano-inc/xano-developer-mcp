I've drafted a set of advisory policies for your health data. They are in `out/` as one file per policy, and each one parses. Nothing has been published to your workspace. I haven't run `xano policy evaluate` either, because I was only allowed to read your workspace here.

**What I found in your workspace**

- `patients`, `clinical_notes` and `appointments` have no tags, and none of their fields is marked sensitive. Most of the health rules therefore have nothing to judge until you tag and mark those tables.
- `GET appointments` has no login (`auth`), and it returns appointment rows, which include `patient_id` and `reason`. That endpoint is the most obvious gap.
- `POST clinical_notes` calls `debug.log` on `$input`, so request data, including diagnosis and notes, would be written to logs.
- `GET patients/{patient_id}` returns the whole patient row, including `ssn`, `dob` and `insurance_member_id`.
- You already have an `audit_log` table and a `record_audit_event` function, so the audit-protection rule can be written as is.

**The policies (`out/`)**

| File | What it requires | Notes |
| --- | --- | --- |
| `AUTH-010.xs` | Endpoints that touch patients, clinical_notes or appointments require login | Scoped to those tables, so it doesn't reach your other endpoints. This is the one that will flag `GET appointments` |
| `CONF-010.xs` | Anything reaching a `phi` table requires login | Judges nothing until the `phi` tag exists on your tables (the parser warns about this) |
| `CONF-011.xs` | `diagnosis`, `note`, `ssn`, `dob`, `insurance_member_id` are marked sensitive in patients and clinical_notes | Every one of these fields is currently unmarked |
| `CONF-012.xs` | Any table with those fields carries the `phi` tag | Adds the tag as a requirement; it doesn't add it to your tables |
| `CONF-013.xs` | Saved views of patients and clinical_notes hide those fields | |
| `DATA-010.xs` | No endpoint fetches `patients.ssn`, `patients.dob` or `patients.insurance_member_id` | Doesn't cover `diagnosis` on clinical notes |
| `LOG-001.xs` | `debug.log` never references `$input` or `$auth` | Will flag `POST clinical_notes`. Only `debug.log` is checked |
| `RET-001.xs` | `audit_log` exists and only `record_audit_event` writes to it | |
| `SEC-011.xs` | External requests don't turn off TLS peer or host checks | Generic; only covers `api.request` and `stream.from_request` |

**Decisions for you (I did not change your workspace)**

1. **Tag your health tables `phi`.** Add it to `patients` and `clinical_notes`. Decide whether `appointments` gets it too: it holds `patient_id` and `reason`, but none of the fields CONF-012 lists. Until you tag them, CONF-010 checks nothing.
2. **Mark the health fields sensitive** (`diagnosis`, `note`, `ssn`, `dob`, `insurance_member_id`) in the schema. CONF-011 will flag them until you do, and that changes how the fields are treated elsewhere, so check it first.
3. **Decide whether `GET appointments` should be public.** If not, enable login on it. Changing auth is your call, so I haven't suggested an auth table.
4. **Access logging.** HIPAA asks you to record who viewed patient data. None of the checks can see whether a read was logged. I'd add a `log_phi_access` function and then name it in a policy, but I haven't created it.
5. **Vendors.** Tell me which vendors may receive health data and I'll write the VND-001 vendor allowlist. I didn't guess a list.
6. **Retention, training, access reviews, BAAs, encryption at rest and backups** are not visible to any check. Policies only read object definitions.

These policies support part of your HIPAA work. They don't make your workspace HIPAA compliant. A pass only means the stored definitions matched the rule when it ran.
