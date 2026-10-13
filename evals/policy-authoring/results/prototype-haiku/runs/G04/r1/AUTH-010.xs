policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires authentication, so no patient or appointment data is reachable anonymously. A deliberately public endpoint carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
