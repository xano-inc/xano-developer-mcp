policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs must name events, not request input, the logged-in user or environment values. Patient data must never reach a log."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    title = "Logs name events, not input, auth or env"
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log"]
      param_names: ["value"]
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
