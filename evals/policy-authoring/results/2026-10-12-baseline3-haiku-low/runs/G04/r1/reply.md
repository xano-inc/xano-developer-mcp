I can't make the workspace "HIPAA-safe" or compliant. A policy only checks that stored definitions match a rule when it runs; HIPAA also covers things Xano can't check (see the end). What I can do is add policies that cover the parts of HIPAA that are visible in code and schema. I've drafted six. Nothing is published, pushed or evaluated yet.

**What I drafted** (in `out/`, all active and advisory, so they block nothing):

- **HIPAA-010** (`object.auth_required`): every endpoint that reaches `patients`, `appointments` or `clinical_notes` must require login. Access control.
- **HIPAA-020** (`table.field_attribute_required`): `ssn`, `dob`, `insurance_member_id`, `address`, `phone`, `diagnosis` and `note` must be marked sensitive on those three tables.
- **HIPAA-030** (`db.output_fields_forbidden`): reads of `patients` must not fetch `ssn` or `insurance_member_id`. This is the minimum-necessary idea.
- **HIPAA-040** (`object.statement_required`): every endpoint that touches those tables must always call `record_audit_event`. Audit controls.
- **HIPAA-050** (`statement.expression_rule`): `debug.log` in that code must not log request input.
- **RET-001** (template, two rules): `audit_log` must exist and only `record_audit_event` may write to it.

**What the workspace will probably show when evaluated** (predictions from reading the code, not a run):

- `appointments_GET` has no auth and returns every appointment. HIPAA-010 will flag it.
- `clinical_notes_POST` logs `$input[""]` with `debug.log`. HIPAA-050 will flag it.
- `patients/{patient_id}` GET fetches the whole patient row, including `ssn` and `insurance_member_id`. HIPAA-030 will flag it, and HIPAA-040 will flag it too.
- None of the three PHI endpoints calls `record_audit_event`, so HIPAA-040 will flag all three. The only callers are `customer_id_PATCH` and `delete_user_account`.
- No table in the pulled workspace has a `sensitive` attribute, so HIPAA-020 will flag the listed fields.

**What I did not cover and why:**

- **A `phi` tag on the PHI tables.** The workspace has no table tags. Tag-based scoping would be cleaner than the table names I used, but adding tags changes which policies apply, so that is your decision. Once you add it, I'd switch the `tables` scopes to `tags`.
- **Marking fields sensitive (HIPAA-020) and changing what the endpoints return (HIPAA-030)** change the schema and API output. I haven't changed either. Tell me which fields and endpoints to change.
- **Who may read PHI by role, beyond login.** No check covers this for these tables, so it's not in the drafts.
- **Retention periods and cleanup of PHI.** `RET-002` needs a `retained` tag on the tables, and there isn't one.
- **Encryption at rest and in transit, backups, automatic logoff, emergency access.** These are platform or runtime settings, not things a policy reads.
- **Business associate agreements with Xano and any vendors, risk analysis, workforce training, breach notification.** These are organisational processes.
- **Which outside vendors may receive patient data.** `VND-001` needs the list of approved vendors from you.

**Next steps for you to decide:**

1. Do you want the PHI tables tagged `phi`, so the rules can use tags?
2. Should `appointments_GET` be made to require login? I'd suggest yes, and I'd only do it on your go-ahead.
3. Should the three PHI endpoints call `record_audit_event`? That's a code change; I'd do it when you approve.

When you're happy with the files, `xano policy evaluate` will show the actual findings. Please don't read anything above as a compliance result.
