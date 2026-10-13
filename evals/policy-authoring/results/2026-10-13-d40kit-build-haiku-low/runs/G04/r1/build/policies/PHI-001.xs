policy "PHI-001" {
  title = "Objects reaching health tables record each access"
  statement = "Every endpoint, function or task that reaches a table tagged phi calls log_phi_access unconditionally, so each read and write of health data leaves a row in phi_access_log. An object that cannot record the access is not exempted here; its owner decides."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.statement_required"
    params = {functions: ["log_phi_access"], placement: "unconditional", reaching_table_tags: ["phi"]}
  }
}
