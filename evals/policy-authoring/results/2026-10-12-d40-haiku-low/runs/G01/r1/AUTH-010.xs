policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint that reads or writes the invoices table must require a login (an auth table). An endpoint that returns invoices to anonymous callers is not allowed. This policy checks the saved authentication setting only; it does not check what a logged-in caller may see, which is the endpoint's own logic."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    title = "Endpoints that reach the invoices table require login"
    check = "object.auth_required"
    params = { tables: ["invoices"] }
  }
}
