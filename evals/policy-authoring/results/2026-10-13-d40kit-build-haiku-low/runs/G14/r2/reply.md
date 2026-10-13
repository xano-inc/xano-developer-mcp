# Plan

Your ask has three parts. Two of them can be covered by policy. One cannot, and I say which below.

## 1. AI call inside a loop ($900 bill)

Policy checks cannot see spend, so the rule watches the shape of the code instead: no AI call may sit inside a loop.

- Existing workspace: `task/nightly_ticket_summaries` calls `ai.agent.run` inside a `foreach`. The policy will flag it. I will **not** change that task: it is your code and fixing it changes what it does. Your call.
- Policy: `AI-COST-001`, rule `statement.containment` on `ai.agent.run` and `ai.external.mcp.tool.run`, `must_not_be_inside: ["foreach", "for", "while"]`.

## 2. Background task retrying forever

**Not covered.** No check reads task retry settings, and a loop's exit condition lives in the task's own logic. `task/retry_failed_webhooks` has a `while ($delivered == false)` loop with no attempt cap. No policy here will catch it. Fixing it means adding an attempt limit to the loop itself; that is a behaviour change I have not made. Listed as a gap.

## 3. Track who changed what on tables that store customer emails

Tables with an email field: `customers`, `users`, `newsletter_subscribers`, `patients`, `orgs` (billing_email), `support_tickets` (requester_email).

Objects to build:
- `table audit_log`: append-only record of table, record id, action, actor, time, and the change.
- `function record_audit_event`: the only object that writes `audit_log`. Takes table, record id, action, actor, and the change.

Changes to existing objects (each adds one unconditional `function.run record_audit_event` right after the write, at top level of the stack):
- `api/app/customers_POST.xs` (db.add customers)
- `api/app/customers/customer_id_PATCH.xs` (db.patch customers)
- `api/app/auth/signup_POST.xs` (db.add users)
- `api/app/me_PATCH.xs` (db.patch users)
- `function/delete_user_account.xs` (db.del users)
- `api/app/newsletter/subscribe_POST.xs` (db.add newsletter_subscribers)
- `function/summarize_ticket.xs` (db.edit support_tickets)
- `task/nightly_ticket_summaries.xs` (db.edit support_tickets, inside its loop, so the call is not unconditional and will be flagged)

Policies:
- `RET-001` (template "Only the audit function writes the audit log"): `audit_log` exists; only `record_audit_event` writes it.
- `AUDIT-001` (own): add, edit, patch and delete on the six tables must call `record_audit_event` unconditionally.

## What stays unchecked

- Writes that bypass these objects: direct queries, new tables with email fields (names are listed explicitly; a new table is not covered until added), and writes from tools or agents not on the list.
- The audit function's content: a rule checks it is called, not that it records the right fields.
- Who approved a change, who can read the audit log, and retention of audit rows.
- Retry behaviour of tasks, and spend caps. See part 2.
- All policies are advisory. Nothing blocks a push until you change `enforcement`.

---

# What I built and changed

**New objects**
- `table audit_log` (`workspace/table/audit_log.xs`): append-only audit rows.
- `function record_audit_event` (`workspace/function/record_audit_event.xs`): the only writer of `audit_log`.

**Existing objects changed** (each adds one unconditional `function.run record_audit_event` after the write; nothing else touched)
- `api/app/customers_POST.xs`, `api/app/customers/customer_id_PATCH.xs`, `api/app/me_PATCH.xs`, `api/app/auth/signup_POST.xs`, `api/app/newsletter/subscribe_POST.xs`
- `function/delete_user_account.xs`, `function/summarize_ticket.xs`
- `task/nightly_ticket_summaries.xs`: the audit call sits inside its `foreach`, so it is not unconditional. `AUDIT-001` will flag it. I did not restructure the loop.
- Audit payloads pass the submitted input, not the whole row, so password hashes do not land in `audit_log`.

**Policies** (`workspace/policies/`, all `active = true`, `enforcement = "advisory"`)
- `AI-COST-001`: AI agent runs and MCP tool calls must not sit inside `foreach`, `for` or `while`.
- `RET-001` (template): `audit_log` exists and only `record_audit_event` writes it.
- `AUDIT-001`: add, edit, patch and delete on `customers`, `users`, `newsletter_subscribers`, `patients`, `orgs`, `support_tickets` must call `record_audit_event` unconditionally.

All three parse. The parse warnings were only that `audit_log` and `record_audit_event` do not exist on the branch yet, which is expected.

**Dry run** (`xano workspace push -d ./workspace --dry-run`): 3 policies, 1 table and 1 function created; 2 functions, 1 task and 5 endpoints updated. No blocked objects or missing references reported. I have not pushed.

# Known findings you will see after pushing

- `AI-COST-001` flags `task/nightly_ticket_summaries`: the `ai.agent.run` is inside its `foreach`. This is the loop that matches your $900 incident. Moving the call out of the loop, or batching it, is your change to make.
- `AUDIT-001` flags the audit call in `task/nightly_ticket_summaries` (inside the loop).

# What no object or policy here can see

- **Retry forever (your background task)**: not covered. No check reads task retry settings, and the loop's exit lives in the task's own code. `task/retry_failed_webhooks` has a `while` loop with no attempt cap. Add a counter and a max to that loop yourself; a policy cannot verify it.
- **Spend caps**: no check reads what AI calls cost. `AI-COST-001` only keeps calls out of loops; a single endpoint can still run up cost.
- **New tables with emails**: the table list in `AUDIT-001` is by name. A new table storing emails is not covered until you add it there. Tagging is not a substitute here, as the rules take table names.
- **Writes that bypass these objects**: a direct query, a write in an object not listed above, or a tool or agent write is not audited unless it calls `record_audit_event`. `AUDIT-001` checks that calls exist, not that every path makes one.
- **What the audit records**: the rule checks the function is called, not that it captures the right fields. Audit payloads include the submitted email, so access to `audit_log` is itself sensitive; nothing here restricts reads of it.
- **Who approved a change, and retention of audit rows**: outside the definitions.
- **Blocking**: everything is advisory. Nothing blocks a push until you change `enforcement` yourself.
