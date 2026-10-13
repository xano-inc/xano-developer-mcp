policy "CHG-001" {
  title = "Endpoints and functions are tested"
  statement = "Every endpoint and function is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. Checks that a test calls each object and asserts after the call, not that the assertion is right."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query", "function"] }
  }

  rule {
    check = "test.assertion_required"
  }
}
