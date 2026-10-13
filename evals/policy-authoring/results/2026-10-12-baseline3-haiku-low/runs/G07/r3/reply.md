Thanks for asking. I looked at your workspace and I can help with part of this, but a policy can't prove what your auditor is asking for on its own. Here is what I would set up, what it covers, and what it doesn't.

**What "change controls" and "access reviews" mean**

- *Change controls* means you can show that changes to the system are made deliberately, tested, and recorded.
- *Access reviews* means someone periodically checks who has access to what, and removes access that is no longer needed.

A policy can only check the code and configuration in the workspace. It can show that some controls are built into the code. It cannot show that a person reviewed access or approved a change. That evidence has to come from your own review records.

**Three policies I would add (none is published yet)**

1. **AUTH-002, admin endpoints check the caller's role** (critical, SOC 2 CC6.1 and CC6.3). Every endpoint in your `admin` API group must call `check_admin_role` as its first step, so only admins and support leads reach back-office data. This is the closest thing in the workspace to an access control. In your workspace, `users_GET`, `tenant_id_PATCH` and `orgs/org_id/tenants_GET` call it. `tenants_GET` in the admin group does not appear to, so I expect that endpoint to be flagged. I have not run the policy to confirm that.

2. **RET-001, only the audit function writes the audit log** (high, SOC 2 CC7.2 and CC8.1). The `audit_log` table may only be written by `record_audit_event`. This keeps the change history in one place. It does not prove that every change to customer data is recorded. Several endpoints and functions write customer data directly, without going through the audit function, for example `customers_POST`, `payments/charge_POST` and `clinical_notes_POST`. The policy won't flag those writes. If you want a finding for them, that is a separate decision for you and your policy owner.

3. **CHG-001, endpoints are tested** (low, SOC 2 CC8.1). Every endpoint, function, AI tool and task must be called by a test that asserts something, and each endpoint that requires a login must have a test that an anonymous call is rejected. Your workspace has one workflow test, so I expect many findings. A test run is evidence that code was tested. It is not evidence that a change was approved.

**What no check covers**

- **Access reviews.** No check exists for a periodic review of who holds which role. That is an organisational process, and it needs a record kept outside Xano, such as signed review sign-offs.
- **Change approval.** Nothing in the workspace records who approved a change before it went live.
- **Logging of all customer-data changes.** RET-001 only protects the audit table. It does not check that every write to customer data is logged.

**Things to decide before this goes live**

- All three policies are set to `advisory`, so they report findings and block nothing. Change that only if your policy owner agrees.
- I used the tags `soc2`, `cc6.1`, `cc6.3`, `cc7.2`, `cc8.1` as criterion labels. A tag is a label, not proof that the criterion is met. Please check the criterion numbers against your auditor's list.
- Once these are set up and evaluated, the findings show where the code does not match the rules. They do not make the workspace compliant or audit-ready.

I have not published or evaluated anything. The policy files are in `out/` (`AUTH-002.xs`, `RET-001.xs`, `CHG-001.xs`), and each one passes `xano policy parse`. If you want them published, tell me and I will walk you through the push.
