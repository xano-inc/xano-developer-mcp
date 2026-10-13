Hi, here's a HIPAA starting set for the patients, appointments and clinical notes data. I wrote nine advisory policies (active, not blocking) and checked that each one parses. Nothing has been pushed to your workspace.

**What I'd set up**

- **AUTH-010, endpoints require login.** Every endpoint needs a login unless it carries the `public` tag. This is unscoped, so it also covers endpoints that touch none of your health tables.
- **CONF-010, health tables only reached by logged-in endpoints.** Reads `phi` tags. No table has that tag yet, so this rule judges nothing until you tag the tables (see below).
- **CONF-011, health fields marked sensitive.** Checks `ssn`, `dob`, `diagnosis`, `note` and `insurance_member_id` are marked sensitive in their table schemas.
- **CONF-012, tables with health fields are tagged `phi`.** Flags `patients` and `clinical_notes` until they carry the tag.
- **DATA-010, endpoints don't fetch health fields.** Forbids fetching `ssn`, `dob`, `insurance_member_id` and `diagnosis`, plus any field marked sensitive. `GET patients/{patient_id}` returns the full patient row, so I'd expect it to be flagged.
- **LOG-001, logs don't contain request or user data.** Checks `debug.log` and `datadog.log`. `clinical_notes_POST` has a `debug.log` of `$input`, so I'd expect it to be flagged.
- **CONF-013, saved views hide sensitive fields.**
- **SEC-011, external requests verify TLS.** Flags `api.request` calls that turn off `verify_peer` or `verify_host`.
- **RET-001, only the audit function writes the audit log.** `audit_log` exists and `record_audit_event` is its only allowed writer.

These are predictions from reading the code. I haven't run `xano policy evaluate`, because I was asked to keep the workspace read-only.

**What's not covered, and what you'd need to decide**

1. **The `phi` tag doesn't exist yet.** CONF-010 and CONF-012 depend on it. Adding it to `patients`, `appointments` and `clinical_notes` changes which policies apply to those tables, so it's your call. Until then CONF-010 checks nothing.
2. **Access logging for each read of health data.** This needs a function such as `log_phi_access`, called by endpoints that reach `phi` tables. There isn't one in the workspace, so I didn't write that rule. `record_audit_event` records changes, not reads.
3. **Vendor allowlist (VND-001).** It needs the hosts or providers you've approved for health data. I can't pick those for you. Tell me the approved list and I'll add the policy.
4. **Retention.** HIPAA retention periods aren't checkable: the policies can confirm a cleanup task exists for a tag, but not how old a record is when it's deleted. That needs the `retained` tag and a task, neither of which exists yet.
5. **Things no check can see:** staff training, access reviews, the business associate agreements with vendors, encryption at rest, backups, and penetration tests. Those are organisational or hosting controls.

**Things to know**

- These policies relate to HIPAA; they don't make you HIPAA compliant. A pass only means the stored definitions matched each rule when it ran.
- `AUTH-010` will flag public endpoints such as login and signup unless their owner agrees to tag them `public`. The `public` tag already exists on `health_GET`, `login_POST` and `subscribe_POST`, so that exemption is already in the rule.
- Blocking is a separate decision for whoever owns these policies. Making one blocking stops merges, set-live and pushes to the live branch that introduce its findings.
