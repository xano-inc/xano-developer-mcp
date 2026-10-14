policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table must exist, and only record_audit_event may write it, so no entry can be edited or deleted by other code. Related to SOC 2 CC8.1 (change management). A pass shows the stored definitions matched when it ran, not that the audit trail is complete."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
