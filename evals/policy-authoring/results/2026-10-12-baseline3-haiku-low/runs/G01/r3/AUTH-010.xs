policy "AUTH-010" {
  title = "Endpoints that reach the invoices table require login"
  statement = "Every endpoint that reads or returns the invoices table must require authentication. A deliberately public endpoint that reaches invoices carries the `public` tag, signed off by the platform owner. An endpoint that cannot require login is exempted by that owner decision, not by leaving auth off."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { tables: ["invoices"], except_tags: ["public"] }
  }
}
