policy "AUTH-010" {
  title = "Endpoints that read invoices require authentication"
  statement = "Every endpoint that reads the invoices table must require a login. Nothing returns invoices to an anonymous caller, including a temporary or debugging endpoint. An endpoint that is deliberately public cannot read invoices, so none is exempted here; any exemption is the policy owner's decision."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = {tables: ["invoices"]}
  }
}
