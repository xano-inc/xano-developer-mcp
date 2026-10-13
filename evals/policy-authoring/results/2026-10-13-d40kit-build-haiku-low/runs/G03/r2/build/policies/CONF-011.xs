policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "Card-adjacent fields that are still stored, such as card_last4, are marked sensitive wherever a table declares them, so they stay out of saved views and logs."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    title = "Listed fields are marked sensitive"
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_last4"]
      attribute: "sensitive"
    }
  }
}
