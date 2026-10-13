policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests, cloud and email providers and AI model providers are limited to the vendors approved by the security owner. The approved vendors are Stripe (api.stripe.com) and Plaid (production.plaid.com). Adding a vendor is a decision for the policy owner, not a code change."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa", "gdpr", "pci-dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {hosts: ["api.stripe.com", "production.plaid.com"]}
  }
}
