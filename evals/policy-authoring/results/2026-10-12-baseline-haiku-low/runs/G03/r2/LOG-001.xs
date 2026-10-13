policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug and Datadog logs never reference request input, the logged-in user or environment variables. Cardholder data (card number, CVV, expiry, cardholder name) and bank account details arrive as request input, so they can never be logged. Log the event, not the values."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa", "gdpr", "pci-dss"]

  rule {
    check = "statement.expression_rule"
    params = {statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"]}
  }

  rule {
    check = "statement.expression_rule"
    params = {statements: ["datadog.log"], param_names: ["message"], must_not_reference: ["$input", "$auth", "$env"]}
  }
}
