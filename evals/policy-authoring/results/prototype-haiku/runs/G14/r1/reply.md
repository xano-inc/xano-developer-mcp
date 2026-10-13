I set up two policies for cost and customer-email auditing. Both are advisory and active, so they flag issues and never block a merge or push. A few parts of your ask cannot be checked by a policy, which I list at the end.

**COST-010: AI calls stay out of loops.** Flags any AI model call placed inside a `foreach`, `while` or `for` block. A single run can then no longer multiply the call count.

**RET-001: Only the audit function writes the audit log.** Requires an `audit_log` table and allows writes to it only from `record_audit_event`. This gives you one approved place to record who changed what.

**CUST-EMAIL-010: Customer email changes are audited.** Tables with an `email` field must be tagged `pii`. Any endpoint, task, tool or message that reaches a `pii` table must require login and must call `record_audit_event` unconditionally. This is what lets you answer who changed a customer's email.

Not covered by a policy, so you will need to handle these another way:
- **Retry forever.** A policy cannot read a task's retry setting, so I could not add a retry cap. Set a retry limit on the task itself and review it.
- **Spend cap.** A policy cannot cap money spent. Set a spend limit with your AI provider.

Assumptions you should check: the AI call statement is written as `ai.prompt`, which is a placeholder I could not confirm. The rule matches nothing until it is replaced with your real AI statement name. Also assumed: the `audit_log` table, the `record_audit_event` function, and the `pii` tag. The parser warns that these are not on your branch yet.

Nothing here makes the workspace compliant. A pass only means the stored definitions matched the rules when they ran.
