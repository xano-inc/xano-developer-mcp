policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment variables. Card numbers, security codes and cardholder names arrive as request input, so they must never reach a log. An object that cannot comply is fixed by logging an event name instead of its input."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "pci-10"]

  rule {
    title = "Debug logs name events, not input, auth or env"
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }
}
