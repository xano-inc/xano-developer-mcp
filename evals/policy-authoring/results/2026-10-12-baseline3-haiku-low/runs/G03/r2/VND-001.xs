policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests only go to vendors the business has approved for cardholder and bank data: Stripe (api.stripe.com) and Plaid (production.plaid.com). Any other destination, including email and SMS providers, is reported until the owner approves it. Adding a vendor is the policy owner's decision."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {
      hosts: ["api.stripe.com", "production.plaid.com"]
    }
  }
}
