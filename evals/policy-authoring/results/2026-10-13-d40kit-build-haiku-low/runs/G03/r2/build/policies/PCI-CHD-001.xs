policy "PCI-CHD-001" {
  title = "Cardholder data is never stored raw"
  statement = "No table stores a card number, security code, expiry date or cardholder name. Card details go only to the payment processor, which returns a token that is kept instead. A table that declares one of these fields is reported until the field is removed by its owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    title = "Card number, security code, expiry and cardholder name are never stored"
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "card_cvc", "cvv", "cvc", "pan", "card_expiry", "cardholder_name"]
      forbidden: true
    }
  }
}
