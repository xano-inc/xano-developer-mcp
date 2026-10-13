policy "PCI-002" {
  title = "Logs never contain request, user or secret data"
  statement = "Debug and Datadog logs must not reference request input, the logged-in user or environment values. Card numbers, security codes, cardholder names and similar data must never reach a log. Log the event (for example, that a charge was attempted for an invoice) and not the payload."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "req-10"]

  rule {
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log", "datadog.log"],
      param_names: ["value", "message", "attributes"],
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
