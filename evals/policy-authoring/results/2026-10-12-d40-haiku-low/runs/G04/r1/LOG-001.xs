policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug and Datadog logs never reference request input or the logged-in user, so protected health information in requests does not reach log storage. Related to HIPAA audit controls and minimum necessary handling."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log", "datadog.log"], param_names: ["value", "message", "attributes"], must_not_reference: ["$input", "$auth"] }
  }
}
