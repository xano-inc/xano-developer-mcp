Thanks for the question. Here is what I found in your workspace and what I would set up.

**What "change controls" and "access reviews" mean in Xano.** A policy is a check that runs against the stored definitions of your backend and records a pass or a finding. It can show that a control is in place on the definitions at the time it runs. It cannot prove a control is working, and it cannot prove that someone reviewed access. Those two things are a process your team runs, so I can't cover them with a policy.

**What I would set up (three policies, not yet published):**

1. **AUTH-010, Endpoints require login** (tagged SOC 2 CC6.1). Every endpoint must require a logged-in user. Your login, health check and newsletter endpoints carry the `public` tag, so they are exempt. This is the access-control evidence that covers most of "who can call what."
2. **RET-001, Only the audit function writes the audit log** (tagged SOC 2 CC7.2). Your `audit_log` table exists, and the only writes to it go through `record_audit_event`. This is the change-record evidence: who changed which record.
3. **CHG-001, Endpoints are tested** (tagged SOC 2 CC8.1). Each endpoint should have a test that asserts something, and protected endpoints should have a test that an anonymous call is rejected. Right now your workflow tests cover only two endpoints, so I expect this one to report many findings. That is useful information for your auditor, not a fault in the policy.

All three are `active = true` and `enforcement = "advisory"`, so they report findings and block nothing. The files are in `out/` (`AUTH-010.xs`, `RET-001.xs`, `CHG-001.xs`). Each one parses. I have not published them, and I have not run an evaluation, so I cannot yet tell you what the findings will be.

**What I did not cover:**

- **Access reviews.** No policy check can tell whether someone reviewed who has access. You need a recurring review process, and the evidence for it is the review record you keep.
- **Admin role checks.** I looked at adding a rule that every admin endpoint calls `check_admin_role` first. None of your admin endpoints carry the `admin` tag, so that rule would match nothing and check nothing. If you tag the admin endpoints, I can add it. Tagging is your decision, so I have not done it.
- **Approval for agent actions.** `issue_refund` calls `request_human_approval`, which is a real change control. No check can require that only certain tools call it, so I left it out.

**Things to decide:**

- Tagging the admin endpoints `admin`, if you want the admin role-check rule.
- Whether CHG-001 should stay advisory. Right now it will show many findings until more endpoints have tests.
