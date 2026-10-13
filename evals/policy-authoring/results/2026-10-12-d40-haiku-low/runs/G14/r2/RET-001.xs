policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log is written only by the audit function record_audit_event, so an entry in it can be trusted to say who changed which record. The audit_log table must exist for this policy to judge anything."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
