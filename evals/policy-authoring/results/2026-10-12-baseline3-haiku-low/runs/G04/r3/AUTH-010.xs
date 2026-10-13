policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires authentication, unless it is deliberately open to anonymous callers and carries the `public` tag, signed off by the platform owner. Related to HIPAA access control for ePHI."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
