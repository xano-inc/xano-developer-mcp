policy "PHI-ACCESS-001" {
  title = "Objects reaching health tables record the access"
  statement = "Every endpoint, tool and task that reaches a table tagged phi calls log_phi_access unconditionally, so each access to a health record is written to phi_access_log. Related to HIPAA audit controls. Does not check who is allowed to read the records; see CONF-010 for login."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.statement_required"
    params = {functions: ["log_phi_access"], placement: "unconditional", reaching_table_tags: ["phi"]}
  }
}
