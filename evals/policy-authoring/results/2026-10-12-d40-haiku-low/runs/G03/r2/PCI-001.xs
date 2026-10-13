policy "PCI-001" {
  title = "Card numbers and security codes are never stored"
  statement = "No table may declare a field for a full card number (PAN), a card security code (CVV/CVC) or track data. Card details go straight to the payment processor, and only its token or the last four digits are kept. A field that must exist for a legitimate reason needs a named exemption and sign-off from the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "req-3"]

  rule {
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "cvv", "cvc", "pan", "track_data"],
      forbidden: true
    }
  }
}
