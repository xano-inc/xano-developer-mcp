policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings. They belong in workspace environment variables (for example $env.TWILIO_AUTH_TOKEN), set by the workspace owner. A secret found in a literal must be moved to an environment variable and rotated."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "literal.credential_shape"
  }
}
