policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "Only record_email_change writes the email_change_log audit table."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["email_change_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["email_change_log"], allowed_functions: ["record_email_change"] }
  }
}
