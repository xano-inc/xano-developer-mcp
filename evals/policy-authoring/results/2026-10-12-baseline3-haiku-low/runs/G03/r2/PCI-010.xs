policy "PCI-010" {
  title = "Cardholder and bank account data is not stored raw"
  statement = "Card numbers, CVVs, card expiry dates, cardholder names and bank account or routing numbers must not be stored as plain fields in any table. Store a processor token instead (for example Stripe's payment method id). A field that holds one of these values under another name is not caught by this rule."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "bank_account_number", "bank_routing_number"],
      forbidden: true
    }
  }
}
