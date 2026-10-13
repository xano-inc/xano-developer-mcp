policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints never fetch card numbers, security codes, expiry dates or cardholder names, or any field marked sensitive in its table's schema. Card details are shown to callers only as the processor's token or last four digits."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    check = "db.output_fields_forbidden"
    params = {
      fields: ["card_number", "card_cvv", "card_expiry", "cardholder_name"]
      object_kinds: ["query"]
    }
  }
}
