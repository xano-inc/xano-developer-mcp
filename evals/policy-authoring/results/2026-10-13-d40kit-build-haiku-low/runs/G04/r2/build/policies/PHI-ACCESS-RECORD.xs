policy "PHI-ACCESS-RECORD" {
  title = "Objects reaching health data record the access"
  statement = "Every endpoint, function or task that reaches a phi-tagged table calls log_phi_access on every path, so each read or write of health data leaves a row in phi_access_log. Name the logged-in user as the actor."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.statement_required"
    params = { functions: ["log_phi_access"], placement: "unconditional", reaching_table_tags: ["phi"] }
  }
}
