policy "PCI-010" {
  title = "Cardholder data is never stored raw or logged"
  statement = "No table declares a card number, security code, CVC or PAN, or the cardholder's name or card expiry. Card details go straight to the payment processor, which returns a token, and only the token and last four digits are kept. Datadog log messages and attributes never include request input, so card details cannot reach the logs."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    title = "Card numbers and security codes are never stored"
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "cvv", "cvc", "pan"],
      forbidden: true
    }
  }

  rule {
    title = "Cardholder name and expiry are never stored"
    check = "table.field_attribute_required"
    params = {
      field_names: ["cardholder_name", "card_expiry"],
      forbidden: true
    }
  }

  rule {
    title = "Datadog logs never include request input"
    check = "statement.expression_rule"
    params = {
      statements: ["datadog.log"],
      param_names: ["message", "attributes"],
      must_not_reference: ["$input"]
    }
  }
}
