policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint is exercised by a test that asserts something, so a change to an endpoint is checked before it ships. An endpoint that cannot be tested yet is raised with the policy owner, not exempted."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query"] }
  }

  rule {
    check = "test.assertion_required"
  }
}
