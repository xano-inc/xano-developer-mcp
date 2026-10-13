policy "AUDIT-001" {
  title = "Changes to customer-email tables call the audit function"
  statement = "Every add, edit, patch and delete of the tables that hold customer email addresses (customers, users, newsletter_subscribers, support_tickets, patients) calls record_audit_event on every path through the endpoint, tool, task or message that makes the change, so the audit log records who changed what. This policy checks that the call is present; it does not check the actor passed to it, the values changed, or bulk writes and raw SQL, which it does not read."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.add", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"] } }
  }
}
