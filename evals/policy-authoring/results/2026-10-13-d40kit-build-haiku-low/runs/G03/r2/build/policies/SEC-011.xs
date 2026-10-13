policy "SEC-011" {
  title = "External requests verify TLS certificates"
  statement = "Every external request verifies the TLS certificate and host name of the server it talks to. Turning verification off is never acceptable, including for the card processor and bank-data calls."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss", "soc2"]

  rule {
    title = "Requests verify TLS certificates and hosts"
    check = "statement.param_forbidden"
    params = {
      statements: ["api.request", "stream.from_request"]
      param_names: ["verify_peer", "verify_host"]
      values: [false]
    }
  }
}
