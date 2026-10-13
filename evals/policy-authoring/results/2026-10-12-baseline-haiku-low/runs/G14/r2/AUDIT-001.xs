policy "AUDIT-001" {
  title = "Changes to customer email tables are audited"
  statement = "Every write to a table that stores customer email addresses must call record_audit_event unconditionally in the same stack, so the audit_log records who changed which record. Tables covered: customers, users, newsletter_subscribers, support_tickets and patients. A write that cannot call the audit function must be routed through a function that does, or be exempted by the policy owner; do not remove the write to pass."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["audit"]

  rule {
    title = "Inserts into email tables are audited"
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.add", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }

  rule {
    title = "Edits of email tables are audited"
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }

  rule {
    title = "Patches of email tables are audited"
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }

  rule {
    title = "Deletes from email tables are audited"
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }
}
