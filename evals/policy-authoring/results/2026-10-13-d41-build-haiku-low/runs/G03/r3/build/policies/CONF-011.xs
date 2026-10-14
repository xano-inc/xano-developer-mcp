policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The card and bank fields are marked sensitive wherever a table declares them, so DATA-010 and the saved-view checks keep them out of responses and views. Fields: card_number, card_cvv, card_expiry, cardholder_name, card_last4, bank_account_number, bank_routing_number. A field added later under a different name is not found by this rule; add it to the list."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "soc2"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "card_last4", "bank_account_number", "bank_routing_number"], attribute: "sensitive"}
  }
}
