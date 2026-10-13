policy "LOG-001" {
  title = "Debug logs don't contain request, user or secret data"
  statement = "Debug logs name events, not request input, the logged-in user or environment values. Health data in a log is a HIPAA leak, so log an identifier and the event instead."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }
}
