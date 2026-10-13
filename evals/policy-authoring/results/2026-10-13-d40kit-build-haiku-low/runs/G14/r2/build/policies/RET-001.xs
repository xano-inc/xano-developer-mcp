policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log table exists, and only the record_audit_event function writes to it. Nothing else may edit, delete or insert audit entries, so the record of who changed what stays trustworthy. A caller can still pass whatever it likes to the audit function."
  severity = "high"
  active = true
  enforcement = "advisory"

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
