policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table must exist, and only the record_audit_event function may write to it, so every change to patient data is recorded by one path."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    title = "The audit log table exists"
    check = "workspace.object_required"
    params = {
      object_kind: "table"
      names: ["audit_log"]
    }
  }

  rule {
    title = "Only the audit function writes the audit log"
    check = "table.write_location_restricted"
    params = {
      restricted_tables: ["audit_log"]
      allowed_functions: ["record_audit_event"]
    }
  }
}
