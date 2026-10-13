policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "HIPAA audit and safeguards: debug logs name events only. A debug log never records request input, the logged-in user or an environment value, since those can carry patient data or secrets."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log"]
      param_names: ["value"]
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
