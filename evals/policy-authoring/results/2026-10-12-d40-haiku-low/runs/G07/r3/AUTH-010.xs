policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint must require a login. A deliberately public endpoint carries the `public` tag, signed off by the platform owner. Related to SOC 2 CC6.1."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
