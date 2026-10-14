policy "SEC-012" {
  title = "No secrets are hardcoded"
  statement = "No API key, token, password or private key may be written into a function, endpoint, task, middleware, tool or any other object. Secrets come from workspace environment variables ($env), set per environment by the owner. An object that cannot comply is fixed, not exempted; an exemption needs the policy owner's approval."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "literal.credential_shape"
  }
}
