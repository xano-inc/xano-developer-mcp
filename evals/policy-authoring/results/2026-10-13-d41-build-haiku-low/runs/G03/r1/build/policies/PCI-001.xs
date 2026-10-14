policy "PCI-001" {
  title = "Cardholder data is never stored raw"
  statement = "Cardholder data (card number, security code, expiry, cardholder name) must never be stored raw in a table. Keep only the processor's token and the last four digits. A table that declares one of these fields is reported until the field is removed or moved to the processor."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "pci-3.2"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "pan", "cvv", "cvc"], forbidden: true }
  }
}
