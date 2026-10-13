policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The cardholder fields are marked sensitive wherever a table declares them, so they are kept out of responses and saved views. Marking a field does not make it safe to store: PCI-001 forbids storing card numbers, security codes, expiry dates and cardholder names."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    title = "Listed fields are marked sensitive"
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name"]
      attribute: "sensitive"
    }
  }
}
