policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "Every change to customer data is recorded in the audit_log table, and only the record_audit_event function writes to it, so the audit trail cannot be edited by other code paths."
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
