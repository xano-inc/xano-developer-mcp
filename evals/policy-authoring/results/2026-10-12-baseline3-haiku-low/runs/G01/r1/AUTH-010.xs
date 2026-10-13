policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires authentication, unless it or its API group is tagged public. A deliberately public endpoint carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
