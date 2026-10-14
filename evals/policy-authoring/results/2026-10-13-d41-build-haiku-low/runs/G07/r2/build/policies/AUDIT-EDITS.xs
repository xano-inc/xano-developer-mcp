policy "AUDIT-EDITS" {
  title = "Edits of audited records call the audit function"
  statement = "Every endpoint that edits or patches a tenant, refund, user, customer or product must call record_audit_event unconditionally in its own stack, so the change is recorded in audit_log. Deletes inside functions are not inspected by this policy. Related to SOC 2 CC8.1 (change management). A pass shows the stored definitions matched when it ran, not that every change is recorded."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.edit", tables: ["tenants", "refunds"]} }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.patch", tables: ["users", "customers", "products"]} }
  }
}
