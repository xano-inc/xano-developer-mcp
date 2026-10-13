policy "PCI-001" {
  title = "Card numbers, security codes and cardholder details are never stored"
  statement = "No table declares a card number, security code, card expiry or cardholder name. Card details go straight to the payment processor, which returns a token that is stored instead. A table that must hold one of these fields is a policy owner's decision, not an exemption added to this policy."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    title = "Card numbers, security codes and cardholder details are never stored"
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "cvv", "cvc", "pan", "card_expiry", "cardholder_name"]
      forbidden: true
    }
  }
}
