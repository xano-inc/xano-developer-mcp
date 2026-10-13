policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs name events, never the request input, the logged-in user or environment values. Patient data must not reach logs; a debug line that needs one is removed, not exempted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = {statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"]}
  }
}
