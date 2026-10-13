policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table exists, and only the record_audit_event function writes to it, so access and change history for health data cannot be altered through other paths. Related to HIPAA audit controls. The function does not record who read a record; that needs a separate access-log function."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
