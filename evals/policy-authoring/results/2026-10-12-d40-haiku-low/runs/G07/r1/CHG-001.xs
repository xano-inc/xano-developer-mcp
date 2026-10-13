policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint is covered by a workflow or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. A test that exists is not proof it passes; it is evidence that changes are checked before release."
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
