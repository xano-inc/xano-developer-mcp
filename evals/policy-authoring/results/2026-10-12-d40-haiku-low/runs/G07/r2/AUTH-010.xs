policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires authentication, unless it or its API group is tagged public. Access to the app is limited to logged-in users, which supports SOC 2 CC6.1 (logical access). This shows which endpoints require login; it does not show who reviews or approves those logins."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
