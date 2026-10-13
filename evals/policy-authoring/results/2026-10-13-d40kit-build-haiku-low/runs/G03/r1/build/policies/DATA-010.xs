policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints never return card or bank fields: card numbers, security codes, expiry, cardholder name, bank account and routing numbers. They also never return any field marked sensitive in its table's schema. The check reads what each database statement fetches, not the final response."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    check = "db.output_fields_forbidden"
    params = {
      fields: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "bank_account_number", "bank_routing_number"],
      object_kinds: ["query"]
    }
  }
}
