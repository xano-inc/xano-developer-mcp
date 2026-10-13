policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs must never be written as literal values in a function or endpoint. They must be read from workspace environment variables ($env). A value already held in an environment variable is compliant. A value that is reviewed and genuinely not a secret may be allowed only by the policy owner, by its fingerprint."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "secrets"]

  rule {
    check = "literal.credential_shape"
  }
}
