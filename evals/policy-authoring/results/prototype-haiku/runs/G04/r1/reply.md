I've set up a first set of Xano policies for HIPAA-related safeguards. They are active and advisory, so they report findings but don't block anything yet. They are not a HIPAA certification: a pass only means the stored definitions matched each rule at the time it ran. HIPAA also covers things Xano policies can't check (BAAs with vendors, staff training, encryption at rest, retention decisions, access reviews), so those still need your own process.

What's in the set (each file is `/policies/<KEY>.xs`):

- AUTH-010 Endpoints require login. Public endpoints must carry the `public` tag.
- CONF-010 Endpoints reaching a table tagged `phi` require login.
- CONF-011 `ssn` and `date_of_birth` fields are marked sensitive.
- CONF-012 Tables with `notes` or `diagnosis` fields carry the `confidential` tag.
- CONF-013 Saved views hide sensitive fields.
- DATA-010 Endpoint queries don't fetch `ssn` or `date_of_birth`.
- LOG-001 Debug logs don't reference request input, the logged-in user or env variables.
- SEC-011 External requests verify TLS certificates.
- SEC-012 No hardcoded secrets.
- SEC-014 Auth tokens expire within 3600 seconds.
- RET-001 Only `record_audit_event` writes to `audit_log`.

Assumptions to confirm: the table names patients, appointments and clinical_notes; the `phi` and `confidential` tags on those tables; the field names `ssn`, `date_of_birth`, `notes`, `diagnosis`; and the `audit_log` table and `record_audit_event` function. Parsing warns that none of these exist in a workspace it can see, so each rule currently checks nothing until those names match your workspace.

Not covered yet, and I need your input:
- Approved vendors (VND-001) needs your list of hosts or providers. I did not guess them.
- Patient-owned record access (AUTH-020) needs to know which field links a record to its owner.
- Retention cleanup (RET-002) needs the retained-data tag and retention periods.

Nothing has been pushed or evaluated.
