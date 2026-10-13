policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests go only to the vendors we approve: Stripe (api.stripe.com) and Plaid (production.plaid.com). Any other host, AI model provider or cloud or email provider is reported. Approving another vendor is the policy owner's decision, and card data never goes to a vendor outside this list."
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
