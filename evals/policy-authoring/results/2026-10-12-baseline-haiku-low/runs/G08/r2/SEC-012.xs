policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "literal.credential_shape"
    params = {}
  }
}
