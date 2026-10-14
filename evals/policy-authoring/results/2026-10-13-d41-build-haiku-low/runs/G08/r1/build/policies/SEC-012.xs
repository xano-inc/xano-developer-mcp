policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables. An object that cannot comply is exempted by its owner, never by the rule."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "pci_dss"]

  rule {
    check = "literal.credential_shape"
  }
}
