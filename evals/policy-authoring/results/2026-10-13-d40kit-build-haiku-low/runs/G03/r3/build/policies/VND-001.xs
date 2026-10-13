policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests are limited to the approved vendors: Stripe (api.stripe.com) and Plaid (production.plaid.com). Adding a vendor is the policy owner's decision. Related to PCI DSS requirement 12.8 (service providers)."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {hosts: ["api.stripe.com", "production.plaid.com"]}
  }
}
