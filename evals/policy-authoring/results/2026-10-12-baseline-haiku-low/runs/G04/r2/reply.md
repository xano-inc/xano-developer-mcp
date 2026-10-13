I've drafted eight policies in `out/` (AUTH-010, AUTH-020, CONF-010, CONF-011, CONF-012, DATA-010, LOG-001, RET-001). Nothing is published or pushed to your workspace yet. All of them are tagged `hipaa`, active, and advisory, so they report findings and block nothing.

**What they cover, from your tables and endpoints**

- **Login on PHI endpoints (AUTH-010):** every endpoint that reaches `patients`, `appointments` or `clinical_notes` must require a login. Public endpoints need the `public` tag. From reading the code, `appointments_GET` has no login, so I expect it to be flagged.
- **Tenant isolation (AUTH-020):** patient reads must filter on the logged-in user's `org_id`, and new patient rows can't take `org_id` from the request. `patients/{patient_id}` GET reads a patient by id with no org filter, so I expect it to be flagged.
- **No SSN or insurance ID returned (DATA-010):** endpoints must not fetch `ssn` or `insurance_member_id`. `patients/{patient_id}` GET fetches the whole record, so I expect it to be flagged.
- **Sensitive fields marked (CONF-011):** `ssn`, `dob`, `insurance_member_id` and `diagnosis` must be marked sensitive in the schema. None of them are today, so I expect findings.
- **PHI tables tagged (CONF-012) and reached only by logged-in endpoints (CONF-010):** these need a `phi` tag on the tables. Neither tag exists in the workspace yet. CONF-010 checks nothing until the tag is on the tables.
- **No PHI in logs (LOG-001):** `clinical_notes` POST has a `debug.log` whose value is `$input[""]`, which reads request input. I expect it to be flagged.
- **Audit trail (RET-001):** `audit_log` exists and only `record_audit_event` may write to it. That is currently true, so I expect no finding.

**Decisions for you**

- The `phi` tag is my choice, and the `confidential` tag in the template is not used. Adding tags changes which policies apply, so you choose the names.
- Adding `phi` to the three PHI tables and to the field-bearing tables is a change to your workspace, which I did not make.
- Marking fields sensitive, and adding login to `appointments_GET`, change behaviour. Please confirm before I suggest exact code changes.

**What a policy can't cover**

A policy only checks the stored definitions in the workspace. It can't make you HIPAA-safe, and nothing here is a compliance claim. These parts need your organisation's own processes or other tooling:

- a Business Associate Agreement with your vendors, including Xano and the card and shipping providers
- a documented risk analysis and its follow-up
- staff access reviews and training
- encryption at rest and in transit, which is a platform or hosting setting
- a retention period for patient records, and a cleanup task to match it (RET-002 checks for a task once you tag the retained data)
- breach notification procedure
- views that hide sensitive fields (CONF-013 applies only to saved views, and I could not see any in the pulled workspace)

**Next steps**

Tell me whether to proceed with these eight. I'll push them only after you say yes. Once pushed, I'll run `xano policy evaluate` and report what it prints, rather than my predictions above.
