policy "LOG-001" {
  title = "Debug logs never hold request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment variables, so health data cannot leak into logs. Related to HIPAA audit and safeguards; a pass means only the stored definitions matched when it ran."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }
}
