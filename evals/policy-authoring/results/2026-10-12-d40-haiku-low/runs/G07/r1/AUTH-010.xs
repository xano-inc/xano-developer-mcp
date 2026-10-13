policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires authentication, unless it or its API group is tagged public. A public endpoint carries the public tag, set by its owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
