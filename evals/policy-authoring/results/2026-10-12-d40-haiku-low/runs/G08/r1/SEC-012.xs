policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literal values in a function, endpoint or other object's definition, or in an agent's settings. They are read from workspace environment variables ($env) instead, and the value is set by the owner, never in code. A value already held in an environment variable is compliant. This policy recognises built-in credential shapes only (including Twilio, Stripe, AWS, OpenAI and similar keys); it does not detect a plain password typed into code, so such a password must be reviewed separately."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "pci_dss"]

  rule {
    check = "literal.credential_shape"
    params = {}
  }
}
