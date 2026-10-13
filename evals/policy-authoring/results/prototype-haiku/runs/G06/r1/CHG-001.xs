policy "CHG-001" {
  title = "Endpoints and functions are tested"
  statement = "Every endpoint and function is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. A test that exists but fails still counts as coverage. An object that cannot be tested is exempted by its owner, never by the author of the change."
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
