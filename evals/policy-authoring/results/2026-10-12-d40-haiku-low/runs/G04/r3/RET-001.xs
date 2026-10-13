policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table exists, and only the record_audit_event function writes to it. Nothing else edits, deletes or adds audit entries directly, so the record of who changed what cannot be altered outside that function."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    title = "The audit log table exists"
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    title = "Only the audit function writes the audit log"
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
