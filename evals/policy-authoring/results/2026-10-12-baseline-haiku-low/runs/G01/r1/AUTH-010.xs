policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint that reads or writes the invoices table must require a login (an auth table). Invoices are customer financial data, and an endpoint that returns them without auth exposes every customer's billing records. A deliberately public endpoint that touches invoices carries the `public` tag, signed off by the platform owner, and nothing else may exempt one."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    title = "Endpoints reaching invoices require login"
    check = "object.auth_required"
    params = { tables: ["invoices"], except_tags: ["public"] }
  }
}
