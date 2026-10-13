policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs (such as a password inside a URL) are never written as literals in a function or endpoint definition or in agent settings; they come from workspace environment variables ($env). A value that cannot move to an environment variable is exempted only by its reviewed fingerprint, set by the policy owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "secrets"]

  rule {
    check = "literal.credential_shape"
    params = {}
  }
}
