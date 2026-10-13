policy "AUTH-010" {
  title = "Endpoints that reach invoices require login"
  statement = "Every endpoint that reads or writes the invoices table must require a login, so no invoice data is returned to an anonymous caller. The rule has no exemption: an endpoint reaching invoices cannot be public. Endpoints that reach invoices only through a function or addon are judged too."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.auth_required"
    params = { tables: ["invoices"] }
  }
}
