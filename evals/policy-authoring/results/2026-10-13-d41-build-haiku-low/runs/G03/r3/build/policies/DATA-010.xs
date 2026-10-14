policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "No endpoint returns card or bank fields: card_number, card_cvv, card_expiry, cardholder_name, bank_account_number or bank_routing_number. Callers that need a payment's status read stripe_payment_intent_id and status instead. Changing this list is the policy owner's decision."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "soc2", "gdpr"]

  rule {
    check = "db.output_fields_forbidden"
    params = {fields: ["card_number", "card_cvv", "card_expiry", "cardholder_name", "bank_account_number", "bank_routing_number"], object_kinds: ["query"]}
  }
}
