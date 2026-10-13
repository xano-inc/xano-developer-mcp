policy "PCI-003" {
  title = "Data only goes to approved vendors (Stripe and Plaid)"
  statement = "Outbound requests and cloud, email and AI model providers may only go to the vendors on the approved list: Stripe (api.stripe.com) and Plaid (production.plaid.com). Any other vendor needs a security review and an update to this policy before it receives any data, including cardholder data. Destinations outside this list are reported as not yet reviewed."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "req-12"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {
      hosts: ["api.stripe.com", "production.plaid.com"]
    }
  }
}
