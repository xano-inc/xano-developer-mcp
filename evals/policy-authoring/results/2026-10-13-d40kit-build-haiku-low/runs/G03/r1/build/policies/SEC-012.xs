policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings. They belong in environment variables. Card processor keys are included. A value that is already in an environment variable needs no change."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    check = "literal.credential_shape"
  }
}
