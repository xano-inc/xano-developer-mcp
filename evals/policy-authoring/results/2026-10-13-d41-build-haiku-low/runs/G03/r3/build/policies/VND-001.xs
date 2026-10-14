policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests go only to the vendors on the approved list: Stripe (api.stripe.com) for card payments and Plaid (production.plaid.com) for bank links. Any other host, including the fraud-screening vendor at api.riskscreen.example, is reported until the policy owner approves it or the call is removed. Approving a vendor is the policy owner's decision: do not add a host to this list without their sign-off."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "soc2"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {kinds: ["http"], hosts: ["api.stripe.com", "production.plaid.com"]}
  }
}
