policy "AUDIT-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log table audit_log exists, and only record_audit_event writes to it. Nothing else adds, edits or deletes an audit entry. Evidence of who changed what depends on this."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1", "audit"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
