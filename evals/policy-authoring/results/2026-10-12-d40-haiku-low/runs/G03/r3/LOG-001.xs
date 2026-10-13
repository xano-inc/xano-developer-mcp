policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug and Datadog logs never reference request input, the logged-in user or environment variables. Cardholder data (card number, security code, expiry, cardholder name) arrives as request input, so it can never reach a log. Logging a whole input is reported even when it is not card data: log a named event instead."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    title = "Debug logs name events, not input, auth or env"
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }

  rule {
    title = "Datadog logs name events, not input, auth or env"
    check = "statement.expression_rule"
    params = { statements: ["datadog.log"], param_names: ["message", "attributes"], must_not_reference: ["$input", "$auth", "$env"] }
  }
}
