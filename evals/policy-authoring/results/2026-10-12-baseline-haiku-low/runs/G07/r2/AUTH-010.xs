policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires a logged-in user, unless it or its API group is tagged public. Public endpoints (login, health, newsletter signup) carry the public tag. Related to SOC 2 CC6.1 (logical access)."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
