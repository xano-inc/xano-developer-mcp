Here's a starting set of policies for the HIPAA Security Rule safeguards that map onto what your workspace has. I've drafted them in `out/` and have not published anything. Nothing in the workspace has changed.

Policies can't make you HIPAA-safe. They check the stored definitions of your Xano objects against a rule, and a pass only means the definitions matched when the check ran. Several pieces of HIPAA are organisational, and I list them at the end.

## What I drafted

All are `active = true` and `advisory`, so they block nothing and their findings are visible. Each file parses.

| Policy | What it checks | Your objects |
| --- | --- | --- |
| AUTH-010 Endpoints require login | Every endpoint needs login unless tagged `public` | Patient, appointment and note endpoints |
| AUTH-020 Users only reach their own records | Patient reads filter on `org_id` against the caller's org; new patients take `org_id` from login | `patients` |
| AUTH-030 Users can't make themselves admin | User writes don't take `role` or `org_id` from request input | `users` |
| CONF-010 Sensitive tables are only reached by logged-in endpoints | Endpoints reaching a `phi`-tagged table require login | `patients`, `appointments`, `clinical_notes` (once tagged) |
| CONF-011 Sensitive fields are marked sensitive | SSN, DOB, insurance ID, phone, email, address, diagnosis and note are marked sensitive | `patients`, `clinical_notes` |
| CONF-012 Tables holding confidential data are tagged | Those tables carry the `phi` tag | `patients`, `clinical_notes` |
| DATA-010 Endpoints don't return personal data | No endpoint fetches `patients.ssn` or `patients.insurance_member_id` | Query endpoints |
| LOG-001 Logs don't contain request, user or secret data | `debug.log` doesn't reference `$input`, `$auth` or `$env` | Any stack with `debug.log` |
| RET-001 Only the audit function writes the audit log | `audit_log` exists; only `record_audit_event` writes to it | `audit_log` |
| SEC-011 External requests verify TLS | `api.request` doesn't turn off peer or host verification | Outbound calls |
| SEC-012 No secrets are hardcoded | No API keys or tokens as literals | Everything |
| SEC-014 Login tokens expire within an hour | Auth tokens get at most 3600s; signed tokens too | Login |

## Two decisions for you

1. **PHI tag name.** I used `phi` in CONF-010 and CONF-012. The template default for CONF-012 is `confidential`. Tell me if you'd rather use that name, and I'll change both.
2. **DOB and phone on the patient endpoint.** DATA-010 blocks only SSN and insurance member ID. A clinician's chart header probably needs DOB and phone, so I left them out. Say if you want them blocked too.

## Important: CONF-010 and CONF-012 check nothing yet

No table in your workspace carries the `phi` tag. Until `patients`, `appointments` and `clinical_notes` are tagged, CONF-010 judges no endpoints and CONF-012 can't be satisfied. Tagging tables is a change to your workspace, so I haven't done it. Tell me if you want me to propose the exact tag change.

## What I expect the first run to flag (predictions, not results)

I have not run `xano policy evaluate`, so these are predictions from reading the code:

- **`appointments_GET`** has no `auth` and no `public` tag, so AUTH-010 should flag it. It returns appointment data to anyone.
- **`clinical_notes_POST`** has a `debug.log` with `value = $input[""]`. LOG-001 should flag it, and the empty key looks like a bug on its own.
- **`login_POST`** sets the token `expiration` to 86400 (24 hours). SEC-014 should flag it. Changing it affects how long users stay signed in, so that's your call.
- **`patient_id_GET`** reads the whole `patients` row with `db.get`, so DATA-010 may flag the SSN and insurance ID, and AUTH-020 should flag it for not filtering on `org_id`.
- **CONF-011 and CONF-012** should flag the patient and clinical fields until they're marked sensitive and tagged.

None of these fixes are made. Each one changes behaviour (who can call an endpoint, what a caller sees, how long a login lasts), so I'd want your go-ahead for each change.

## What these policies don't cover

- **Vendor BAAs.** VND-001 needs the list of approved vendors. Which vendors get PHI, and whether each has a BAA, is your decision. Tell me the list and I'll draft it.
- **Auditing PHI access.** No check records who viewed which patient. You'll need logging for that, and it isn't something a policy can verify.
- **Audit coverage of clinical note writes.** RET-001 only restricts the audit log's writer. It doesn't require that every `clinical_notes` write goes through the audit function.
- **Retention.** Keeping PHI for the required period and cleaning it up on schedule needs a `retained` tag and a retention decision from you.
- **Tenant scoping for `clinical_notes` and `appointments`.** Neither has an `org_id`, so AUTH-020 doesn't cover them. They reach patients only through `patient_id`.
- **Encryption at rest, backups, database access.** No check covers these.
- **Process items.** Risk analysis, workforce training, breach response, and BAA paperwork are organisational.

I'm not a lawyer or a HIPAA auditor. Please have your compliance owner review these before you rely on them.

Want me to propose the tag changes, the vendor allowlist, or the first fixes?
