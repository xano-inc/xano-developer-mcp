policy "SEC-014" {
  title = "Login tokens expire within an hour"
  statement = "HIPAA automatic logoff: every login token expires within one hour of being created, so an unattended session stops working. The login endpoint's token lifetime is set to at most 3600 seconds."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.param_bound"
    params = {
      statements: ["security.create_auth_token"]
      param_names: ["expiration"]
      min: 1
      max: 3600
      unit: "seconds"
    }
  }

  rule {
    check = "statement.param_bound"
    params = {
      statements: ["security.jws_encode", "security.jwe_encode", "security.jwe_encode_legacy", "mvp:crypto_jws_encode", "mvp:crypto_jwe_encode2"]
      param_names: ["ttl"]
      min: 1
      max: 3600
      unit: "seconds"
    }
  }
}
