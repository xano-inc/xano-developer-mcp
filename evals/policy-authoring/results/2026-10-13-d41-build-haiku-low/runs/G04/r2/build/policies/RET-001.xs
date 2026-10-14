policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The phi_access_log table exists, and only the log_phi_access function writes to it. Related to HIPAA audit controls."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "workspace.object_required"
    params = {object_kind: "table", names: ["phi_access_log"]}
  }

  rule {
    check = "table.write_location_restricted"
    params = {restricted_tables: ["phi_access_log"], allowed_functions: ["log_phi_access"]}
  }
}
