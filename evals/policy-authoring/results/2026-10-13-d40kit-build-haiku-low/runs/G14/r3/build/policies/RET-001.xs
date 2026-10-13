policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log table audit_log must exist. Only the record_audit_event function may write to it, and no statement may edit, delete or truncate an audit entry. Audit entries are append-only."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
