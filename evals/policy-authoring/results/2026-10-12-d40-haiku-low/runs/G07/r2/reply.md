I've drafted five policies that cover the parts of change control and access control that show up in the product. They are not published yet, and nothing in your workspace has changed. Two parts of your auditor's request can't be covered by a policy at all, and I explain those below.

**What the policies would check**

- **Who can change customer data is logged (`audit-customer-data-changes`).** Any endpoint or function that adds, edits, patches or deletes a record in customers, payments, invoices, orders or users must call `record_audit_event` every time. That function writes a row to the `audit_log` table, recording who made the change, which table and which record. This is the closest thing the product has to a change log that an auditor can read.
- **Only one function can write the audit log (`RET-001`).** The `audit_log` table has to exist, and `record_audit_event` must be the only thing that writes to it. Without this, the log could be edited by anything.
- **Admin endpoints check the caller's role (`AUTH-002`).** Every endpoint in the `admin` API group must call `check_admin_role` first, passing the logged-in user. This is evidence that staff-only endpoints are guarded.
- **Endpoints require login (`AUTH-010`).** Every endpoint needs a login, except those tagged `public`.
- **Endpoints are tested (`CHG-001`).** Each endpoint needs a test. Every protected endpoint also needs a test that an anonymous call is rejected. This is the testing part of change management.

**What a policy cannot show**

- **Access reviews.** A policy can show who *can* reach an endpoint. It cannot show that a person reviewed those permissions, when, or what they decided. That happens outside the product, so you will need a written review process and its records (for example, a quarterly sign-off on the list of admins).
- **Change approvals.** A policy can show that a change was tested and logged. It cannot show that someone approved it. The product has an approval step for actions the support agent proposes (`request_human_approval`), but that does not cover changes to the code or database. Approval of changes needs a process of its own.

**What a passing policy means**

A pass means the stored definitions matched the rule when it ran. It does not make you compliant, certified or audit-ready. Each policy is tagged with the SOC 2 criterion it relates to (CC6.1, CC7.2, CC8.1), so you can point your auditor to the right place. The statements say the same thing.

**Things to decide before this goes live**

- The customer-data list (customers, payments, invoices, orders, users) is my guess at what "customer data" means. Tell me which tables to add or remove.
- The policies are advisory: they report findings but block nothing. Making any of them blocking is your owner's decision, and blocking would stop merges and deploys that introduce a finding.
- Some endpoints and functions will probably show findings on the first run, for example the places that change customer records without calling the audit function. I have not run the checks, so I don't know the exact list yet. Once you approve, I can run `xano policy evaluate` and report what it prints.
