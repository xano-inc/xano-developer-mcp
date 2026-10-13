Hi, here is what I can set up for the SOC 2 evidence, and where a policy can't help.

**What a policy is.** A Xano policy is a rule that checks your workspace's saved configuration (endpoints, tables, tests) against a standard and records a finding for each thing that breaks it. It shows the state of the workspace when it runs. It is not proof that you're compliant, and an auditor will still want to see your own review process.

**What I would publish (3 policies, all set to advisory, so they block nothing):**

1. **AUTH-010 – Endpoints require login** (access control, SOC 2 CC6.1). Every endpoint must require a logged-in user unless it is tagged `public`. Your login, health and newsletter endpoints already carry that tag. Two endpoints I read in your workspace, `appointments_GET` and `invoices/export_GET`, have no login setting and no `public` tag, so I expect them to be flagged. I have not run this, so that is a prediction.

2. **RET-001 – Only the audit function writes the audit log** (change tracking, SOC 2 CC7.2 and CC8.1). Your `audit_log` table exists, and only the `record_audit_event` function writes to it. This is the closest thing in the product to change evidence: who changed what and when.

3. **CHG-001 – Endpoints are tested** (change testing, SOC 2 CC8.1). Every endpoint should be exercised by a test that asserts something, and protected endpoints should have a test that an anonymous call is rejected. Your workspace has only two workflow tests, so I expect most endpoints to be flagged. Again, a prediction.

**What no policy can cover:**

- **Access reviews.** Checking that the right people still have the right access, on a schedule, with sign-off, is a process you run. No policy can check it. What you can keep as evidence is the review record: the date, the reviewer, the list of users, and the changes made.
- **Change approval.** Policies don't check who approved a change before it went live. Xano's `request_human_approval` flow exists for AI-agent actions, but a policy can't verify that a person approved a given change.
- **Owners of endpoints and tables.** The owner-team check exists, but your workspace has no owner tags yet. I have not proposed adding them. That is a decision for you.

**Next steps I would suggest:** review the three files in `out/`. Once you say yes, I can publish them. Then run the evaluation to see the real findings. I have not published, pushed or evaluated anything, and I have not changed your workspace.
