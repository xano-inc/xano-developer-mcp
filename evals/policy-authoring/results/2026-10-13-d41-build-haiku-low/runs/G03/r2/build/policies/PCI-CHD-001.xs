policy "PCI-CHD-001" {
  title = "Cardholder data is not logged, not stored raw, and not sent to unapproved vendors"
  statement = "Objects tagged cardholder never log request input. Card numbers, security codes, expiry and cardholder names are never stored in a table. Objects tagged cardholder send requests only to Stripe and Plaid."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    title = "Cardholder objects never log request input"
    check = "statement.expression_rule"
    params = {
      statements: ["debug.log"]
      param_names: ["value"]
      must_not_reference: ["$input"]
      tags: ["cardholder"]
    }
  }

  rule {
    title = "Card numbers and security codes are never stored"
    check = "table.field_attribute_required"
    params = {
      field_names: ["card_number", "card_cvv", "card_expiry", "cardholder_name"]
      forbidden: true
    }
  }

  rule {
    title = "Cardholder objects send requests only to Stripe and Plaid"
    check = "outbound.vendor_allowlist"
    params = {
      kinds: ["http"]
      hosts: ["api.stripe.com", "production.plaid.com"]
      tags: ["cardholder"]
    }
  }
}
