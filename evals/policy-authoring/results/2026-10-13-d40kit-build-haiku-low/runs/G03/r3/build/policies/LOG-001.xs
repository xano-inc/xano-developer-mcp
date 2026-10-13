policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment variables, so card and bank data cannot reach logs. Related to PCI DSS requirement 3 (protect stored account data). Only debug.log is checked; datadog.log is not read by this rule."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "statement.expression_rule"
    params = {statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"]}
  }
}
