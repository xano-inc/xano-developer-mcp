policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Logs never record request input, the logged-in user or environment values. Card numbers, security codes and cardholder details are never logged, whether to debug logs or to Datadog. Log the event and the record id, not the input."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    title = "Logs name events, not input, auth or env"
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log"]
      param_names: ["value"]
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }

  rule {
    title = "Datadog logs name events, not input, auth or env"
    check = "statement.expression_rule"
    params = {
      statements: ["datadog.log"]
      param_names: ["message", "attributes"]
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
