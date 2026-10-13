policy "SEC-014" {
  title = "Login tokens expire within an hour"
  statement = "Every authentication token expires within one hour of being created, and every signed token (JWS or JWE) within the lifetime the owner chooses. Related to HIPAA automatic logoff for ePHI sessions. A token-signing object that must live longer is exempted by the policy owner, never by its own tag."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    title = "Tokens expire within one hour"
    check = "statement.param_bound"
    params = { statements: ["security.create_auth_token"], param_names: ["expiration"], min: 1, max: 3600, unit: "seconds" }
  }

  rule {
    title = "Signed tokens expire"
    check = "statement.param_bound"
    params = { statements: ["security.jws_encode", "security.jwe_encode", "security.jwe_encode_legacy", "mvp:crypto_jws_encode", "mvp:crypto_jwe_encode2"], param_names: ["ttl"], min: 1, max: 3600, unit: "seconds" }
  }
}
