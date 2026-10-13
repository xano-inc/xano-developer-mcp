policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys and encryption keys are never written as literals in an object's definition. They belong in environment variables, set by the workspace owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "literal.credential_shape"
  }
}
