policy "AUDIT-TRAIL-COVERAGE" {
  title = "Changes to customer and user records are audited"
  statement = "Every edit, patch and delete of the customers and users tables calls record_audit_event unconditionally, so each change to those records writes a row to audit_log. Other tables are not audited by this policy."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "users"] } }
  }
}
