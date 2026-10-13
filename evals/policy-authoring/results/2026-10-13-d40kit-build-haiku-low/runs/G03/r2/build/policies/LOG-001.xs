policy "LOG-001" {
  title = "Logs don't contain request, user or secret data"
  statement = "Debug logs never reference request input, the logged-in user or environment variables. Cardholder data is request input, so it never reaches a log. Log the event, not the payload."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    title = "Logs name events, not input, auth or env"
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log"]
      param_names: ["value"]
      must_not_reference: ["$input", "$auth", "$env"]
    }
  }
}
