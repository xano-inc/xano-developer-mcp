policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests and cloud, email and AI model providers may only go to the approved vendors. Approved on this branch: Stripe (api.stripe.com) and Plaid (production.plaid.com). Any other destination is reported until the policy owner approves it, and cardholder or bank data must never go to an unapproved vendor."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {hosts: ["api.stripe.com", "production.plaid.com"]}
  }
}
