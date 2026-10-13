I've drafted three Xano policies for the SOC 2 change-control and access evidence. They are not published yet, and I could not check them against your workspace, which I can't see from here.

What they cover:
- **CHG-001 (Endpoints are tested):** every endpoint has a test, and every protected endpoint has a test that checks an anonymous call is rejected. This is the closest thing the product has to change-control evidence, and it proves tests exist, not that they pass.
- **RET-001 (Only the audit function writes the audit log):** the `audit_log` table must exist, and only the `record_audit_event` function may write to it. This gives you a record of who changed what, if your team writes every change through that function.
- **AUTH-010 (Endpoints require login):** every endpoint requires login unless it is tagged `public`. This supports the access-control part of the evidence. It shows login is required, not that access is reviewed.

What they do not cover:
- **Access reviews** (someone regularly checking who has access and removing what they no longer need). No policy check can see this. It needs a recurring review process outside Xano, with records kept by your team.
- **Change approvals** (someone reviewing a change before it ships). No check reads that. The policies only check that tests and audit writes exist.
- These policies do not make you SOC 2 compliant or audit-ready. A pass only means the stored definitions matched the rule when it ran.

Assumptions to confirm: the table is named `audit_log`, the function is named `record_audit_event`, and the SOC 2 criteria tags (CC6.1, CC7.2, CC8.1) are my mapping, which your auditor should confirm. All three policies are set to advisory, so they block nothing.
