policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table exists, and only record_audit_event writes to it, so the audit trail cannot be edited by other code. Related to SOC 2 CC8.1."
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
