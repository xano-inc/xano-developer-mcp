policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log table exists, and only the function record_audit_event writes to it. Audit entries therefore come from one place. This supports SOC 2 CC7.2 (monitoring) as evidence of a change record; it does not show that the log is reviewed."
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
