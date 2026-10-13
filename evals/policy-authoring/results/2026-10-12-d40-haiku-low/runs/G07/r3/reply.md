Thanks for the question. Before the details, one thing to be clear about: a policy can show that certain controls are set up in the workspace, and it can keep a record of whether they still hold. It cannot prove you are SOC 2 compliant, and it cannot do your access reviews for you. Your auditor will also want the human side (who reviews access, how often, and who approves changes), and that lives outside Xano.

**What "change controls" and "access reviews" mean in this product**

- *Change controls* here mean two things the workspace can show: every change to important data leaves an audit entry saying who made it, and endpoints are tested before they are relied on.
- *Access controls* mean that endpoints require a login, and that admin endpoints check the caller's role before doing anything.
- *Access reviews* (periodically checking who should still have access) are not something a policy can see. Policies read the workspace's definitions, not who signed in or who approved a change.

**What I've drafted (not published)**

I wrote five policy files in `out/`. Nothing has been published or changed in your workspace. Each one is advisory, so it blocks nothing and its findings are only visible.

1. **AUTH-010, Endpoints require login.** Checks every endpoint requires a login, except the three marked `public` (health check, login, newsletter signup).
2. **AUTH-002, Admin endpoints check the caller's role.** Checks every endpoint in the `admin` API group calls the `check_admin_role` function first. I scoped it by API group because your admin endpoints are not tagged `admin`.
3. **RET-001, Only the audit function writes the audit log.** Checks the `audit_log` table exists and only `record_audit_event` writes to it.
4. **CHANGE-AUDIT, Changes to customers, users and tenants are audited.** Checks every edit, patch or delete of those three tables calls `record_audit_event`. I picked these three tables because the audit calls in your code already cover customers and users. If other tables hold customer data, tell me and I'll add them.
5. **CHG-001, Endpoints are tested.** Checks every endpoint has a test that asserts something. Your workspace has only two tests, so this will report many endpoints today.

**What I expect the policies to find (predicted, not run)**

- `PATCH tenants/{tenant_id}` (admin) changes tenant data without an audit entry, and it calls the role check after reading the record rather than first. Both would be flagged.
- Most endpoints have no test, so CHG-001 will report many.

**What no policy covers**

- Who has access and whether that access was reviewed. This needs a regular review process run by a person.
- Who approved each change. Policies can see the code, not the sign-off.
- Anything about people, training, or infrastructure.

**Decisions for you**

- Should `tenants` changes be audited? That is the gap the policy would report.
- Are the three tables in CHANGE-AUDIT the right set?
- Once you're happy, the policies can be published. Making any of them blocking is a decision for their owner, and I'd suggest starting advisory.
