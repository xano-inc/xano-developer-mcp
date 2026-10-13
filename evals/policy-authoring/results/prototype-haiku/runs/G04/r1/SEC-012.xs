policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables that the user sets."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "literal.credential_shape"
  }
}
