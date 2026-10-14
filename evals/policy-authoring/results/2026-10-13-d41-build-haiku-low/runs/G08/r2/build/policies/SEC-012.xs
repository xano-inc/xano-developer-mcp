policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables. An object that cannot comply is fixed by moving its secret into an environment variable, not exempted."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "pci_dss"]

  rule {
    check = "literal.credential_shape"
    params = {}
  }
}
