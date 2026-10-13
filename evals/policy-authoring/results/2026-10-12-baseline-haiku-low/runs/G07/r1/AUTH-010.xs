policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint must require a logged-in user. An endpoint that must be public (login, health check, newsletter signup) carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
