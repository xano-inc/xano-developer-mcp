policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table exists, and only the record_audit_event function writes to it, so every recorded change to customer data comes through one place. Related to SOC 2 CC7.2 (monitoring) and CC8.1 (change management)."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc7.2", "cc8.1"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
