policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment values, so card numbers, CVVs and cardholder names never reach the log. Logging an event (for example that a charge was attempted, with the invoice id) is allowed; logging the request body is not. Applies to debug.log here; datadog.log is covered by PCI-CARD-001."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "soc2", "gdpr"]

  rule {
    check = "statement.expression_rule"
    params = {statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"]}
  }
}
