policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table exists and is written only by record_audit_event. No other endpoint, function or task may add, edit or delete an audit entry, so the change history cannot be altered by other code."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc7.2"]

  rule {
    check = "workspace.object_required"
    params = {object_kind: "table", names: ["audit_log"]}
  }

  rule {
    check = "table.write_location_restricted"
    params = {restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"]}
  }
}
