policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys and credentialed URLs must never be written as literal values in an endpoint or function. They must come from workspace environment variables ($env), so the value is set per environment and rotated there. A value that cannot be moved is exempted only by the policy owner's decision, never by editing the code."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "pci-dss"]

  rule {
    check = "literal.credential_shape"
    params = { object_kinds: ["function", "query"] }
  }
}
