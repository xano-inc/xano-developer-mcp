policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables. Related to PCI DSS requirement 8 (credentials). A value already reviewed is exempted by its owner, never by editing the rule."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "literal.credential_shape"
  }
}
