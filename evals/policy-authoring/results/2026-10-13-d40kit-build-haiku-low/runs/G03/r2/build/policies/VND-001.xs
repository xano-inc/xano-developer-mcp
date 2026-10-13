policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests, cloud and email providers and AI model providers are limited to the approved vendors: Stripe (api.stripe.com) and Plaid (production.plaid.com). Adding a vendor is the policy owner's decision; a vendor outside this list is reported, not exempted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {
      hosts: ["api.stripe.com", "production.plaid.com"]
    }
  }
}
