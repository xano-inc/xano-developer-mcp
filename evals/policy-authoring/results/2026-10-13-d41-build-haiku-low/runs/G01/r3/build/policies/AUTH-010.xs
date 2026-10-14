policy "AUTH-010" {
  title = "Endpoints that reach invoices require authentication"
  statement = "Every endpoint that reads or writes the invoices table, directly or through a function it calls, must require a login. An endpoint that returns invoices to anonymous callers is a finding. Making such an endpoint public is a deliberate decision for its owner, not something to do by removing this rule."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.auth_required"
    params = { tables: ["invoices"] }
  }
}
