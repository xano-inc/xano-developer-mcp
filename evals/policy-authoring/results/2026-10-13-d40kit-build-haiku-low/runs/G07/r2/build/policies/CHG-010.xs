policy "CHG-010" {
  title = "Changes to users, customers, refunds and tenants are audited"
  statement = "Every edit, patch and delete of the users, customers, refunds and tenants tables calls the record_audit_event function, so each change has an entry in the audit log. A change that cannot call it must be raised with the policy owner, not exempted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["users", "customers", "refunds", "tenants"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["users", "customers", "refunds", "tenants"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["users", "customers", "refunds", "tenants"] } }
  }
}
