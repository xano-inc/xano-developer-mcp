policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint is exercised by a test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. A test that exists but fails still counts toward coverage."
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
