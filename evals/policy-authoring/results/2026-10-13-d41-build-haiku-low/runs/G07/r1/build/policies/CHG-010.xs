policy "CHG-010" {
  title = "Changes to sensitive tables are audited"
  statement = "Every endpoint, function and task that edits, patches or deletes a row in users, customers, refunds or tenants calls record_audit_event unconditionally, so each change leaves a row in audit_log. An endpoint that cannot record a change is reported, not exempted: ask the policy owner before adding an exemption."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.edit", tables: ["users", "customers", "refunds", "tenants"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.patch", tables: ["users", "customers", "refunds", "tenants"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "unconditional", when: {statement: "db.del", tables: ["users", "customers", "refunds", "tenants"]}}
  }
}
