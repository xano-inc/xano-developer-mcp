policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "Keys, tokens, passwords and credentials must never be written as literal values in an object; they belong in workspace environment variables (HIPAA security management and encryption safeguards, 45 CFR 164.312). The owner sets the value and rotates any exposed one."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "literal.credential_shape"
  }
}
