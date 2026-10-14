policy "AUDIT-002" {
  title = "Changes to audited tables are recorded"
  statement = "Every edit, patch and delete of the audited tables refunds, customers, tenants and users calls record_audit_event unconditionally in the same stack, so each change leaves an audit_log entry. Audit entries are never edited or deleted. A change this check cannot see (a write in a function that is not an endpoint or task) is not covered; say so before relying on it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1", "audit"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["refunds", "customers", "tenants", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["refunds", "customers", "tenants", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["refunds", "customers", "tenants", "users"] } }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], statements: ["db.edit", "db.patch", "db.add_or_edit", "db.del", "db.truncate", "db.bulk.update", "db.bulk.patch", "db.bulk.delete"] }
  }
}
