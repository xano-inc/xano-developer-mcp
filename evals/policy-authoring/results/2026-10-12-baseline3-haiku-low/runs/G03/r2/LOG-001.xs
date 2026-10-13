policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug and Datadog logs never reference request input, the logged-in user or environment variables. Cardholder data (card number, CVV, expiry, cardholder name) and bank account numbers are request input, so they must never reach a log. Log the event, not the values."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log", "datadog.log"],
      param_names: ["value", "message"],
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
