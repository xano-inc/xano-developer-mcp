policy "PCI-CARD-001" {
  title = "Card and bank data is never stored"
  statement = "No table declares a card number, card security code, card expiry, cardholder name, or bank account or routing number. Related to PCI DSS requirement 3 (protect stored account data). Removing a declared field loses data, so the table owner decides how to migrate; an exemption is the policy owner's decision."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "bank_account_number", "bank_routing_number"], forbidden: true}
  }
}
