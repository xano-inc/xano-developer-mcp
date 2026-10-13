policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings. They belong in environment variables, such as the payment processor's secret key."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci_dss"]

  rule {
    check = "literal.credential_shape"
  }
}
