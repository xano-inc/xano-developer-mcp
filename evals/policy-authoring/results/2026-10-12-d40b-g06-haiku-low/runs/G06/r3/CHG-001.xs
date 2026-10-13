policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. The check confirms a test exists and asserts; it does not confirm the test passes or what it asserts."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["soc2"]

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query"] }
  }

  rule {
    check = "test.assertion_required"
  }
}
