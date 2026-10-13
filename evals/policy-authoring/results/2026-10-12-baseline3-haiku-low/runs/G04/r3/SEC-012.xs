policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in environment variables. Related to HIPAA safeguards for ePHI."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "literal.credential_shape"
  }
}
