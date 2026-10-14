policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys and credentialed URLs are never written as literals in an object's definition. The payment processor and bank-link keys are read from workspace environment variables (for example $env.STRIPE_SECRET_KEY and $env.PLAID_SECRET). A literal found here must be moved to an environment variable and the exposed value rotated; a value reviewed as safe is exempted only by its fingerprint, by the policy owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["pci", "soc2"]

  rule {
    check = "literal.credential_shape"
    params = {}
  }
}
