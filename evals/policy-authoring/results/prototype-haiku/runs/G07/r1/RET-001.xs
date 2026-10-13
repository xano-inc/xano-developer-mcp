policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log table exists, and only the approved audit function writes to it. Records who changed what, supporting the change-control evidence SOC 2 asks for (CC7.2, CC8.1). The check cannot see what the audit function records."
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
