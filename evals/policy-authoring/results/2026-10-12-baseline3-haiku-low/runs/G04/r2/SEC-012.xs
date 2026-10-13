policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "HIPAA safeguards: no API key, token or private key is written as a literal in an object definition. Secrets come from workspace environment variables, so they can be rotated without a code change."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "literal.credential_shape"
  }
}
