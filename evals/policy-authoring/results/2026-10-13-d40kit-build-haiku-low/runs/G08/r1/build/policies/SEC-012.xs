policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings. They come from workspace environment variables ($env), set by the workspace owner. An object that cannot comply is exempted by the policy owner, never by the object's author."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["secrets"]

  rule {
    check = "literal.credential_shape"
  }
}
