policy "RET-001" {
  title = "Only the audit function writes the PHI access log"
  statement = "The phi_access_log table exists, and only log_phi_access writes to it. A caller can still pass whatever values it likes to that function."
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
