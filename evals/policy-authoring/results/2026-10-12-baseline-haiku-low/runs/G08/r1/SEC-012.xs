policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "API keys, tokens, private keys, encryption keys and credentialed URLs are never written as literals in an object's definition or agent settings; they belong in workspace environment variables ($env). A value that is already read from $env is compliant. Passwords typed into code are caught only when they match a known credential shape or appear as literal keys; a generic password string is not detected by this rule, so review those by hand. A value reviewed and confirmed safe may be allowed by the policy owner, never by editing this rule."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2"]

  rule {
    check = "literal.credential_shape"
  }
}
