policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table must exist, and only the record_audit_event function may write to it. The audit log is the record of who changed customer data. This checks where writes are defined, not what a caller passes in, and it does not check that every change is audited."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc7.2"]

  rule {
    title = "The audit log table exists"
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    title = "Only the audit function writes it"
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
