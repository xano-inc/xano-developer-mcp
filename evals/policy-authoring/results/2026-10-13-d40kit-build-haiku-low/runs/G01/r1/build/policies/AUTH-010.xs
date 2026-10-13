policy "AUTH-010" {
  title = "Endpoints require authentication"
  statement = "Every endpoint that reaches the invoices table must require a login. A deliberately public endpoint carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1", "hipaa"]

  rule {
    check = "object.auth_required"
    params = {tables: ["invoices"]}
  }
}
