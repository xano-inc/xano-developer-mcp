policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint requires a logged-in caller, unless it or its API group is tagged public. A deliberately public endpoint carries the public tag, signed off by the policy owner. This is the access-control evidence for the access review."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
