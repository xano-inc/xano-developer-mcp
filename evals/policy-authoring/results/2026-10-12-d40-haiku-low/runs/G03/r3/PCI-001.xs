policy "PCI-001" {
  title = "Cardholder data is never stored raw"
  statement = "No table declares a card number, security code (CVV), expiry or cardholder name. Send card details to the payment processor and keep only its token or payment intent id. A security code must never be stored, even encrypted. A table that needs one of these fields is reported; removing or retyping an existing field loses data, so the owner decides how to migrate it."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name"], forbidden: true }
  }
}
