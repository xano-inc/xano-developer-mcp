policy "SEC-011" {
  title = "External requests verify TLS certificates"
  statement = "Every external request verifies the TLS certificate and host name of the server it talks to. Cardholder data and bank details travel only over verified TLS, so no api.request or stream.from_request may turn off verify_peer or verify_host."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci", "soc2"]

  rule {
    check = "statement.param_forbidden"
    params = {statements: ["api.request", "stream.from_request"], param_names: ["verify_peer", "verify_host"], values: [false]}
  }
}
