Here's what I would set up, and what it can't cover. I have not published anything to your workspace, so these are drafts in `out/`.

**What "change controls" and "access reviews" mean in Xano**

Xano policies read the definitions stored in your workspace: endpoints, functions, tables and tests. They can show that a control is built into the code. They cannot show that a person reviewed and approved a change, or that someone checked who has access. Those happen outside the workspace, so no policy can prove them.

**What I drafted (five policies, all advisory, so they block nothing)**

1. **AUTH-010 Endpoints require login** (related to SOC 2 CC6.1). Every endpoint needs a login unless it is tagged `public`. Your workspace has three public endpoints: health, login and newsletter subscribe.
2. **AUTH-002 Admin endpoints check the caller's role** (CC6.3). Every endpoint in your `admin` API group must call `check_admin_role` first. Your admin endpoints already do this, as far as I can see. I scoped it by the `admin` API group, because no endpoint carries an `admin` tag.
3. **RET-001 Only the audit function writes the audit log** (CC8.1). The `audit_log` table exists, and only `record_audit_event` writes to it.
4. **AUDIT-TRAIL-COVERAGE: changes to customers and users are audited** (CC8.1). Every edit, patch and delete of the `customers` and `users` tables must call `record_audit_event`. This is the evidence of "who changed what". I picked those two tables from what I could see; tell me if other tables should be included.
5. **CHG-001 Endpoints are tested** (CC8.1). Endpoints have tests. Your workspace has only two workflow tests right now, so this will show many gaps. Passing this rule does not prove a test passes.

The `CC` numbers in the tags are my labels for the closest SOC 2 criterion. Please check them with your auditor. The tags don't claim any criterion is met.

**What no check can cover**

- **Access reviews:** whether someone regularly reviews who has access to Xano, and removes people who shouldn't. This is a process outside the code.
- **Change approvals:** whether a second person approved a change before it went live. The `approval_requests` table is for AI agent actions, not for engineering changes. No check reads who approved a change.
- **People and training.**

For the auditor, you'll want evidence from outside the workspace: your access review records, and your approval records for changes.

**Next steps**

- Say the word and I'll publish these (or you can review the files first).
- Tell me if the audited tables should be different.
- Your admin endpoints may need a tag such as `admin`, if you want the role-check rule to follow tags rather than the API group. That's your decision.
