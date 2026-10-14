policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Cardholder and bank data may be sent only to Stripe (api.stripe.com) and Plaid (production.plaid.com). Any other outbound host, AI model provider, email or cloud destination is reported until the policy owner approves it, and then it is added to the approved hosts here."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "pci-12.8"]

  rule {
    check = "outbound.vendor_allowlist"
    params = { hosts: ["api.stripe.com", "production.plaid.com"] }
  }
}
