policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires authentication, unless it or its API group is tagged public. This covers the invoices endpoints: an endpoint that returns invoices without a login must not ship."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
