I've drafted 10 policies for the patients, appointments and clinical notes tables. They're files only so far: nothing is pushed, and the workspace is unchanged. They're all `active = true` and `advisory`, so when you publish them they block nothing and their findings are visible.

Important: policies can't make the app HIPAA-safe or compliant. They check the stored definitions against specific rules. A pass means only that the definitions matched the rule when it ran. HIPAA also depends on things no policy can check (see the gaps below).

**What I wrote (`out/*.xs`)**

- **AUTH-010 Endpoints require login** (critical): every endpoint needs auth unless tagged `public`. Your login endpoint already carries that tag. `appointments_GET` has no auth and will be reported.
- **SEC-014 Login tokens expire within an hour** (high): `login_POST` sets `expiration = 86400` (a day), so this will report it.
- **CONF-010 Sensitive tables are only reached by logged-in endpoints** (critical): checks endpoints that reach tables tagged `confidential`. No table carries that tag yet, so this rule checks nothing until you tag the tables. The parser says so.
- **CONF-011 Sensitive fields are marked sensitive** (high): SSN, DOB, insurance ID, names, contact details, reason, diagnosis and note in the patients, appointments and clinical notes tables must be marked sensitive. None are yet.
- **CONF-012 Tables holding confidential data are tagged** (medium): those tables should carry the `confidential` tag.
- **DATA-010 Endpoints don't return personal data** (high): endpoints must not fetch `patients.ssn` or `patients.insurance_member_id`. `patient_id_GET` loads the whole patient, so expect a report.
- **LOG-001 Logs don't contain request, user or secret data** (high): `debug.log` must not reference `$input`, `$auth` or `$env`. `clinical_notes_POST` logs `$input`, so this will report it.
- **RET-001 Only the audit function writes the audit log** (high): `audit_log` must exist, and only `record_audit_event` may write to it. Both are present.
- **SEC-012 No secrets are hardcoded** (critical): API keys, tokens and similar must come from environment variables.
- **CONF-013 Saved views hide sensitive fields** (medium): checks saved views only, and nothing is sensitive yet.

**What I didn't cover, and why**

- **Minimum necessary per user** (who can see which patient): no check fits. Clinicians legitimately see many patients, so this needs your access design.
- **Vendors with a BAA**: the vendor allowlist needs your list of approved vendors. I didn't invent one.
- **Retention and disposal periods**: you have to decide the period. The cleanup-task template needs a `retained` tag and a cleanup task, neither of which exists.
- **Who viewed a record** (read access logging): the audit check covers writes only.
- **Encryption in transit** (TLS verification, request timeouts): I didn't evaluate these checks, so they're not in the set. The workspace has several external `api.request` calls, so they may be worth adding.
- **Process items** (risk analysis, training, breach response, BAA signing): not something a policy can check.

**What you need to do in the workspace (I haven't done any of it)**

1. Decide on the tag name. I used `confidential`, since that's the template's tag. Add it to the patient, appointment and clinical note tables.
2. Mark the PHI fields `sensitive` in those tables' schemas.
3. Decide whether `appointments_GET` should require login. Adding auth changes who can call it, so that's your call.
4. Decide whether the login token lifetime should drop to one hour (`3600`).
5. Remove or sanitise the `debug.log` in `clinical_notes_POST`.

Once you tell me which of these you want, I'll make the changes and then run `xano policy evaluate` to confirm what it reports.
