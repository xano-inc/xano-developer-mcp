policy "PCI-001" {
  title = "Raw card numbers and CVVs are never stored"
  statement = "Card numbers (card_number) and card security codes (card_cvv) are never stored, not even encrypted, and are never written from request input. A card payment is taken through the processor and only its token or payment intent ID is kept. Related to PCI DSS: stored account data must be limited, and sensitive authentication data such as CVV must never be stored after authorization."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["card_number", "card_cvv"], forbidden: true}
  }

  rule {
    check = "db.write_from_input_forbidden"
    params = {fields: ["card_number", "card_cvv"]}
  }
}
