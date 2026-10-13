policy "LOG-001" {
  title = "Debug logs never record request input or the logged-in user"
  statement = "Debug logs never reference request input or the logged-in user, so patient data sent in a request is not written to the logs. Log a fixed message or an identifier the policy owner has approved instead."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth"] }
  }
}
