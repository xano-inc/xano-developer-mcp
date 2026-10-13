policy "PCI-001" {
  title = "Cardholder and bank account data is not stored raw"
  statement = "Card numbers, card security codes, card expiry dates, cardholder names and bank account and routing numbers must not be stored as fields in any table. Store a processor token or the last four digits instead. The check reads field names only: it cannot tell whether a stored field is encrypted, and a card number held under a different field name is not found."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "bank_account_number", "bank_routing_number"], forbidden: true}
  }
}
