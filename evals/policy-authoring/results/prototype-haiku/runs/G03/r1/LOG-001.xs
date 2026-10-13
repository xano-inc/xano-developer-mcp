policy "LOG-001" {
  title = "Logs don't contain cardholder, request, user or secret data"
  statement = "Debug and Datadog logs never reference request input, the logged-in user or environment variables, so cardholder and bank data (PCI DSS requirement 3.4 scope) cannot reach logs. Related to PCI DSS 3.x and 10.x; a pass means only that the logging statements matched this rule when it ran."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "pci-dss"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }

  rule {
    check = "statement.expression_rule"
    params = { statements: ["datadog.log"], param_names: ["message"], must_not_reference: ["$input", "$auth", "$env"] }
  }
}
