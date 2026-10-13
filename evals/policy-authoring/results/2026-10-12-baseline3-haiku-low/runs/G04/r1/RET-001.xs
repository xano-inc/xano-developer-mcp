policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table must exist, and only the record_audit_event function may write to it. Audit records are only trustworthy if one reviewed path writes them."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa", "164.312-b"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
