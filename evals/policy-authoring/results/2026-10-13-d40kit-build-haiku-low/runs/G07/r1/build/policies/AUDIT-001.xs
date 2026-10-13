policy "AUDIT-001" {
  title = "Changes to refunds and users are recorded"
  statement = "Every edit, patch and delete of the refunds and users tables calls the record_audit_event function unconditionally, so each change lands in the audit log. A change that cannot call it must be raised with the policy owner, not exempted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["refunds", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["refunds", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["refunds", "users"] } }
  }
}
