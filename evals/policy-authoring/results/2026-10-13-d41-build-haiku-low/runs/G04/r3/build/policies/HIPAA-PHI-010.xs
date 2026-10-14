policy "HIPAA-PHI-010" {
  title = "Endpoints reaching phi tables record each access"
  statement = "Every object that reaches a table tagged phi calls log_phi_access unconditionally, so each read of a health record is written to phi_access_log."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.statement_required"
    params = {functions: ["log_phi_access"], placement: "unconditional", reaching_table_tags: ["phi"]}
  }
}
