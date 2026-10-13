policy "CONF-011" {
  title = "Cardholder and bank fields are marked sensitive"
  statement = "The cardholder and bank account fields listed here are marked sensitive wherever a table declares them, so they are masked and hidden by default. Related to PCI DSS 3.4 (render stored account data unreadable). Marking a field sensitive does not encrypt it or prevent a raw value being stored; that is not checked."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["card_number", "cvv", "account_number", "routing_number"], attribute: "sensitive" }
  }
}
