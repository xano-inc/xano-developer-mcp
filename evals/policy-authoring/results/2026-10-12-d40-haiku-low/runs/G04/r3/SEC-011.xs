policy "SEC-011" {
  title = "External requests verify TLS certificates"
  statement = "Every external request verifies the TLS certificate and host name of the server it talks to, so patient data sent to a vendor is not exposed to a man in the middle."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    title = "Requests verify TLS certificates and hosts"
    check = "statement.param_forbidden"
    params = { statements: ["api.request", "stream.from_request"], param_names: ["verify_peer", "verify_host"], values: [false] }
  }
}
