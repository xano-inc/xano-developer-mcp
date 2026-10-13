policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "An audit log table named audit_log must exist, and only the record_audit_event function may write to it. Who changed a record is then recorded by one approved path."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "audit"]

  rule {
    check = "workspace.object_required"
    params = {
      object_kind: "table",
      names: ["audit_log"]
    }
  }

  rule {
    check = "table.write_location_restricted"
    params = {
      restricted_tables: ["audit_log"],
      allowed_functions: ["record_audit_event"]
    }
  }
}
