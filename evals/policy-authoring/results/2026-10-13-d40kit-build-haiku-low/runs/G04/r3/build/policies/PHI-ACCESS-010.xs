policy "PHI-ACCESS-010" {
  title = "Health data access is recorded"
  statement = "Every object that reaches a table tagged phi calls the log_phi_access function unconditionally, so each read and write of health data leaves a phi_access_log row. Related to HIPAA audit controls; this records calls, it does not check what the log later shows."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.statement_required"
    params = { functions: ["log_phi_access"], placement: "unconditional", reaching_table_tags: ["phi"] }
  }
}
