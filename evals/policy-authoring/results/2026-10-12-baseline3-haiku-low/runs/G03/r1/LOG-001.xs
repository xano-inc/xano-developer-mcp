policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment variables. Cardholder data (card number, CVV, expiry, cardholder name) arrives as request input, so it must never reach a debug log. Related to PCI DSS: cardholder data must not be written to logs."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "statement.expression_rule"
    params = {statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"]}
  }
}
