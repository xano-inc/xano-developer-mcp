policy "CHANGE-AUDIT" {
  title = "Changes to customers, users and tenants are audited"
  statement = "Every edit, patch or delete of the customers, users or tenants tables calls record_audit_event unconditionally, so each change has an audit entry naming who made it. Related to SOC 2 CC8.1."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "users", "tenants"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "users", "tenants"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "users", "tenants"] } }
  }
}
