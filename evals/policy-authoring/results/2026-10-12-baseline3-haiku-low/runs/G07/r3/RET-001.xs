policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit_log table may only be written by the record_audit_event function, so the change history is written in one place and cannot be edited through other endpoints or functions. Supports SOC 2 CC7.2/CC8.1 (monitoring and change records). It does not prove every change to customer data is logged; see the reply."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc7.2", "cc8.1"]

  rule {
    check = "workspace.object_required"
    params = {
      object_kind: "table"
      names: ["audit_log"]
    }
  }

  rule {
    check = "table.write_location_restricted"
    params = {
      restricted_tables: ["audit_log"]
      allowed_functions: ["record_audit_event"]
    }
  }
}
