policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests, cloud and email providers and AI model providers are limited to the approved vendors. The approved vendors for cardholder and bank data are Stripe (api.stripe.com) and Plaid (production.plaid.com). Any other destination needs the policy owner's approval before it is added. Related to PCI DSS: cardholder data may only go to approved third-party service providers."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {hosts: ["api.stripe.com", "production.plaid.com"]}
  }
}
