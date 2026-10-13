policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table exists, and only the record_audit_event function writes to it, so the record of who changed customer data is kept in one place. Related to SOC 2 CC7.2 (monitoring of system changes)."
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
    params = {
      restricted_tables: ["audit_log"],
      allowed_functions: ["record_audit_event"]
    }
  }
}
