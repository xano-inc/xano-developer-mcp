# HIPAA policy set for your Xano workspace

I can't make you "HIPAA-safe" with policies: they check how the stored definitions are built, not whether your organisation meets the Security Rule. What I've drafted is a set of 8 advisory policies that catch the technical gaps I could see in your workspace. They are drafts in `out/`, not published, and I have not run them against your branch yet.

## What the drafts cover

| Policy | What it checks | Why it's here |
| --- | --- | --- |
| AUTH-010 Endpoints require login | Every endpoint needs login unless tagged `public` | `appointments_GET` and `invoices/export_GET` have no login setting |
| DATA-010 Endpoints don't return personal data | `patients.ssn` and `patients.insurance_member_id` are not fetched by query endpoints | `patients/patient_id_GET` loads the whole patient row |
| LOG-001 Logs don't contain request, user or secret data | `debug.log` must not reference `$input`, `$auth` or `$env` | `clinical_notes_POST` and `charge_POST` log input |
| CONF-011 Sensitive fields are marked sensitive | `ssn`, `dob`, `insurance_member_id`, `note`, `diagnosis` on `patients` and `clinical_notes` are marked sensitive | No field in your schema is marked sensitive yet |
| CONF-012 Tables holding PHI are tagged | `patients` and `clinical_notes` carry a `phi` tag | Your tables have no tags at all |
| SEC-014 Login tokens expire within an hour | `security.create_auth_token` expiration ≤ 3600 seconds | `auth/login_POST` sets 86400 (one day) |
| RET-001 Only the audit function writes the audit log | `audit_log` exists and only `record_audit_event` writes to it | Both `customer_id_PATCH` and `delete_user_account` go through that function |
| SEC-012 No secrets are hardcoded | No literal keys or tokens in object definitions | Covers encryption and API keys |

All eight parse cleanly against your workspace with no warnings.

## Decisions for you

- **PHI tag (CONF-012):** I used `phi`. This tag doesn't exist yet, so the policy will flag both tables until you tag them. Adding the tag is your call, because tags decide which policies apply.
- **`dob` on patients:** I included it because it's a HIPAA identifier. Clinicians may need it on the chart screen. If so, you may want to keep it out of DATA-010 and only mark it sensitive.
- **Public endpoints:** AUTH-010 exempts anything tagged `public`. Login, health and newsletter sign-up already carry that tag. Nothing else should get it without sign-off.

## What no check covers

- **Business Associate Agreements and approved vendors.** I can't tell which vendors you've signed a BAA with. VND-001 needs that list from you, so I haven't written it.
- **Reads of patient data.** RET-001 covers changes to `audit_log`, not who viewed a chart. HIPAA's audit controls expect access logging, which no check here reads.
- **Retention.** HIPAA-related retention periods need a scheduled cleanup or archive job. The retention check needs a `retained` tag on the tables, and that's a decision for you.
- **Clinician-only access.** Who may see which patient is a role question (your `users.role` enum). I have no check for "clinicians see their own patients", so AUTH-020 doesn't fit.
- **Encryption at rest, workforce training, risk analysis, breach notification, and the BAA itself.** These are organisational or runtime controls. Policies can't see them.

## Next steps

Tell me which of these you want published, and whether the `phi` tag and `dob` decisions are yours to make. Then I'll run `xano policy evaluate` and report what it prints, with the exit code. I haven't run it yet, so the findings above are predictions from reading the code.
