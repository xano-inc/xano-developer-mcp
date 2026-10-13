policy "PCI-001" {
  title = "Cardholder data is not stored raw"
  statement = "Card numbers, card security codes (CVV), card expiry dates and cardholder names are never stored as fields in a table. Keep the processor's token and the last four digits instead. Related to PCI DSS storage requirements. The check reads field names in the table schemas only, so it cannot see encryption or a differently named field."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name"]
      forbidden: true
    }
  }
}
