policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests, cloud and email providers and AI model providers are limited to the approved vendors: Stripe and Plaid. Cardholder data never goes to any other vendor. Related to PCI DSS third-party service provider requirements; the check sees destinations, not what is sent."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {
      hosts: ["api.stripe.com", "production.plaid.com"]
    }
  }
}
