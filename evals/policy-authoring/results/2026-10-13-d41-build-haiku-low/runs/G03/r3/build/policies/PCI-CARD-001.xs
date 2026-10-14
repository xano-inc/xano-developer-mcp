policy "PCI-CARD-001" {
  title = "Cardholder data is tagged, never stored raw, and kept out of logs"
  statement = "Cardholder data is kept out of the workspace's stored schema and logs. Any table with a card number, CVV, expiry or cardholder name carries the pci tag. No table stores a full card number (card_number, pan) or a security code (card_cvv, cvv, cvc); a card is held only as a processor token and its last four digits. Datadog log messages and attributes never reference request input, the logged-in user or environment values. Stored raw card data is reported here until it is removed: removing it is the owner's decision because it changes stored data."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci"]

  rule {
    check = "table.tag_required"
    params = {field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name"], tag: "pci"}
  }

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["card_number", "card_cvv", "cvv", "cvc", "pan"], forbidden: true}
  }

  rule {
    check = "statement.expression_rule"
    params = {statements: ["datadog.log"], param_names: ["message", "attributes"], must_not_reference: ["$input", "$auth", "$env"]}
  }
}
