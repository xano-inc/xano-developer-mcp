policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "HIPAA audit controls: the audit_log table exists, and only the record_audit_event function writes to it, so the record of who changed patient data cannot be edited by other code paths."
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
    params = {
      restricted_tables: ["audit_log"]
      allowed_functions: ["record_audit_event"]
    }
  }
}
