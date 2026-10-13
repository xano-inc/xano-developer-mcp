policy "AUTH-010" {
  title = "Endpoints that reach invoices require login"
  statement = "Every endpoint that reads the invoices table, directly or through a function it calls, must require a login. Invoices are customer financial records and must never be returned to an anonymous caller. An endpoint that cannot require a login must not reach the invoices table; exempting one is the policy owner's decision."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.auth_required"
    params = { tables: ["invoices"] }
  }
}
