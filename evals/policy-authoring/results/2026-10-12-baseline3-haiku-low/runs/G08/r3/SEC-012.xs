policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables. A value already read from an environment variable is compliant. A value that was reviewed and is deliberately public is allowed only by its owner's fingerprint decision."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "literal.credential_shape"
    params = {}
  }
}
