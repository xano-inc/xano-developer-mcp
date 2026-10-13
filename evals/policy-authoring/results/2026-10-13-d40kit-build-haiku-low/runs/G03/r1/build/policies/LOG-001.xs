policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs record events, never request input, the logged-in user or environment values. Card numbers, security codes and cardholder names must never reach a log."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log"],
      param_names: ["value"],
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
