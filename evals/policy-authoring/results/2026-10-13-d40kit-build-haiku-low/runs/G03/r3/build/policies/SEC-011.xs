policy "SEC-011" {
  title = "External requests verify TLS certificates"
  statement = "External requests never switch off TLS certificate or host checks, so card and bank data sent to a processor is protected in transit. Related to PCI DSS requirement 4 (encryption in transit)."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["pci-dss"]

  rule {
    check = "statement.param_forbidden"
    params = {statements: ["api.request", "stream.from_request"], param_names: ["verify_peer", "verify_host"], values: [false]}
  }
}
