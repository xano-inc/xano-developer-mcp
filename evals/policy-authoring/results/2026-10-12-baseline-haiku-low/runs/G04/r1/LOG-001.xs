policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs must name the event, never the request input, the logged-in user or environment secrets, because logs can hold PHI and credentials (HIPAA audit and safeguard duties, 45 CFR 164.312). Log the event name and record id instead."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }
}
