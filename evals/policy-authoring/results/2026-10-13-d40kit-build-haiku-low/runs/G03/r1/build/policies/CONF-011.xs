policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The card-adjacent and bank fields we keep are marked sensitive wherever a table declares them, so saved views and responses treat them as sensitive."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_last4", "bank_account_number", "bank_routing_number"],
      attribute: "sensitive"
    }
  }
}
