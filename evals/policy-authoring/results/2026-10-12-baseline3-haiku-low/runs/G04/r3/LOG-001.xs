policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment variables, so no patient data or secret is written to logs. Related to HIPAA audit controls and ePHI handling. Only debug.log is checked."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }
}
