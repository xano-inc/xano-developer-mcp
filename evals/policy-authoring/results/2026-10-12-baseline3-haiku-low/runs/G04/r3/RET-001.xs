policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table exists, and only the record_audit_event function writes to it. Related to HIPAA audit controls for ePHI. A caller can still pass whatever values it likes to that function; this rule checks where the writes are defined, not what they contain."
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
    title = "Only the audit function writes it"
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
