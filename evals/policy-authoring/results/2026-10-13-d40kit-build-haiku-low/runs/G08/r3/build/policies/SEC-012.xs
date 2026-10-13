policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables. Read them with $env in the object, and let the owner set and rotate their values."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "pci-dss"]

  rule {
    check = "literal.credential_shape"
  }
}
