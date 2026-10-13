policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests, cloud and email providers and AI model providers are limited to the vendors you approve. Approved for cardholder and bank data: Stripe (api.stripe.com) and Plaid (production.plaid.com). Any other host or provider is reported until the policy owner approves it here; approving a vendor is the owner's decision, not a code change."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = { hosts: ["api.stripe.com", "production.plaid.com"] }
  }
}
