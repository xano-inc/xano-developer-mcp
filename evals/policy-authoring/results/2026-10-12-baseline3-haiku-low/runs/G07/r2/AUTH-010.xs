policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint must require a logged-in user. An endpoint that must be public (sign-in, health check, newsletter signup) carries the `public` tag, and that exemption is signed off by the platform owner. Related to SOC 2 CC6.1 (logical access)."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
