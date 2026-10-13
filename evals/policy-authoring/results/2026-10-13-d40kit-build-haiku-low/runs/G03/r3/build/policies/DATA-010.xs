policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints never fetch the card and bank fields, or any field marked sensitive. Related to PCI DSS requirement 3 (protect stored account data). Judges what each database statement fetches in the endpoint and the functions it calls, not the final response."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "db.output_fields_forbidden"
    params = {object_kinds: ["query"], fields: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "bank_account_number", "bank_routing_number"]}
  }
}
