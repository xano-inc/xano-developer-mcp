policy "AUDIT-001" {
  title = "Customer email changes are audited"
  statement = "Every table that holds a customer email carries the customer-email tag. Anything reaching those tables requires login and calls record_audit_event, and every edit, patch and delete of them calls it, so the audit log shows who changed what."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "audit"]

  rule {
    check = "table.tag_required"
    params = {field_names: ["email", "requester_email"], field_types: ["email"], include_sensitive: false, tag: "customer-email"}
  }

  rule {
    check = "object.tagged_table_access"
    params = {table_tags: ["customer-email"], function: "record_audit_event"}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.edit", tables: ["customers", "newsletter_subscribers", "support_tickets", "users", "patients"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.patch", tables: ["customers", "newsletter_subscribers", "support_tickets", "users", "patients"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.del", tables: ["customers", "newsletter_subscribers", "support_tickets", "users", "patients"]}}
  }
}
