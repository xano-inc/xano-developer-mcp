policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests, cloud and email providers and AI model providers are limited to the approved vendors. Today that is Stripe (api.stripe.com) and Plaid (production.plaid.com). Adding a vendor is the policy owner's decision: it is not added here by a developer."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {
      hosts: ["api.stripe.com", "production.plaid.com"]
    }
  }
}
