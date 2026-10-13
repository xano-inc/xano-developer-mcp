policy "AUDIT-010" {
  title = "Changes to customer and user records are audited"
  statement = "Every edit or delete of a customer or user record must call record_audit_event straight after the write, so the audit_log table holds who changed what and when. Only record_audit_event may write audit_log, so entries cannot be added, edited or removed any other way. This is an audit trail of changes, not proof that a change was reviewed or approved. An object that cannot record its change is reported, and exempting it is the policy owner's decision."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }

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
