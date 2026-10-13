policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint that reads or writes the invoices table must require a login, so no endpoint can return invoices to an anonymous caller. A deliberately public endpoint carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.auth_required"
    params = {tables: ["invoices"], except_tags: ["public"]}
  }
}
