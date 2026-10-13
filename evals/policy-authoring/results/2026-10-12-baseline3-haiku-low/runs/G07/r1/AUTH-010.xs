policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint must require a login. An endpoint that is deliberately public carries the `public` tag, signed off by the platform owner. This checks the saved authentication setting only, not what a logged-in user is allowed to do, and not who has access."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
