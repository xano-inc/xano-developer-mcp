policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The card and bank fields are marked sensitive wherever a table declares them. Related to PCI DSS requirement 3 (protect stored account data). Reads the table schemas only."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "card_last4", "bank_account_number", "bank_routing_number"], attribute: "sensitive"}
  }
}
