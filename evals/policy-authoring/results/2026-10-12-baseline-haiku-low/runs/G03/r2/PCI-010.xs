policy "PCI-010" {
  title = "Cardholder data is not stored raw"
  statement = "Table schemas never declare a raw card number (PAN), card verification code (CVV) or bank account number as a field. Card data is kept only as a processor token (for example a Stripe payment method id) or a masked value such as the last four digits. Sensitive authentication data such as the CVV is never stored, even encrypted. A field that must hold raw data is an exception for the policy owner, not a fix."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["card_number", "card_cvv", "bank_account_number"], forbidden: true}
  }
}
