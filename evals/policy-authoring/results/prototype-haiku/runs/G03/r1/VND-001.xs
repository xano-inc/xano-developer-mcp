policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests and cloud, email and AI model providers go only to the approved vendors, Stripe and Plaid. Any other destination is reported until the policy owner approves it. Related to PCI DSS 12.8 (third-party service providers). A pass means only that the stored definitions matched the allowlist when the rule ran."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "pci-dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = { hosts: ["api.stripe.com", "sandbox.plaid.com", "development.plaid.com", "production.plaid.com"] }
  }
}
