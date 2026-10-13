policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log table exists, and only the record_audit_event function writes to it. This keeps the change history trustworthy for auditors. Nothing else may be exempted without the policy owner's approval."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc7.2"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
