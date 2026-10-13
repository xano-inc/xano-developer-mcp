policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment variables. Cardholder data (card number, CVV, expiry, cardholder name) arrives as request input, so it can't reach a debug or Datadog log. Related to PCI DSS; a pass only means the stored definitions matched the rule when it ran."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log"]
      param_names: ["value"]
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }

  rule {
    check = "statement.expression_rule"
    params = {
      statements: ["datadog.log"]
      param_names: ["message"]
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
