policy "SEC-011" {
  title = "External requests verify TLS certificates"
  statement = "HIPAA transmission security: outbound requests verify the peer certificate and host name, so patient data is not sent to an unverified server."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.param_forbidden"
    params = {
      statements: ["api.request", "stream.from_request"]
      param_names: ["verify_peer", "verify_host"]
      values: [false]
    }
  }
}
