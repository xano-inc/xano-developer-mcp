policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "Only the audit function, record_audit_event, writes the audit log, so each audit entry comes from one place. Nothing edits or deletes an audit entry. A change to this rule is the policy owner's decision."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }
}
