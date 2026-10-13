policy "SEC-011" {
  title = "External requests verify TLS certificates"
  statement = "Every external request verifies the TLS certificate and host name of the server it talks to, so health data sent to other services is not exposed to interception. Related to HIPAA transmission security."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.param_forbidden"
    params = { statements: ["api.request"], param_names: ["verify_peer", "verify_host"], values: [false] }
  }
}
