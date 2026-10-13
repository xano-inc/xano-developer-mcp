policy "audit-customer-data-changes" {
  title = "Changes to customer data are recorded in the audit log"
  statement = "Every endpoint or function that adds, edits or deletes a record in customers, payments, invoices, orders or users calls record_audit_event unconditionally, so each change is logged with who made it. This supports SOC 2 CC8.1 (change management) and CC7.2 (monitoring). It shows the change is logged, not that the change was approved or who reviewed the log."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1", "cc7.2"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.add", tables: ["customers", "payments", "invoices", "orders", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "payments", "invoices", "orders", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "payments", "invoices", "orders", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "payments", "invoices", "orders", "users"] } }
  }
}
